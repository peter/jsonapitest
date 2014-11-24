#!/usr/bin/env node
"use strict";

var optionsParser = require('./lib/options/parser'),
    fileParser = require('./lib/file_parser'),
    testRunner = require('./lib/test_runner'),
    fs = require('fs');

var programName = function() {
  var packageInfo = JSON.parse(fs.readFileSync(__dirname + '/package.json'));
  return packageInfo.name;
};

try {
  var cmdLine = optionsParser.parse(process.argv.slice(2), ['suite', 'test'])
  var files = cmdLine.args;
  var context = fileParser.read(files);
  context.options = cmdLine.options;
  testRunner.run(context, function(success, results) {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
} catch(err) {
  if (err.stack) {
    console.log(err.stack);
  } else {
    console.log("ERROR: ", err.message, err);
  }
  console.log("\nUSAGE: " + programName() + " <path-to-file-or-dir1> <path-to-file-or-dir2> ...")
  console.log("\nOPTIONS:\n");
  console.log("--suite <name-of-suite>\t\tonly run suites with name containing <name-of-suite>");
  console.log("--test <name-of-test>\t\tonly run tests with name containing <name-of-test>");
  console.log("\n");
  process.exit(1);
}

process.on('uncaughtException', function(err) {
  console.log('\n\nERROR: ' + JSON.stringify(err));
  console.log(err.stack);
  process.exit(1);
});
