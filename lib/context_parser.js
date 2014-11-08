"use strict";
var util = require('./util'),
    validator = require('./validator'),
    schema = require('./schema'),
    interpolate = require('./interpolate'),
    callbacksHelper = require('./callbacks_helper');

var emptyContext = function() {
  return {data: {}, config: {}, suites: []};
};
exports.emptyContext = emptyContext;

var assertValidSchema = function(value, s) {
  var errors = validator.validate(value, s);
  if (errors.length > 0) {
    var errorMessage = "required schema not matched: " + JSON.stringify(errors.map(function(e) { return e })) + " schema=" + JSON.stringify(s);
    util.raise("invalid_schema", errorMessage);
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

var assertValid = function(context) {
  util.each(context, function(value, property) {
    handleProperty(emptyContext(), property, value);
  });
};
exports.assertValid = assertValid;

var initialize = function(context) {
  assertValid(context);
  context.data.$run_id = util.digest();
  context.data.$env = process.env;
  context.config = interpolate.deep(context.config, context.data);
  context.callbacks = callbacksHelper(context);
}
exports.initialize = initialize;
