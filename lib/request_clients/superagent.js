var client = require('superagent');

exports.request = function(method, url, params, headers, files, callback) {
  var params = params || {},
      headers = headers || {},
      files = files || [],
      req = client[method](url).set(headers);

  if (headers['Content-Type'] === 'multipart/form-data') {
    util.each(params, function(value, key) {
      req = req.field(key, value);
    });

    files.forEach(function(file) {
      req = req.attach(file.fieldName, file.path);
    });
  } else {
    req = req.send(params);
  }
    
  req.end(function(error, res) {
    if (error) throw error;
    if (callback) callback(res.statusCode, res.headers, res.body);
  });
};
