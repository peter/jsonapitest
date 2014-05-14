var api_call = require('./api_call');

exports.run = function(context) {
  context.suites.forEach(function(suite) {
    console.log("TODO: Log entering suite=" + suite.name);
    suite.tests.forEach(function(test) {
      console.log("TODO: Log entering test=" + test.name);
      test.api_calls.forEach(function(apiCall) {
        console.log("TODO: Log entering apiCall=" + JSON.stringify(api_call.parse(apiCall, context.data)));
      });
      console.log("TODO: Log leaving test=" + test.name);
    });
    console.log("TODO: Log leaving suite=" + suite.name);
  });
};
