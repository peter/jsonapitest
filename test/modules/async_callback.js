var fs = require('fs');

var log = function(message, callback) {
  fs.appendFile('async_callback_log.txt', message, function (err) {
    callback(err);    
  });
};

module.exports = function(config) {
  return {
    suite: {
      start: function(suite, callback) {
        log("\nasync callback suite.start " + suite.name, callback);
      },
      end: function(suite, callback) {
        log("\nasync callback suite.end " + suite.name, callback);
      }
    },
    test: {
      start: function(suite, test, callback) {
        log("\nasync callback test.start " + test.name, callback);
      },
      end: function(suite, test, callback) {
        log("\nasync callback test.end " + test.name, callback);
      }
    },
    api_call: {
      start: function(suite, test, apiCall, callback) {
        log("\nasync callback api_call.start " + apiCall.request.url, callback);
      },
      end: function(suite, test, apiCall, err, result, callback) {
        log("\nasync callback api_call.end errors " + (result.errors && result.errors.length), callback);
      }
    },
    all: {
      start: function(callback) {
        log("\nasync callback all.start", callback);
      },
      end: function(success, results, callback) {
        log("\nasync callback all.end success " + success, callback);
      }
    }  
  };
};
