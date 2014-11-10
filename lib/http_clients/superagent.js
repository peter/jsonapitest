"use strict";
var client = require('superagent'),
    util = require('../util');

var clientMethod = function(options) {
  var method = (options.method || 'get').toLowerCase();
  if (method === 'delete') method = 'del'; // delete is a reserved word
  return method;
};

exports.request = function(options, callback) {
  var startTime = new Date().getTime(),
      options = options || {},
      method = clientMethod(options),
      url = options.url,
      headers = options.headers || {},
      params = options.params || {},
      files = options.files || {},
      req = client[method](url).set(headers);

  if (options.files) {
    headers['Content-Type'] = 'multipart/form-data';
  } else if (!headers['Content-Type'] && method !== 'GET' && Object.keys(params).length > 0) {
    headers['Content-Type'] = 'application/json';    
  }

  // console.log("superagent " + method + " " + url + " headers=" + JSON.stringify(headers));

  if (url == null) throw new Error("superagent.request - must specify a url, options=" + JSON.stringify(options));

  if (headers['Content-Type'] === 'multipart/form-data') {
    util.each(params, function(value, key) {
      req = req.field(key, value);
    });

    util.each(files, function(filePath, fileName) {
      req = req.attach(fileName, filePath);
    });
  } else {
    if (method === 'get') {
      // NOTE: avoid superagent sending parameters in the body when doing get requests
      req = req.query(params);
    } else {
      req = req.send(params);
    }    
  }
    
  req.end(function(err, res) {
    res = res || {};
    var responseTime = new Date().getTime() - startTime;
    callback(err, {status: res.statusCode, headers: res.headers, body: res.body, response_time: responseTime});
  });
};
