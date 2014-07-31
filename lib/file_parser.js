"use strict";
var fs = require('fs'),
    util = require('./util'),
    contextParser = require('./context_parser');

var readFile = function(path) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch(err) {
    if (err.code === 'ENOENT') {
      throw new util.Error("file_not_found", "could not read file " + path + " " + err.message);  
    } else {
      throw new util.Error("invalid_json", "could not parse JSON from file " + path + " " + err.message);
    }
  }
};

var parseFile = function(context, file) {
  util.each(file.data, function(value, property) {
    try {
      contextParser.handleProperty(context, property, value);
    } catch(err) {
      var errorCode = err.code || "invalid_schema";
      throw new util.Error(errorCode, "could not parse " + property + " in file " + file.path + " - " + err.message);
    }
  });
};
exports.parseFile = parseFile;

exports.read = function(paths) {
  if (paths == null || paths.length == 0) throw new util.Error("missing_paths", "please provide at least one input file path");
  var context = contextParser.emptyContext(),
      files = paths.map(function(path) { return {path: path, data: readFile(path)}});
  files.forEach(function(file) {
    parseFile(context, file);
  });
  return context;
};
