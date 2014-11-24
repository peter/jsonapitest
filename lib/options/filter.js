"use strict";

var util = require('../util');

var filteredList = function(list, name) {
  if (name) {
    return util.filter(list, function(item) {
      return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
    });
  } else {
    return list;
  }
};
exports.filteredList = filteredList;

var tests = function(suite, context) {
  return filteredList(suite.tests, (context.options && context.options.test));
};
exports.tests = tests;

var suites = function(context) {
  return filteredList(context.suites, (context.options && context.options.suite));
};
exports.suites = suites;
