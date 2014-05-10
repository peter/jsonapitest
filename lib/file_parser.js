var fs = require('fs'),
    util = require('./util'),
    schema = require('./schema'),
    validator = require('./validator'),
    assert = require('assert');
      
var readFile = function(path) {
  try {
    return JSON.parse(fs.readFileSync(path));    
  } catch(err) {
    console.log("ERROR: could not parse JSON from file " + path + " " + err.message);
    process.exit(1);    
  }
};

var parseFile = function(context, file) {
  util.each(file.data, function(value, property) {
    try {
      handleProperty(context, property, value);
    } catch(err) {
      console.log("ERROR: could not parse " + property + " in file " + file.path + " - " + err.message);
      process.exit(1);
    }
  });
};

var assertValidSchema = function(value, s) {
  var errors = validator.validate(value, s);
  if (errors.length > 0) throw new Error("required schema not matched: " + JSON.stringify(errors.map(function(e) { return e.desc })) + " schema=" + JSON.stringify(s));
};

var handleProperty = function(context, property, value) {
  switch(property) {
    case 'data':
      assertValidSchema(value, schema.data);
      util.merge(context.data, value);
      break;
    case 'config':
      assertValidSchema(value, schema.config);
      util.merge(context.config, value);
      break;
    case 'suite':
      assertValidSchema(value, schema.suite);
      context.suites.push(value);
      break;
    case 'suites':
      assertValidSchema(value, schema.suite);
      context.suites = context.suites.concat(value);
      break;
    default:
      throw new Error("unknown top level property " + property);
  }
};

exports.read = function(paths) {
  var context = {data: {}, config: {}, suites: []},
      files = paths.map(function(path) { return {path: path, data: readFile(path)}});
  files.forEach(function(file) {
    parseFile(context, file);
  });
  return context;
};
