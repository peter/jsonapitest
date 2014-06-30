var _ = require('lodash'),
    u = require('util'),
    crypto = require('crypto');

exports.isArray = _.isArray;
exports.isObject = _.isObject;
exports.each = _.each;
exports.map = _.map;
exports.merge = _.merge;
exports.deepClone = _.deepClone;
exports.uniq = _.uniq;
exports.contains = _.contains;
exports.every = _.every;
exports.cloneDeep = _.cloneDeep;
exports.any = _.any;
exports.all = _.all;
exports.reject = _.reject;
exports.flatten = _.flatten;
exports.compose = _.compose;
exports.keys = _.keys;
exports.compact = _.compact;

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
      result[key] = (value2 === undefined ? value1 : value2);
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
var nestedValue = (function() {
  var assertValidArgs = function(hash, nestedKey) {
    if (hash == null || typeof hash !== 'object') {
      throw new UtilError('nested_value_invalid_hash', 'Expected object as hash argument but got ' + hash + " nestedKey=" + nestedKey);
    }
    if (nestedKey == null || typeof nestedKey !== 'string') {
      throw new UtilError('nested_value_invalid_key', 'Key must be a string on the format a.b.c');
    }
  },
  parseKeys = function(nestedKey) {
    return nestedKey.split('.');
  };

  return {
    get: function(hash, nestedKey) {
      assertValidArgs(hash, nestedKey);
      var keys = parseKeys(nestedKey),
          result = hash;
      _.each(keys, function(key) {
        if (_.isArray(result) && !isArrayIndex(key)) {
          result = _.map(result, function(item) { return item[key] });
        } else {
          result = result[key];  
        }        
        if (!result) return false; // break out of the loop
      });
      return result;
    },

    set: function(hash, nestedKey, value) {
      assertValidArgs(hash, nestedKey);
      var keys = parseKeys(nestedKey),
          nested = hash;
      _.each(keys, function(key, i) {
        if (i == keys.length - 1) {
          nested[key] = value;
        } else {
          nested[key] = nested[key] || {};
        }
        nested = nested[key];
      });
    }
  };
})();
exports.nestedValue = nestedValue;

// See: http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
var escapeRegExp = function(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};
exports.escapeRegExp = escapeRegExp;

var replaceAll = function(find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
exports.replaceAll = replaceAll;

var equalValues = function(value1, value2) {
  if (value1 == null && value2 == null) {
    // both values are null/undefined
    return true;
  } else if (value1 != null && value2 != null) {
    if (_.isObject(value1) && _.isObject(value2)) {
      // both values are objects
      return _.isEqual(value1, value2);
    } else if (!_.isObject(value1) && !_.isObject(value2)) {
      // both values are primitves - compare as strings
      return value1.toString() === value2.toString();
    } else {
      // one value is an object, the other isn't
      return false;
    }
  } else {
    // one is null/undefined, the other isn't
    return false;
  }
};
exports.equalValues = equalValues;

exports.jsonPretty = function(object) {
  return JSON.stringify(object, null, 2);
};

exports.digest = function(options) {
  options = options || {};
  var seed = options.seed || (Date.now().toString() + '-' + Math.random().toString());
  return crypto.createHash('md5').update(seed).digest('hex');
};

var isArrayIndex = function(value) {
  return value != null && ((_.isNumber(value) && value % 1 === 0 && value >= 0) || (typeof value === 'string' && value.match(/^0$|^[1-9][0-9]*$/)));
};
exports.isArrayIndex = isArrayIndex;

var isUrl = function(value) {
  return value != null && value.match(/^https?:\/\//);
};
exports.isUrl = isUrl;

var loadedModules = {};

exports.loadModule = function(context, key) {
  if (loadedModules[key]) return loadedModules[key];
  var path = nestedValue.get(context.config, ('modules.' + key)),
      logFunction = nestedValue.get(context.logger, 'module.loaded');
  if (key === 'http_client') {
    path = path || './http_clients/superagent';
    if (path.indexOf('/') === -1) path = './http_clients/' + path;
  }
  if (path == null) return null;
  loadedModules[key] = require(path);
  if (logFunction) logFunction(key, path);
  return loadedModules[key];
};
