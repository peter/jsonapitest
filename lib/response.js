var util = require('./util'),
    schema = require('./schema'),
    validator = require('./validator');

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

// Example assertions:
// {
//   "select": "body",
//   "schema": "{{schema.user}}",
//   "equal": {
//     "id": "{{users.member.id}}",
//     "email": "{{users.member.email}}"
//   }
// }
var assert = function(assertion, response) {
  var errors = [],
      selectValue = select(response, (assertion.select || 'body')),
      schemaErrors = null;

  if (assertion.schema) {
    schemaErrors = validator.validate(selectValue, assertion.schema);
    if (schemaErrors.length > 0) {
      errors.push({type: 'schema', errors: JSON.stringify(schemaErrors)});
    }
  }

  if (assertion.equal && !util.equalValues(selectValue, assertion.equal)) {
    errors.push({type: 'equal', select: assertion.select, expected: assertion.equal, actual: selectValue});
  }
  if (assertion.not_equal && util.equalValues(selectValue, assertion.not_equal)) {
    errors.push({type: 'not_equal', select: assertion.select, expected: assertion.not_equal, actual: selectValue}); 
  }
  if (assertion.equal_keys) {
    util.each(assertion.equal_keys, function(expectedValue, key) {
      var actualValue = (selectValue != null ? util.nestedValue.get(selectValue, key) : null);
      if (!util.equalValues(actualValue, expectedValue)) {
        errors.push({type: 'equal', select: assertion.select, key: key, expected: expectedValue, actual: actualValue});
      }
    });
  }

  if (assertion.length && (selectValue == null || selectValue.length == null || selectValue.length !== assertion.length)) {
    errors.push({type: "length", select: assertion.select, expected: assertion.length, actual: (selectValue && selectValue.length)});
  }

  if (assertion.contains && !util.any(selectValue, function(v) { return util.equalValues(v, assertion.contains) })) {
    errors.push({type: 'contains', select: assertion.select, expected: assertion.contains, actual: selectValue});
  }
  if (assertion.not_contains && util.any(selectValue, function(v) { return util.equalValues(v, assertion.not_contains) })) {
    errors.push({type: 'not_contains', select: assertion.select, expected: assertion.not_contains, actual: selectValue});
  }

  return errors;
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
exports.assert = assert;

exports.process = function(apiCall, response, data) {
  //console.log("response.process: response=" + JSON.stringify(response));
  if (apiCall.save) save(apiCall.save, response, data);
  return assertAll(apiCall, response);
};
