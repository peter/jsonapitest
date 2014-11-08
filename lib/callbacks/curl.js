var util = require('../util');

var quote = function(value) {
  return value.replace(/"/g, '\\"');
}

var headerOptions = function(request) {
  request.headers = request.headers || {};
  if (request.files) request.headers['Content-Type'] = 'multipart/form-data';
  return util.map(request.headers, function(value, key) {
    return '-H "' + quote(key + ": " + value) + '"';
  }).join(' ');
};

var urlWithQueryString = function(url, params) {
  if (url.indexOf('?') === -1) url = url + '?';
  return url + util.map(params, function(value, key) {
    return key + '=' + encodeURIComponent(value);
  }).join('&');
};

var jsonDataOptions = function(params) {
  return '-d ' + '"' + quote(JSON.stringify(params)) + '"';
};

var multipartDataOptions = function(files, params) {
  var fileOptions = util.map(files, function(value, key) {
    return '-F "' + quote(key + '=@' + value) + '"';
  }).join(' ');
  var paramsOptions = util.map(params, function(value, key) {
    return '-F "' + quote(key + '=' + value) + '"';
  }).join(' ');
  return fileOptions + ' ' + paramsOptions;
};

// Content-Type: application/x-www-form-urlencoded
var wwwFormDataOptions = function(params) {
  return util.map(params, function(value, key) {
    return '-d "' + quote(key + '=' + value) + '"';
  });
};

module.exports = {
    api_call: {
      end: function(suite, test, apiCall) {
        var request = apiCall.request,
            url = request.url,
            args = [
              '-i',
              ("-X " + request.method),
              headerOptions(request)
            ];
        if (request.params) {
          if (request.method === 'GET') {
            url = urlWithQueryString(url, request.params);
          } else if (request.files) {
            request.headers['Content-Type'] = 'multipart/form-data';
            args.push(multipartDataOptions(request.files, request.params));
          } else if (request.headers['Content-Type'] === 'application/json') {
            args.push(jsonDataOptions(request.params));
          } else {
            args.push(wwwFormDataOptions(request.params));
          }
        }
        args.push(url);
        console.log("curl " + args.join(' '));
      }
    }
};
