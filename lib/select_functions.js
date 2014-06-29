var util = require('./util');

var applyPattern = function(value, response) {
  var matchValue = (typeof response === 'object' ? JSON.stringify(response) : response);
  var match = new RegExp(value).exec(matchValue);
  if (match !== null) {
    // If the pattern has captured groups - return the first one - otherwise return the whole match
    return (match.length > 1 ? match[1] : match[0]);
  } else {
    return null;      
  }
};

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
