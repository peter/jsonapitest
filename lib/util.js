var _ = require('lodash'),
    u = require('util');

exports.isArray = _.isArray;
exports.isObject = _.isObject;
exports.each = _.each;
exports.merge = _.merge;
exports.deepClone = _.deepClone;
exports.uniq = _.uniq;
exports.contains = _.contains;
exports.every = _.every;
exports.cloneDeep = _.cloneDeep;

// Non-destructive recursive merge of objects (intended for JSON type data objects/hashes)
var deepMerge = function(object1, object2) {
  var object1 = object1 || {},
      object2 = object2 || {},
      result = {},
      value1 = null,
      value2 = null;
  _.uniq(Object.keys(object1).concat(Object.keys(object2))).forEach(function(key) {
    value1 = object1[key];
    value2 = object2[key];
    if (value1 && value2 && (_.isObject(value1) && !_.isArray(value1)) && (_.isObject(value2) && !_.isArray(value2))) {
        result[key] = deepMerge(value1, value2);
    } else {
      result[key] = (value2 == null ? value1 : value2);
      if (result[key] && _.isObject(result[key])) result[key] = _.cloneDeep(result[key]);    
    }
  });
  return result;
};
exports.deepMerge = deepMerge;

// See http://stackoverflow.com/questions/8458984/how-do-i-get-a-correct-backtrace-for-a-custom-error-class-in-nodejs
var UtilError = function(code, message) {
  Error.call(this); //super constructor
  Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

  this.code = code;
  this.message = message;
  this.toString = function() {
    return this.message;
  };
};
u.inherits(UtilError, Error);
exports.Error = UtilError;

// Allows nested value lookup in object given a dot separated key, i.e. 'a.b.c' yields the lookup hash['a']['b']['c']
exports.nestedValue = function(hash, nestedKey) {
  if (hash == null || typeof hash !== 'object') {
    throw new UtilError('nested_value_invalid_hash', 'Expected object as hash argument but got ' + hash + " nestedKey=" + nestedKey);
  }
  if (nestedKey == null || typeof nestedKey !== 'string') {
    throw new UtilError('nested_value_invalid_key', 'Key must be a string on the format a.b.c');
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
