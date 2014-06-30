"use strict";
var util = require('./util'),
    selectFunctions = require('./select_functions');

var assertValidSelector = function(response, selector) {
  if (selector.key == null) {
    throw new util.Error('response_select_invalid', 'Selector needs to contain key property ' + JSON.stringify(selector) + ' for response ' + JSON.stringify(response));
  } else if (!util.all(util.keys(selector), function(key) { return util.contains(selectFunctions.orderedFunctions, key) })) {
    throw new util.Error('response_select_invalid', 'Selector has invalid property ' + JSON.stringify(selector) + ' for response ' + JSON.stringify(response));
  }
};

exports.select = function(response, selector) {
  if (typeof selector === 'string') {
    selector = {key: selector};
  } else {
    assertValidSelector(response, selector);
  }
  var result = response;
  util.each(selectFunctions.orderedFunctions, function(key) {
    if (result == null) return false; // break out of loop
    if (selector[key] !== undefined) result = selectFunctions[key](selector[key], result);
  });
  return result;
};
