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
    key = matches[0].slice(2, matches[0].length-2); // drop the double curlys
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

exports.array_merge = function(hash, name) {
  // If hash[name] is not an array then exception
  // If all hash[name] items are not objects then exception
  // TODO: replace hash[name] with util.merge.apply(null, [{}].concat(hash[name]))
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
