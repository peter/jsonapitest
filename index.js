#!/usr/bin/env node

var fileParser = require('./lib/file_parser'),
    testRunner = require('./lib/test_runner');

var files = process.argv.slice(2);
var context = fileParser.read(files);
testRunner.run(context);
