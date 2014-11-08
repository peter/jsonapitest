var fs = require('fs');

module.exports = function(config) {
  return {
    suite: {
      start: function(suite) {
        console.log("\nsync callback suite.start " + suite.name)
      },
      end: function(suite) {
        console.log("\nsync callback suite.end " + suite.name)
      }
    },
    test: {
      start: function(suite, test) {
        console.log("\nsync callback test.start " + test.name)
      },
      end: function(suite, test) {
        console.log("\nsync callback test.end " + test.name)
      }
    },
    api_call: {
      start: function(suite, test, apiCall) {
        console.log("\nsync callback api_call.start " + apiCall.request.url)
      },
      end: function(suite, test, apiCall, err, result) {
        console.log("\nsync callback api_call.end errors ", result.errors)
      }
    },
    all: {
      start: function() {
        console.log("\nsync callback all.start")
      },
      end: function(success, results) {
        console.log("\nsync callback all.end success ", success)
      }
    }  
  };
};
