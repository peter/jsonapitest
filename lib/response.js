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

var assert = function(assertion, response, customFunctions) {
  var selectValue = select(response, (assertion.select || 'body'));
  return assertHelper.errors(assertion, selectValue, customFunctions);
};
exports.assert = assert;

var assertAll = function(apiCall, response, customFunctions) {
  var errors = [],
      assertions = apiCall.assert || [];
  if (!util.isArray(assertions)) assertions = Array(assertions);
  if (apiCall.status) assertions = assertions.concat([{select: "status", equal: apiCall.status}]);
  assertions.forEach(function(assertion) {
    errors = errors.concat(assert(assertion, response, customFunctions));
  });
  return errors;
};
exports.assertAll = assertAll;

exports.process = function(apiCall, response, context) {
  //console.log("response.process: response=" + JSON.stringify(response));
  if (apiCall.save) save(apiCall.save, response, context.data);
  return assertAll(apiCall, response, util.loadModule(context, 'assert_functions'));
};
