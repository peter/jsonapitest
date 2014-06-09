var api_call = require('./api_call'),
    async = require('async'),
    util = require('./util'),
    logger = require('./loggers/console');

var runTest = function(context, suite, test, next) {
  async.mapSeries(test.api_calls, function(apiCallRaw, next) {
    var apiCall = api_call.parse(apiCallRaw, context);
    api_call.run(suite, test, apiCall, context.data, logger.apiCallResult(context, suite, test, apiCall, next));
  }, next);
};

var runSuite = function(context, suite, next) {
  async.mapSeries(suite.tests, function(test, next) {
    runTest(context, suite, test, next);
  }, next);
};

var allResults = function(context) {
  return function(err, results) {
    if (err) throw err;
    results = util.flatten(results);
    var success = !util.any(results, function(result) { return result.errors.length > 0; });
    logger.allResults(context)(success, results);
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  };
};

exports.run = function(context) {
  async.mapSeries(context.suites, function(suite, next) {
    runSuite(context, suite, next);
  }, allResults(context));
};
