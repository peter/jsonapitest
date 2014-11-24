"use strict";
var util = require('./util'),
    validator = require('./validator'),
    schema = require('./schema'),
    interpolate = require('./interpolate'),
    callbacksHelper = require('./callbacks_helper');

var emptyContext = function() {
  return {data: {}, config: {}, suites: [], options: {}, paths: []};
};
exports.emptyContext = emptyContext;

var assertValidSchema = function(value, s) {
  var errors = validator.validate(value, s);
  if (errors.length > 0) {
    var errorMessage = "required schema not matched: " + JSON.stringify(errors.map(function(e) { return e })) + " schema=" + JSON.stringify(s);
    util.raise("invalid_schema", errorMessage);
  }
};

var addSuite = function(context, suite) {
  assertValidSchema(suite, schema.suite);
  var currentSuite = util.find(context.suites, {name: suite.name});
  if (currentSuite) {
    if (suite.description) currentSuite.description = suite.description;
    currentSuite.tests = currentSuite.tests.concat(suite.tests);
  } else {
    context.suites.push(suite);
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
      addSuite(context, value);
      break;
    case 'suites':
      value.forEach(function(suite) {
        addSuite(context, suite);
      });
      break;
    case 'options':
      assertValidSchema(value, schema.options);
      context.options = util.deepMerge(context.options, value);
      break;
    case 'paths':
      if (value && value.length > 0) context.paths = context.paths.concat(value);
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
