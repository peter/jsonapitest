"use strict";
var fs = require('fs'),
    client = require('request'),
    util = require('../util');

// TODO: Add support for "Accept-Encoding": "gzip"
exports.request = function(options, callback) {
  var startTime = new Date().getTime(),
      headers = options.headers || {},
      method = options.method || 'GET',
      params = options.params || {},
      files = options.files || {},
      clientOptions = {method: method, url: options.url, headers: headers};

  if (options.url == null) throw new util.Error("http_clients_missing_url", "must specify a url, options=" + JSON.stringify(options));

  if (options.files) headers['Content-Type'] = 'multipart/form-data';

  if (options.params) {
    if (method === 'GET') {
      clientOptions.qs = params;
    } else if (headers['Content-Type'] === 'application/json') {
      clientOptions.body = JSON.stringify(params);
    } else if (headers['Content-Type'] !== 'multipart/form-data') {
      clientOptions.form = params;
    }
  }

  var req = client(clientOptions, function(err, res, body) {
    res = res || {};
    if (body && res.headers && res.headers['content-type'] === 'application/json') body = JSON.parse(body);
    var responseTime = new Date().getTime() - startTime;
    callback(err, {status: res.statusCode, headers: res.headers, body: body, response_time: responseTime});
  });

  if (headers['Content-Type'] === 'multipart/form-data') {
    var form = req.form()
    util.each(params, function(value, key) {
      form.append(key, value);
    });
    util.each(files, function(filePath, fileName) {
      form.append(fileName, fs.createReadStream(filePath));
    });
  }
};
