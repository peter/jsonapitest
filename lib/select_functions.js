"use strict";
var util = require('./util');

var applyPattern = function(value, response) {
  if (response == null) return undefined;
  var matchValue = (typeof response === 'object' ? JSON.stringify(response) : response);
  var match = new RegExp(value).exec(matchValue);
  if (match !== null) {
    // If the pattern has captured groups - return the first one - otherwise return the whole match
    return (match.length > 1 ? match[1] : match[0]);
  } else {
    return undefined;
  }
};

var validSortKeys = ['order', 'by', 'type'];

var sortFunction = function(value) {
  return function (a, b) {
    if (value.by) {
      a = a[value.by];
      b = b[value.by];
    }
    if (value.order === 'desc') {
      var temp = a;
      a = b;
      b = temp;
    }
    if (value.type === 'time') {
      a = new Date(a);
      b = new Date(b);
    }

    if (a === b) {
        return 0;
    }
    if (typeof a === typeof b) {
      return a < b ? -1 : 1;
    }
    return typeof a < typeof b ? -1 : 1;
  };
};

exports.orderedFunctions = ['key', 'sort', 'limit', 'pattern'];

exports.key = function(value, response) {
  return util.nestedValue.get(response, value);
};

exports.pattern = function(value, response) {
  if (util.isArray(response)) {
    return util.map(response, function(item) { return applyPattern(value, item)});
  } else {
    return applyPattern(value, response);
  }    
};

exports.limit = function(value, response) {
  if (!util.isArray(response)) throw new util.Error('select_limit_non_array', 'Limit select function expected array but got ' + JSON.stringify(response));
  return response.slice(0, value);
};

exports.sort = function(value, response) {
  if (!util.isArray(response)) throw new util.Error('select_sort_non_array', 'Sort select function expected array but got ' + JSON.stringify(response));
  if (typeof value === 'string') {
    value = {order: value};
  } else {
    value.order = value.order || 'asc';
    if (!util.all(util.keys(value), function(k) { return util.contains(validSortKeys, k) })) throw new Error('select_sort_invalid', 'Sort select can only contain keys ' + JSON.stringify(validSortKeys) + ' but got ' + JSON.stringify(value));
  }
  if (!util.contains(['asc', 'desc'], value.order)) throw new util.Error('select_sort_invalid', 'Expected asc or desc sort order but got ' + JSON.stringify(value));
  if (value.type && value.type !== 'time') throw new util.Error('select_sort_invalid', 'Currently only sort type "time" is supported but got ' + value.type);
  return response.sort(sortFunction(value));
};
