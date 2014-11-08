"use strict";
var util = require('./util'),
    join = require('path').join;

var defaultModules = {
  http_client: './http_clients/superagent',
  callbacks: ['./callbacks/console']
};

var modulePath = function(context, key) {
  return util.nestedValue.get(context, ('config.modules.' + key)) || util.nestedValue.get(defaultModules, key)
};
exports.modulePath = modulePath;

var requireModule = function(context, key, path) {
  if (typeof path === 'string') {
    return require(path);
  } else {
    return path;
  }
};

exports.load = function(context, key) {
  var path = modulePath(context, key);
  if (path == null) {
    return null;
  } else if (util.isArray(path)) {
    return util.map(path, function(p) { return requireModule(context, key, p) });
  } else {
    return requireModule(context, key, path);
  }  
};
