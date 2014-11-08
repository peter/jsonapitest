var fs = require('fs'),
    util = require('../../lib/util');

module.exports = {
  suite: {
    start: function(suite) {
      this.log.push(['sync.suite.start', util.args(arguments)]);
    },
    end: function(suite) {
      this.log.push(['sync.suite.end', util.args(arguments)]);
    }
  },
  test: {
    start: function(suite, test) {
      this.log.push(['sync.test.start', util.args(arguments)]);
    },
    end: function(suite, test) {
      this.log.push(['sync.test.end', util.args(arguments)]);
    }
  },
  api_call: {
    start: function(suite, test, apiCall) {
      this.log.push(['sync.api_call.start', util.args(arguments)]);
    },
    end: function(suite, test, apiCall, err, result) {
      this.log.push(['sync.api_call.end', util.args(arguments)]);
    }
  },
  all: {
    start: function() {
      this.log = this.log || [];
      this.log.push(['sync.all.start', util.args(arguments)]);
    },
    end: function(success, results) {
      this.log.push(['sync.all.end', util.args(arguments)]);
    }
  }  
};
