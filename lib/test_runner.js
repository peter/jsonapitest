var api_call = require('./api_call'),
    async = require('async'),
    util = require('./util');

exports.run = function(context) {
  context.suites.forEach(function(suite) {
    suite.tests.forEach(function(test) {
      async.eachSeries(test.api_calls, function(apiCallRaw, next) {
        var apiCall = api_call.parse(apiCallRaw, context);
        api_call.run(apiCall, context.data, function(err, result) {
          console.log("suite=" + suite.name + " test=" + test.name + " apiCall=" + JSON.stringify(apiCall) + " result=" + JSON.stringify(result));
          next(err, response);
        });
      }, function(err, results) {
        if (err) throw err;
        console.log(results);
      });
    });
  });
};
