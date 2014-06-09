var api_call = require('./api_call'),
    async = require('async'),
    util = require('./util'),
    logger = require('./loggers/console');

var runTest = function(context, log, suite, test, next) {
  async.mapSeries(test.api_calls, function(apiCallRaw, next) {
    var apiCall = api_call.parse(apiCallRaw, context);
    log.api_call.start(suite, test, apiCall);
    api_call.run(suite, test, apiCall, context.data, function(err, result) {
      log.api_call.end(suite, test, apiCall, err, result);
      next(err, result);
    });
  }, next);
};

var runSuite = function(context, log, suite, next) {
  async.mapSeries(suite.tests, function(test, next) {
    runTest(context, log, suite, test, next);
  }, next);
};

var allResults = function(context, log) {
  return function(err, results) {
    if (err && err.stack) console.log(err.stack);
    results = util.flatten(results);
    var success = (err == null);
    log.all.end(success, results);
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  };
};

exports.run = function(context) {
  var log = logger(context);
  async.mapSeries(context.suites, function(suite, next) {
    runSuite(context, log, suite, next);
  }, allResults(context, log));
};
