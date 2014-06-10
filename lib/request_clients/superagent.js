var client = require('superagent'),
    util = require('../util');

var clientMethod = function(options) {
  var method = (options.method || 'get').toLowerCase();
  if (method === 'delete') method = 'del'; // delete is a reserved word
  return method;
};

exports.request = function(options, callback) {
  var options = options || {},
      method = clientMethod(options),
      url = options.url,
      headers = options.headers || {},
      params = options.params || {},
      files = options.files || [],
      req = client[method](url).set(headers);

  if (url == null) throw new Error("superagent.request - must specify a url, options=" + JSON.stringify(options));

  if (headers['Content-Type'] === 'multipart/form-data') {
    util.each(params, function(value, key) {
      req = req.field(key, value);
    });

    util.each(files, function(filePath, fileName) {
      req = req.attach(fileName, filePath);
    });
  } else {
    req = req.send(params);
  }
    
  req.end(function(err, res) {
    res = res || {};
    callback(err, {status: res.statusCode, headers: res.headers, body: res.body});
  });
};
