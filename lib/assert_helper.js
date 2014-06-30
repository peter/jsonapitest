"use strict";
var util = require('./util'),
    assertFunctions = require('./assert_functions');

var functionKeys = function(assert) {
  return util.reject(util.keys(assert), function(key) { return key === 'select' });
};
exports.functionKeys = functionKeys;

var NOT_PREFIX = 'not_';

var parseFunction = function(key, value) {
  var result = {key: key, value: value};
  if (key.indexOf(NOT_PREFIX) === 0) {
    result.positive = false;
    result.functionName = key.substring(NOT_PREFIX.length, key.length);
  } else {
    result.positive = true;
    result.functionName = key;
  }
  return result;
};
exports.parseFunction = parseFunction;

var parseFunctions = function(assertion) {
  return util.map(functionKeys(assertion), function(key) {
    return parseFunction(key, assertion[key]);
  });
};
exports.parseFunctions = parseFunctions;

var assertValid = function(positive, result) {
  if (positive) {
    return result.error_messages ? result.error_messages.length === 0 : result;
  } else {
    return result.error_messages ? result.error_messages.length > 0 : !result;
  }
};

var errors = function(assertion, selectValue, customFunctions) {
  customFunctions = customFunctions || {};
  return util.compact(util.map(parseFunctions(assertion), function(a) {
    var fn = customFunctions[a.functionName] || assertFunctions[a.functionName],
        result = null;
    if (fn == null) throw new util.Error('assert_function_missing', 'Could not find assert function ' + a.functionName + ' for assert ' + JSON.stringify(assertion));
    result = fn(selectValue, a.value);
    if (!assertValid(a.positive, result)) {
      var error = {type: a.key, select: assertion.select, expected: a.value, actual: selectValue};
      if (result.error_messages) error.error_messages = result.error_messages;
      return error;
    } else {
      return null;
    }
  }));
};
exports.errors = errors;
