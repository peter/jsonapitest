var util = require('./util'),
    selectHelper = require('./select_helper'),
    assertHelper = require('./assert_helper');

var select = function(response, selector) {
  return selectHelper.select(response, selector);
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
