var util = require('./util');

// Example selector:
// selector = {
//  select: "headers.Location",
//  pattern: "(\d+)$"
// }
var select = function(response, selector) {
  if (typeof selector.select !== 'string') {
    throw new util.Error('response_select_not_string', 'The select attribute needs to be a string but was ' + selector.selct + ' for response ' + JSON.stringify(response));
  }
  var value = util.nestedValue.get(response, selector.select);
  if (selector.pattern != null) {
    var match = new RegExp(selector.pattern).exec(value);
    if (match !== null) {
      // If the pattern has captured groups - return the first one - otherwise return the whole match
      return (match.length > 1 ? match[1] : match[0]);
    } else {
      return null;      
    }
  } else {
    return value;
  }
};
exports.select = select;

// Example response:
// response = {
//   save: {
//     "users.new.id": {
//       selector = {
//        select: "headers.Location",
//        pattern: "(\d+)$"
//       }      
//     }
//   }
// }
exports.save = function(response, data) {
  util.each(response.save, function(selector, key) {
    util.nestedValue.set(data, key, select(response, selector));
  });
};

