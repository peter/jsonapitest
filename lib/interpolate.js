"use strict";
var util = require('./util');

var value = function(value, data) {
  if (value == null || typeof value !== 'string') {
    throw new util.Error('interpolate_non_string', 'Can only interpolate strings but got value=' + value);
  }
  if (value.indexOf('{{') == -1) return value;
  var result = value,
      matches = util.uniq(value.match(/{{\s*[\$\w\._-]+\s*}}/g)),
      key = null,
      replaceValue = null;
  matches.forEach(function(match) {
    key = match.slice(2, match.length-2).trim(); // drop the double curlys, allow leading/trailing whitespace
    replaceValue = util.nestedValue.get(data, key);
    if (matches.length === 1 && matches[0].length === value.length) {
      // 1. If we matched the whole string, then replace it completely, possibly with a different type (i.e. object, number etc.)
      result = replaceValue;
    } else {
      // 2. Otherwise - replace all occurences of regexp with data value toString
      result = util.replaceAll(match, (replaceValue || ''), result);
    }
  });
  return result === '' ? null : result;
};
exports.value = value;

var deep = function(object, data) {
  var result = util.cloneDeep(object);
  // NOTE: using Object.keys here to work around bug where lodash.each breaks on hashes containing
  // numeric length properties, see: https://github.com/jashkenas/underscore/issues/1590
  util.each(Object.keys(object), function(key) {
    var v = object[key];
    if (typeof v === 'string') {
      result[key] = value(v, data);
    } else if (util.isObject(v)) {
      result[key] = deep(v, data);
    }
  });
  return result;
};
exports.deep = deep;
