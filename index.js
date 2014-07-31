#!/usr/bin/env node
"use strict";

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
  testRunner.run(context, function(success, results) {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }    
  });
} catch(err) {
  console.log("ERROR: " + err.message);
  console.log(err.stack);
  console.log("USAGE: " + programName() + " <path-to-input-file1.json> <path-to-input-file2.json> ...")
  process.exit(1);
}

process.on('uncaughtException', function(err) {
  console.log('\n\nERROR: ' + JSON.stringify(err));
  console.log(err.stack);
  process.exit(1); 
});
