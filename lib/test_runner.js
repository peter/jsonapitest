var api_call = require('./api_call'),
    async = require('async'),
    util = require('./util'),
    logger = require('./loggers/console');

var runTest = function(context, suite, test, next) {
  context.logger.test.start(suite, test);
  async.mapSeries(test.api_calls, function(apiCall, next) {
    context.data.$api_call_id = util.digest();
    api_call.run(context, suite, test, apiCall, next);
  }, next);
};

var runSuite = function(context, suite, next) {
  async.mapSeries(suite.tests, function(test, next) {
    runTest(context, suite, test, next);
  }, next);
};

var allResults = function(context) {
  return function(err, results) {
    if (err && err.stack) console.log(err.stack);
    results = util.flatten(results);
    var success = (err == null);
    context.logger.all.end(success, results);
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  };
};

exports.run = function(context) {
  context.data.$run_id = util.digest();
  context.logger = logger(context.config);
  async.mapSeries(context.suites, function(suite, next) {
    runSuite(context, suite, next);
  }, allResults(context));
};
