var assert = require('assert'),
    testRunner = require('../../lib/test_runner'),
    syncCallback = require('../modules/sync_callback'),
    asyncCallback = require('../modules/async_callback'),
    util = require('../../lib/util');

var context = function(httpClient, options) {
  options = options || {};
  return {
    data: {},
    suites: [
      {
        name: 'articles',
        tests: [
          {
            name: 'Get articles',
            api_calls: [
              {
                request: 'GET /articles',
                status: 200
              },
              {
                request: 'GET /articles/1',
                status: 200
              }
            ]
          }
        ]
      },
      {
        name: 'users',
        tests: [
          {
            name: 'Update user',
            api_calls: [
              {
                request: {
                  path: '/users/1',
                  method: 'PUT',
                  params: {name: 'New name'}
                },
                status: 200
              },
              {
                request: 'GET /users/1',
                status: 200
              }
            ]
          },
          {
            name: 'Get users',
            api_calls: [
              {
                request: 'GET /users',
                status: 200
              }
            ]
          }
        ]
      }
    ],
    config: {
      defaults: {
        api_call: {
          request: {
            base_url: "http://api.example.com"
          }
        }
      },
      modules: {
        callbacks: (options['callbacks'] || null),
        http_client: httpClient
      }
    },
    options: options.options
  };
};

describe('test_runner', function() {
  describe('run', function() {
    it('runs all tests and returns the results - success', function() {
      var httpClient = {
        request: function(options, callback) {
          callback(null, {status: 200});
        }
      };

      testRunner.run(context(httpClient), function(success, results) {
        assert.equal(success, true);
        assert.equal(results.length, 5);
        assert.equal(results[0].test, 'Get articles');
        assert(util.endsWith(results[0].api_call.request.url, '/articles'));
        assert.equal(results[1].test, 'Get articles');
        assert(util.endsWith(results[1].api_call.request.url, '/articles/1'));
        assert.equal(results[2].test, 'Update user');
        assert.equal(results[2].api_call.request.method, 'PUT');
        assert.equal(results[3].test, 'Update user');
        assert.equal(results[3].api_call.request.method, 'GET');
        assert.equal(results[4].test, 'Get users');
        assert(util.endsWith(results[4].api_call.request.url, '/users'));
      });
    });

    it('runs all tests and returns the results - failure', function() {
      var httpClient = {
        request: function(options, callback) {
          // Make the update user test fail and all other pass
          var status = (options.method === 'PUT' ? 401 : 200);
          callback(null, {status: status});
        }
      };

      testRunner.run(context(httpClient), function(success, results) {
        assert.equal(success, false);
        assert.equal(results.length, 4);
        assert.equal(results[0].suite, 'articles');
        assert.equal(results[0].test, 'Get articles');
        assert.deepEqual(results[0].api_call, {request: {method: 'GET', url: 'http://api.example.com/articles'}, status: 200});
        assert.equal(results[0].response.status, 200);
        assert.equal(results[0].errors.length, 0);

        assert.equal(results[2].test, 'Update user');
        assert.equal(results[2].errors.length, 1);

        assert.equal(results[3].test, 'Get users');

        console.log(results);
      });
    });

    it('runs all tests with custom callbacks', function(done) {
      var httpClient = {
        request: function(options, callback) {
          callback(null, {status: 200});
        }
      },
      callbacks = [syncCallback, asyncCallback],
      _context = context(httpClient, {callbacks: callbacks});

      testRunner.run(_context, function(success, results) {
        assert.equal(success, true);
        assert.equal(results.length, 5);

        var keys = util.flatten(util.map([
          'all.start',
          'suite.start', 'test.start', 'api_call.start', 'api_call.end', 'api_call.start', 'api_call.end', 'test.end', 'suite.end',
          'suite.start', 'test.start', 'api_call.start', 'api_call.end', 'api_call.start', 'api_call.end', 'test.end', 'test.start', 'api_call.start', 'api_call.end', 'test.end', 'suite.end',
          'all.end'
          ], function(key) {
          return [('sync.' + key), ('async.' + key)];
        }));
        assert.deepEqual(util.pluck(_context.log, '0'), keys);
        done();
      });
    });

    it('runs all suites given by suite option', function() {
      var httpClient = {
        request: function(options, callback) {
          callback(null, {status: 200});
        }
      };
      var testLog = [];
      var callback = {
        test: {
          start: function(suite, test) {
            testLog.push(test.name);
          }
        }
      };
      var options = {suite: 'user'};
      testRunner.run(context(httpClient, {callbacks: [callback], options: options}), function(success, results) {
        assert.equal(success, true);
        assert.deepEqual(testLog, ['Update user', 'Get users']);
      });
    });

    it('runs all tests given by test option', function() {
      var httpClient = {
        request: function(options, callback) {
          callback(null, {status: 200});
        }
      };
      var testLog = [];
      var callback = {
        test: {
          start: function(suite, test) {
            testLog.push(test.name);
          }
        }
      };
      var options = {test: 'get'};
      testRunner.run(context(httpClient, {callbacks: [callback], options: options}), function(success, results) {
        assert.equal(success, true);
        assert.deepEqual(testLog, ['Get articles', 'Get users']);
      });
    });

    it('runs all tests given by a combination of test and suite options', function() {
      var httpClient = {
        request: function(options, callback) {
          callback(null, {status: 200});
        }
      };
      var testLog = [];
      var callback = {
        test: {
          start: function(suite, test) {
            testLog.push(test.name);
          }
        }
      };
      var options = {test: 'get', suite: 'us'};
      testRunner.run(context(httpClient, {callbacks: [callback], options: options}), function(success, results) {
        assert.equal(success, true);
        assert.deepEqual(testLog, ['Get users']);
      });
    });

    it('doesnt run pending tests or api calls', function() {
      var httpClient = {
        request: function(options, callback) {
          callback(null, {status: 200});
        }
      };
      var testLog = [];
      var callback = {
        api_call: {
          end: function(suite, test, apiCall, err, result) {
            testLog.push(apiCall.request.url);
          }
        }
      };
      var pendingContext = context(httpClient, {callbacks: [callback]});
      pendingContext.suites[0].tests[0].pending = true;
      pendingContext.suites[1].tests[0].api_calls[0].pending = true;
      testRunner.run(pendingContext, function(success, results) {
        assert.equal(success, true);
        assert.deepEqual(testLog, ['http://api.example.com/users/1', 'http://api.example.com/users']);
      });
    });
  });
});
