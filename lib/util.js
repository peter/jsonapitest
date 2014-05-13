var _ = require('lodash');

exports.each = _.each;
exports.merge = _.merge;
exports.deepClone = _.deepClone;
exports.uniq = _.uniq;

// Non-destructive recursive merge of objects (intended for JSON type data objects/hashes)
var deepMerge = function(object1, object2) {
  var result = {},
      value1 = null,
      value2 = null;
  _.uniq(Object.keys(object1).concat(Object.keys(object2))).forEach(function(key) {
    value1 = object1[key];
    value2 = object2[key];
    if (value1 && value2 && typeof value1 === 'object' && typeof value2 === 'object') {
        result[key] = deepMerge(value1, value2);
    } else {
      result[key] = value2 || value1;
      if (result[key] && typeof result[key] === 'object') result[key] = _.cloneDeep(result[key]);    
    }
  });
  return result;
};
exports.deepMerge = deepMerge;

exports.Error = function(code, message) {
  this.code = code;
  this.message = message;
  this.toString = function() {
    return this.message;
  };
};

// Allows nested value lookup in object given a dot separated key, i.e. 'a.b.c' yields the lookup hash['a']['b']['c']
exports.nestedValue = function(hash, nestedKey) {
  if (hash == null || typeof hash !== 'object') {
    throw new util.Error('nested_value_invalid_hash', 'Expected object as hash argument but got ' + hash);
  }
  if (nestedKey == null || typeof nestedKey !== 'string') {
    throw new util.Error('nested_value_invalid_key', 'Key must be a string on the format a.b.c');
  }
  var keys = nestedKey.split('.'),
      result = hash;
  _.each(keys, function(key) {
    result = result[key];
    if (!result) return false; // break out of the loop
  });
  return result;
};

// See: http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
var escapeRegExp = function(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};
exports.escapeRegExp = escapeRegExp;

var replaceAll = function(find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
exports.replaceAll = replaceAll;
