var util = require('./util');

exports.interpolate = function(value, data) {
  if (value == null || typeof value !== 'string') {
    throw new util.Error('interpolate_non_string', 'Can only interpolate strings but got value=' + value);
  }
  var result = value,
      matches = util.uniq(value.match(/{{\s*[\w\._-]+\s*}}/g)),
      key = null,
      replaceValue = null;
  matches.forEach(function(match) {
    key = matches[0].slice(2, matches[0].length-2).trim(); // drop the double curlys, allow leading/trailing whitespace
    replaceValue = util.nestedValue(data, key);
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

exports.arrayMerge = function(array, name) {
  if (!util.isArray(array)) {
    throw new util.Error("array_merge_invalid_array", "Expected array argument but got " + array);
  }
  var result = {};
  array.forEach(function(hash) {
    if (!util.isObject(hash)) {
      throw new util.Error("array_merge_invalid_array", "Expected array to only contain objects but got " + hash);
    }
    result = util.deepMerge(result, hash);
  });
  return result;
};

exports.parse = function() {
  // TODO: return a fully expanded data representation of the API request with data variable interpolations etc.
  // 1. Do variable interpolations: "path": "/v1/users/{{users.member.id}}"
  // 2. Handle reuse through named items in arrays: ["{{headers.member_auth}}", {"Content-Type": "multipart/form-data"}]
};

exports.run = function() {
  // TODO: make request with request client
  // TODO: make assertions
};
