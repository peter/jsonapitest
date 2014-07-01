var util = require('../util');

var headerOptions = function(headers) {
  util.map(headers, function(value, key) {
    return '-H "' + (key + ": " + value).replace('"', '\\"') + '"';
  }).join(' ');
};

module.exports = function(config) {
  return {
    api_call: {
      start: function(suite, test, apiCall) {
        var args = [
          '-i',
          ("-X " + apiCall.method),
          headerOptions(apiCall.headers),
        ];
        // TODO: query params
        // TODO: post params
        // TODO: file uploads
        args.push(apiCall.url);
        console.log("curl " + args.join(' '));
      }
    }
  };
};
