var api_call = require('./api_call');

exports.run = function(context) {
  context.suites.forEach(function(suite) {
    console.log("TODO: Log suite=" + suite.name);
    suite.tests.forEach(function(test) {
      test.api_calls.forEach(function(apiCallRaw) {
        var apiCall = api_call.parse(apiCallRaw, context);
        console.log("TODO: Log apiCall=" + JSON.stringify(apiCall));
      });
    });
  });
};
