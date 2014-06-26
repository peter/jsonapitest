var fs = require('fs'),
    util = require('./util'),
    schema = require('./schema'),
    validator = require('./validator'),
    assert = require('assert');

var emptyContext = function() {
  return {data: {}, config: {}, suites: []};
};
exports.emptyContext = emptyContext;
      
var readFile = function(path) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch(err) {
    if (err.code === 'ENOENT') {
      throw new util.Error("file_not_found", "could not read file " + path + " " + err.message);  
    } else {
      throw new util.Error("invalid_json", "could not parse JSON from file " + path + " " + err.message);
    }
  }
};

var parseFile = function(context, file) {
  util.each(file.data, function(value, property) {
    try {
      handleProperty(context, property, value);
    } catch(err) {
      var errorCode = err.code || "invalid_schema";
      throw new util.Error(errorCode, "could not parse " + property + " in file " + file.path + " - " + err.message);
    }
  });
};
exports.parseFile = parseFile;

var assertValidSchema = function(value, s) {
  var errors = validator.validate(value, s);
  if (errors.length > 0) {
    var errorMessage = "required schema not matched: " + JSON.stringify(errors.map(function(e) { return e })) + " schema=" + JSON.stringify(s);
    throw new util.Error("invalid_schema", errorMessage);
  }
};

var handleProperty = function(context, property, value) {
  switch(property) {
    case 'data':
      assertValidSchema(value, schema.data);
      context.data = util.deepMerge(context.data, value);
      break;
    case 'config':
      assertValidSchema(value, schema.config);
      context.config = util.deepMerge(context.config, value);
      break;
    case 'suite':
      assertValidSchema(value, schema.suite);
      context.suites.push(value);
      break;
    case 'suites':
      value.forEach(function(suite) {
        assertValidSchema(suite, schema.suite);
        context.suites.push(value);    
      });
      break;
    default:
      throw new util.Error("invalid_root_property", "unknown top level property " + property);
  }
};
exports.handleProperty = handleProperty;

exports.read = function(paths) {
  if (paths == null || paths.length == 0) throw new util.Error("missing_paths", "please provide at least one input file path");
  var context = emptyContext(),
      files = paths.map(function(path) { return {path: path, data: readFile(path)}});
  files.forEach(function(file) {
    parseFile(context, file);
  });
  return context;
};
