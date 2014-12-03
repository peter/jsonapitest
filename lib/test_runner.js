"use strict";

var api_call = require('./api_call'),
    async = require('async'),
    util = require('./util'),
    contextParser = require('./context_parser'),
    optionsFilter = require('./options/filter'),
    filteredSuites = optionsFilter.suites,
    filteredTests = optionsFilter.tests;

var runTest = function(context, suite, test, next) {
  context.callbacks.run('test.start', [suite, test], function() {
    async.mapSeries((test.api_calls || []), function(apiCall, next) {
      context.data.$api_call_id = util.digest();
      api_call.run(context, suite, test, apiCall, next);
    }, function(err, results) {
      context.callbacks.run('test.end', [suite, test], function() {
        // NOTE: an API call failing in a test should not halt all the other tests
        next(null, results);
      });
    });
  });
};

var runSuite = function(context, suite, next) {
  context.callbacks.run('suite.start', [suite], function() {
    async.mapSeries(filteredTests(suite, context), function(test, next) {
      runTest(context, suite, test, next);
    }, function(err, results) {
      context.callbacks.run('suite.end', [suite], function() {
        next(err, results);
      });
    });
  });
};

var allResults = function(context, callback) {
  return function(err, results) {
    if (err && err.stack) console.log(err.stack);
    results = util.flatten(results);
    var success = !util.any(results, function(result) { return result && result.errors.length > 0 });
    context.callbacks.run('all.end', [success, results], function() {
      if (callback) callback(success, results);
    });
  };
};

exports.run = function(context, callback) {
  contextParser.initialize(context);
  context.callbacks.run('all.start', [], function() {
    async.mapSeries(filteredSuites(context), function(suite, next) {
      runSuite(context, suite, next);
    }, allResults(context, callback));
  });
};
