"use strict";
var fs = require('fs'),
    util = require('./util'),
    join = require('path').join,
    extname = require('path').extname,
    resolve = require('path').resolve,
    contextParser = require('./context_parser');

var expandPaths = function(paths, extensions, topLevel) {
  return util.compact(util.flatten(util.map(util.array(paths), function(path) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
      var subPaths = util.compact(util.map(fs.readdirSync(path), function(subPath) {
        return join(path, subPath);
      }));
      return expandPaths(subPaths, extensions);
    } else if (topLevel || util.contains(extensions, extname(path))) {
      return path;
    } else {
      return null;
    }
  })));
};
exports.expandPaths = expandPaths;

var readJSONFile = function(path) {
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

var readJsFile = function(path) {
  return require(resolve(path));
};

var fileReaders = {
  '.js': readJsFile,
  '.json': readJSONFile
};

var readFile = function(path) {
  var extension = extname(path),
      reader = fileReaders[extension];
  if (reader) {
    return reader(path);
  } else {
    throw new util.Error("invalid_file_extension", "Don't know how to read file with extension " + extension);
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
  paths = expandPaths(paths, Object.keys(fileReaders), true);
  var context = util.deepMerge(contextParser.emptyContext(), {paths: paths}),
      files = paths.map(function(path) { return {path: path, data: readFile(path)}});
  files.forEach(function(file) {
    parseFile(context, file);
  });
  return context;
};
