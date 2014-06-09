var api_call = require('./api_call'),
    async = require('async'),
    util = require('./util'),
    logger = require('./loggers/console');

exports.run = function(context) {
  context.suites.forEach(function(suite) {
    suite.tests.forEach(function(test) {
      async.mapSeries(test.api_calls, function(apiCallRaw, next) {
        var apiCall = api_call.parse(apiCallRaw, context);
        api_call.run(apiCall, context.data, logger.apiCallResult(context, suite, test, apiCall, next));
      }, function(err, results) {
        if (err) throw err;
        var success = !util.any(results, function(result) { return result.errors.length > 0; });
        logger.allResults(context)(success, results);
        if (success) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
    });
  });
};
