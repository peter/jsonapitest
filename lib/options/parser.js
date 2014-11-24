"use strict";

var util = require('../util');

var isOption = function(arg) {
  return arg.indexOf('-') === 0;
};

var lookupOption = function(name, validOptions) {
  var options = util.filter(validOptions, function(option) {
    return option.indexOf(name) === 0;
  });
  return (options && options.length === 1) ? options[0] : null;
};

var parseOption = function(arg) {
  if (arg.indexOf('--') === 0) {
    return arg.substring(2);
  } else {
    return arg.substring(1);
  }      
};

// NOTE: does not currently handle options without values (flags)
var parse = function(args, validOptions) {
  var result = {options: {}, args: []},
      optionName = null;
  args.forEach(function(arg) {
    if (isOption(arg)) {
      optionName = lookupOption(parseOption(arg), validOptions);
      if (!optionName) throw new Error('Invalid option ' + parseOption(arg) + ', must be one of: ' + validOptions.join(', '));
    } else {
      if (optionName) {
        result.options[optionName] = arg;
        optionName = null;
      } else {
        result.args.push(arg);
      }
    }
  });
  if (optionName) throw new Error('Missing value for option ' + optionName);
  return result;
};
exports.parse = parse;
