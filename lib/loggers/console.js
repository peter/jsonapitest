var util = require('../util'),
    fs = require('fs');

var DELIMITER = ' - ';

var apiCallPrefix = function(suite, test, apiCall) {
  return suite.name + "/" + test.name + DELIMITER + apiCall.request['method'] + " " + apiCall.request.url;
};

var output = function(message) {
  process.stdout.write(message);
};

module.exports = function(config) {
  return {
    api_call: {
      start: function(suite, test, apiCall) {
        output(apiCallPrefix(suite, test, apiCall));
      },
      end: function(suite, test, apiCall, err, result) {
        var status = err ? "FAILURE!" : "OK!";
        output(DELIMITER + status + "\n");
        if (err) output("\nDETAILS:\n\n" + util.jsonPretty(result) + "\n\n\n");
      }
    },
    all: {      
      end: function(success, results) {
        if (config.log_path) {
          output("logging all results in " + config.log_path + "\n");
          fs.writeFileSync(config.log_path, util.jsonPretty(results));
        }
        if (success) {
          output("SUCCESS!\n");
        } else {
          output("FAILURE!\n");
        }
      }
    }
  };
};
