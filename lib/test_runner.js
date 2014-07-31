"use strict";
var api_call = require('./api_call'),
    async = require('async'),
    util = require('./util'),
    logHelper = require('./log_helper'),
    contextParser = require('./context_parser');

var runTest = function(context, suite, test, next) {
  context.logger.log('test.start', [suite, test]);
  async.mapSeries(test.api_calls, function(apiCall, next) {
    context.data.$api_call_id = util.digest();
    api_call.run(context, suite, test, apiCall, next);
  }, function(err, results) {
    // NOTE: an API call failing in a test should not halt all the other tests
    next(null, results);
  });
};

var runSuite = function(context, suite, next) {
  context.logger.log('suite.start', [suite]);
  async.mapSeries(suite.tests, function(test, next) {
    runTest(context, suite, test, next);
  }, next);
};

var allResults = function(context, callback) {
  return function(err, results) {
    if (err && err.stack) console.log(err.stack);
    results = util.flatten(results);
    var success = !util.any(results, function(result) { return result && result.errors.length > 0 });
    context.logger.log('all.end', [success, results]);
    if (callback) callback(success, results);
  };
};

exports.run = function(context, callback) {
  contextParser.assertValid(context);
  context.data.$run_id = util.digest();
  context.logger = logHelper(context);
  async.mapSeries(context.suites, function(suite, next) {
    runSuite(context, suite, next);
  }, allResults(context, callback));
};
