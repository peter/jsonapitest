var util = require('../util');

// Invoked after each api call
exports.apiCallResult = function(context, suite, test, apiCall, next) {
  return function(err, result) {
    var status = result.errors.length > 0 ? "FAILURE!" : "OK",
        prefix = suite.name + "/" + test.name + ": ";
    console.log(prefix + status);
    if (result.errors.length > 0) {
      console.log("\n" + prefix + "API_CALL:\n")
      console.log(util.jsonPretty(apiCall));
      console.log("\n" + prefix + "RESPONSE:\n")
      console.log(util.jsonPretty(result));
      console.log("\n\n")
    }
    next(err, result);
  };
};

// Invoked when all api calls are completed
exports.allResults = function(context) {
  return function(success, results) {
    if (success) {
      console.log("SUCCESS!");
    } else {
      console.log("FAILURE!");
    }
  };
};
