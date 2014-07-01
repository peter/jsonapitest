"use strict";
var util = require('../util'),
    fs = require('fs');

var DELIMITER = ' - ';

var stats = {
  failing_tests: 0,
  tests: 0,
  suites: 0,
  api_calls: 0,
  average_response_time: 0.0
};

var output = function(message) {
  process.stdout.write(message);
};

module.exports = function(config) {
  return {
    suite: {
      start: function(suite) {
        stats.suites++;
        output("\n-----------------------------------------------------------------------\n");
        output(suite.name + "\n");
        if (suite.description) output(suite.description + "\n");
        output("-----------------------------------------------------------------------\n");
      }
    },
    test: {
      start: function(suite, test) {
        stats.tests++;
        output("\n" + suite.name + "/" + test.name);
        if (test.description) output(DELIMITER + test.description);
        output("\n");
      }
    },
    api_call: {
      start: function(suite, test, apiCall) {
        stats.api_calls++;
        var method = apiCall.request['method'] || "GET";
        output(method + " " + apiCall.request.url);
      },
      end: function(suite, test, apiCall, err, result) {        
        var status = err ? "FAILURE!" : "OK!";
        if (result.response) {
          output(DELIMITER + result.response.status + ' (' + result.response.response_time + 'ms)');
          stats.average_response_time = (stats.average_response_time*(stats.api_calls-1) + result.response.response_time)/stats.api_calls;
        }
        output(DELIMITER + status + "\n");
        if (err) {
          stats.failing_tests++;
          output("\nDETAILS:\n\n" + util.jsonPretty(result) + "\n\n\n");
        }
      }
    },
    all: {      
      end: function(success, results) {
        if (config.log_path) {
          output("\nlogging all results to " + config.log_path + "\n");
          fs.writeFileSync(config.log_path, util.jsonPretty(results));
        }
        output("\n" + stats.failing_tests + "/" + stats.tests + " tests failed in " + stats.suites + " suites. " + stats.api_calls + " API calls with " + Math.round(stats.average_response_time) + "ms average response time " + "\n");
        if (success) {
          output("\nSUCCESS!\n");
        } else {
          output("\nFAILURE!\n");
        }
      }
    }
  };
};
