var util = require('../util'),
    fs = require('fs');

var DELIMITER = ' - ';

var output = function(message) {
  process.stdout.write(message);
};

module.exports = function(config) {
  return {
    suite: {
      start: function(suite) {
        output("\n-----------------------------------------------------------------------\n");
        output(suite.name + "\n");
        if (suite.description) output(suite.description + "\n");
        output("-----------------------------------------------------------------------\n");
      }
    },
    test: {
      start: function(suite, test) {
        output("\n" + suite.name + "/" + test.name);
        if (test.description) output(DELIMITER + test.description);
        output("\n");
      }
    },
    api_call: {
      start: function(suite, test, apiCall) {
        var method = apiCall.request['method'] || "GET";
        output(method + " " + apiCall.request.url);
      },
      end: function(suite, test, apiCall, err, result) {
        var status = err ? "FAILURE!" : "OK!";
        if (result.response) output(DELIMITER + result.response.status + ' (' + result.response.response_time + "ms)")
        output(DELIMITER + status + "\n");
        if (err) {
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
        if (success) {
          output("\nSUCCESS!\n");
        } else {
          output("\nFAILURE!\n");
        }
      }
    }
  };
};
