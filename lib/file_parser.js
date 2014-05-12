var fs = require('fs'),
    util = require('./util'),
    schema = require('./schema'),
    validator = require('./validator'),
    assert = require('assert');

var emptyContext = function() {
  return {data: {}, config: {}, suites: []};
};
exports.emptyContext = emptyContext;

var FileParserError = function(code, message) {
  this.code = code;
  this.message = message;
  this.toString = function() {
    return this.message;
  };
};
exports.Error = FileParserError;
      
var readFile = function(path) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch(err) {
    if (err.code === 'ENOENT') {
      throw new FileParserError("file_not_found", "could not read file " + path + " " + err.message);  
    } else {
      throw new FileParserError("invalid_json", "could not parse JSON from file " + path + " " + err.message);
    }
  }
};

var parseFile = function(context, file) {
  util.each(file.data, function(value, property) {
    try {
      handleProperty(context, property, value);
    } catch(err) {
      var errorCode = err.code || "invalid_schema";
      throw new FileParserError(errorCode, "could not parse " + property + " in file " + file.path + " - " + err.message);
    }
  });
};

var assertValidSchema = function(value, s) {
  var errors = validator.validate(value, s);
  if (errors.length > 0) {
    var errorMessage = "required schema not matched: " + JSON.stringify(errors.map(function(e) { return e })) + " schema=" + JSON.stringify(s);
    throw new FileParserError("invalid_schema", errorMessage);
  }
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
      value.forEach(function(suite) {
        assertValidSchema(suite, schema.suite);
        context.suites.push(value);    
      });
      break;
    default:
      throw new FileParserError("invalid_root_property", "unknown top level property " + property);
  }
};
exports.handleProperty = handleProperty;

exports.read = function(paths) {
  if (paths == null || paths.length == 0) throw new FileParserError("missing_paths", "please provide at least one input file path");
  var context = emptyContext(),
      files = paths.map(function(path) { return {path: path, data: readFile(path)}});
  files.forEach(function(file) {
    parseFile(context, file);
  });
  return context;
};
