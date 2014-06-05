var api_call = require('./api_call'),
    async = require('async'),
    util = require('./util');

exports.run = function(context) {
  context.suites.forEach(function(suite) {
    suite.tests.forEach(function(test) {
      async.mapSeries(test.api_calls, function(apiCallRaw, next) {
        var apiCall = api_call.parse(apiCallRaw, context);
        api_call.run(apiCall, context.data, function(err, result) {
          console.log("suite=" + suite.name + " test=" + test.name + " apiCall=" + JSON.stringify(apiCall) + " result=" + JSON.stringify(result));
          next(err, result);
        });
      }, function(err, results) {
        if (err) throw err;
        console.log("\ntest_runner results=" + JSON.stringify(results));
        if (util.any(results, function(result) { return result.errors.length > 0; })) {
          console.log("\nFAILURE!");
          process.exit(1);
        } else {
          console.log("\nSUCCESS!");
          process.exit(0);
        }
      });
    });
  });
};
