var util = require('./util'),
    assertHelper = require('./assert_helper');

var assertValidSelector = function(response, selector) {
  if (selector.key == null) {
    throw new util.Error('response_select_invalid', 'Selector needs to contain key property ' + JSON.stringify(selector) + ' for response ' + JSON.stringify(response));
  } else if (!util.all(util.keys(selector), function(key) { return util.contains(['key', 'pattern'], key) })) {
    throw new util.Error('response_select_invalid', 'Selector has invalid property ' + JSON.stringify(selector) + ' for response ' + JSON.stringify(response));
  }
};

var extractPattern = function(value, pattern) {
  var matchValue = (typeof value === 'object' ? JSON.stringify(value) : value);
  var match = new RegExp(pattern).exec(matchValue);
  if (match !== null) {
    // If the pattern has captured groups - return the first one - otherwise return the whole match
    return (match.length > 1 ? match[1] : match[0]);
  } else {
    return null;      
  }
};

var select = function(response, selector) {
  if (typeof selector === 'string') {
    selector = {key: selector};
  } else {
    assertValidSelector(response, selector);
  }
  var value = util.nestedValue.get(response, selector.key);
  if (selector.pattern != null) {
    if (util.isArray(value)) {
      return util.map(value, function(v) { return extractPattern(v, selector.pattern)});
    } else {
      return extractPattern(value, selector.pattern);
    }    
  } else {
    return value;
  }
};
exports.select = select;

var save = function(options, response, data) {
  util.each(options, function(selector, key) {
    util.nestedValue.set(data, key, select(response, selector));
  });
};
exports.save = save;

var assert = function(assertion, response) {
  var selectValue = select(response, (assertion.select || 'body'));
  return assertHelper.errors(assertion, selectValue);
};
exports.assert = assert;

var assertAll = function(apiCall, response) {
  var errors = [],
      assertions = [].concat(apiCall.assert || []); // assertions is either an object or an array
  if (!util.isArray(assertions)) assertions = Array(assertions);
  // NOTE: {"status": 404} is syntactic sugar for a {"assert": {"select": "status", "equal": 404}} that gets added to arrya of assertions
  if (apiCall.status) assertions = assertions.concat([{select: "status", equal: apiCall.status}]);
  assertions.forEach(function(assertion) {
    errors = errors.concat(assert(assertion, response));
  });
  return errors;
};
exports.assertAll = assertAll;

exports.process = function(apiCall, response, data) {
  //console.log("response.process: response=" + JSON.stringify(response));
  if (apiCall.save) save(apiCall.save, response, data);
  return assertAll(apiCall, response);
};
