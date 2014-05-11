#!/usr/bin/env node

var fileParser = require('./lib/file_parser'),
    testRunner = require('./lib/test_runner'),
    fs = require('fs');

var programName = function() {
  var packageInfo = JSON.parse(fs.readFileSync(__dirname + '/package.json'));
  return packageInfo.name;
};

try {
  var files = process.argv.slice(2);
  var context = fileParser.read(files);
  testRunner.run(context);
} catch(err) {
  console.log("ERROR: " + err.message);
  console.log("USAGE: " + programName() + " <path-to-input-file1.json> <path-to-input-file2.json> ...")
  process.exit(1);
}
