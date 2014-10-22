"use strict";
var util = require('./util'),
    validator = require('./validator');

exports.schema = function(select, value) {
  return {error_messages: validator.validate(select, value)};
};

exports.equal = function(select, value) {
  return util.equalValues(select, value);
};

var equal_keys = function(select, value) {
  return util.all(value, function(expectedValue, key) {
    var actualValue = (util.isObject(select) ? util.nestedValue.get(select, key) : null);
    return util.equalValues(actualValue, expectedValue);
  });
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
    return util.any(select, function(v) { return equal_keys(v, value) });
  } else {
    return contains(select, value);
  }
};

exports.length = function(select, value) {
  return select != null && select.length != null && select.length === value;
};
