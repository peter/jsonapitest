var fs = require('fs'),
    util = require('../../lib/util');

var doSomethingAsync = function(callback) {
  fs.exists(__dirname, callback);
};

module.exports = {
  suite: {
    start: function(suite, callback) {
      var self = this;
      doSomethingAsync(function() {
        self.log.push(['async.suite.start', util.args(arguments)]);
        callback();
      });
    },
    end: function(suite, callback) {
      var self = this;
      doSomethingAsync(function() {
        self.log.push(['async.suite.end', util.args(arguments)]);
        callback();
      });
    }
  },
  test: {
    start: function(suite, test, callback) {
      var self = this;
      doSomethingAsync(function() {
        self.log.push(['async.test.start', util.args(arguments)]);
        callback();
      });
    },
    end: function(suite, test, callback) {
      var self = this;
      doSomethingAsync(function() {
        self.log.push(['async.test.end', util.args(arguments)]);
        callback();
      });
    }
  },
  api_call: {
    start: function(suite, test, apiCall, callback) {
      var self = this;
      doSomethingAsync(function() {
        self.log.push(['async.api_call.start', util.args(arguments)]);
        callback();
      });
    },
    end: function(suite, test, apiCall, err, result, callback) {
      var self = this;
      doSomethingAsync(function() {
        self.log.push(['async.api_call.end', util.args(arguments)]);
        callback();
      });
    }
  },
  all: {
    start: function(callback) {
      var self = this;
      doSomethingAsync(function() {
        self.log.push(['async.all.start', util.args(arguments)]);
        callback();
      });
    },
    end: function(success, results, callback) {
      var self = this;
      self.log = self.log || [];
      doSomethingAsync(function() {
        self.log.push(['async.all.end', util.args(arguments)]);
        callback();
      });
    }
  }  
};
