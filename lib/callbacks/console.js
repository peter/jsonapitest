"use strict";
var util = require('../util'),
    fs = require('fs'),
    path = require('path');

var DELIMITER = ' - ';
var PENDING = 'PENDING!';

var stats = {
  failing_tests: 0,
  failing_suites: [],
  tests: 0,
  pending_tests: 0,
  suites: 0,
  api_calls: 0,
  pending_api_calls: 0,
  average_response_time: 0.0
};

var output = function(message) {
  process.stdout.write(message);
};

var LINE = "-----------------------------------------------------------------------\n";

module.exports = {
  suite: {
    start: function(suite) {
      stats.suites++;
      output("\n" + LINE);
      output("SUITE: " + suite.name + "\n");
      if (suite.description) output(suite.description + "\n");
      output(LINE);
    }
  },
  test: {
    start: function(suite, test) {
      if (test.pending) {
        stats.pending_tests++;
      } else {
        stats.tests++;
      }
      output("\n" + LINE);
      output("TEST: " + suite.name + "/" + test.name);
      if (test.description) output(DELIMITER + test.description);
      if (test.pending) output(DELIMITER + PENDING);
      output("\n" + LINE + "\n");
    }
  },
  api_call: {
    start: function(suite, test, apiCall) {
      if (apiCall.pending) {
        stats.pending_api_calls++;
      } else {
        stats.api_calls++;
      }
      if (apiCall.it) {
        output("it " + apiCall.it);
        if (test.pending || apiCall.pending) output(DELIMITER + PENDING);
        output("\n");
      }
      if (apiCall.description) output(apiCall.description + "\n");
    },
    end: function(suite, test, apiCall, err, result) {
      var method = apiCall.request['method'] || "GET";
      if (apiCall.it || apiCall.description) output("  "); // indentation
      output(method + " " + apiCall.request.url);
      var status = err ? "FAILURE!" : "OK!";
      if (result.response) {
        output(DELIMITER + result.response.status + ' (' + result.response.response_time + 'ms)');
        stats.average_response_time = (stats.average_response_time*(stats.api_calls-1) + result.response.response_time)/stats.api_calls;
      }
      output(DELIMITER + status + "\n");
      if (err) {
        stats.failing_tests++;
        if (!util.contains(stats.failing_suites, suite.name)) stats.failing_suites.push(suite.name);
        output("\nDETAILS:\n\n" + util.stringify(result) + "\n\n\n");
      }
    }
  },
  all: {
    end: function(success, results) {
      var logPath = this.config.log_path;
      if (logPath) {
        output("\nlogging all results to " + logPath + "\n");
        if (!fs.existsSync(path.dirname(logPath))) fs.mkdirSync(path.dirname(logPath));
        fs.writeFileSync(logPath, util.stringify(results));
      }
      if (success) {
        output("\n" + stats.tests + " tests succeeded in " + stats.suites + " suites - ");
      } else {
        output("\n" + stats.failing_tests + "/" + stats.tests + " tests failed in " +
          stats.failing_suites.length + "/" + stats.suites + " suites - ");
      }
      output(stats.api_calls + " API calls with " + Math.round(stats.average_response_time) + "ms average response time " + "\n");
      if (stats.failing_suites.length > 0) output("\nFailing test suites: " + stats.failing_suites.join(', ') + "\n");
      if (stats.pending_tests > 0) output(stats.pending_tests + " pending tests\n");
      if (stats.pending_api_calls > 0) output(stats.pending_api_calls + " pending api calls\n");
      if (success) {
        output("\nSUCCESS!\n");
      } else {
        output("\nFAILURE!\n");
      }
    }
  }
};
