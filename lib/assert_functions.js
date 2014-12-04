"use strict";
var util = require('./util'),
    duckType = require('assert-duck-type').duckType,
    validator = require('./validator');

exports.schema = function(select, value) {
  return {error_messages: validator.validate(select, value)};
};

exports.equal = function(select, value) {
  return util.equalValues(select, value);
};

var equal_keys = function(select, value) {
  var invalidKeys = [];
  util.each(value, function(expectedValue, key) {
    var actualValue = (util.isObject(select) ? util.nestedValue.get(select, key) : null);
    if (!util.equalValues(actualValue, expectedValue)) invalidKeys.push(key);
  });
  if (invalidKeys.length > 0) {
    return {error_messages: ["Invalid keys: " + invalidKeys.join(', ')]};
  } else {
    return {error_messages: []};
  }
};
exports.equal_keys = equal_keys;

var contains = function(select, value) {
  if (select == null) {
    return false;
  } else if (util.isArray(select)) {
    return util.any(select, function(v) { return util.equalValues(v, value) });
  } else {
    return JSON.stringify(select).indexOf(value) >= 0;
  }
};
exports.contains = contains;

exports.contains_keys = function(select, value) {
  if (util.isArray(select)) {
    return util.any(select, function(v) { return equal_keys(v, value).error_messages.length === 0 });
  } else {
    return contains(select, value);
  }
};

exports.size = function(select, value) {
  return select != null && select.length != null && select.length === value;
};

exports.type = function(select, value) {
  var validType = duckType(value, select);
  if (validType) {
    return {error_messages: []};
  } else {
    return {error_messages: ["Select value " + JSON.stringify(select) + " does not match type " + value]};
  }
};
