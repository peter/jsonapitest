var assert = require('assert'),
    contextParser = require('../../lib/context_parser');

var errorValidator = function(code) {
  return function(err) {
    return err.code === code && err.message.length > 0 && err.toString() === err.message;
  };
};

describe("context_parser", function() {
  describe("handleProperty", function() {
    it('suite - can add valid suite to context', function() {
      var context = contextParser.emptyContext(),
          suite = {
            name: "users",
            tests: [
              {
                name: "list",
                api_calls: [
                  {
                    request: {
                      path: "/v1/users"
                    }
                  }
                ]
              }
            ]
          };
      contextParser.handleProperty(context, 'suite', suite);
      assert.equal(context.suites.length, 1);
      assert.equal(context.suites[0].tests[0].api_calls[0].request.path, "/v1/users");
    });

    it('suite - only adds a suite once (unique by name)', function() {
      var context = contextParser.emptyContext(),
          suite1 = {
            name: "users",
            tests: [
              {
                name: "list",
                api_calls: [
                  {
                    request: "GET /v1/users"
                  }
                ]
              }
            ]
          },
          suite2 = {
            name: "users",
            description: "users description",
            tests: [
              {
                name: "get",
                api_calls: [
                  {
                    request: "GET /v1/users/123"
                  }
                ]
              }
            ]
          },
          suite3 = {
            name: "articles",
            tests: [
              {
                name: "get",
                api_calls: [
                  {
                    request: "GET /v1/articles/123"
                  }
                ]
              }
            ]
          };
      contextParser.handleProperty(context, 'suite', suite1);
      contextParser.handleProperty(context, 'suite', suite2);
      contextParser.handleProperty(context, 'suite', suite3);
      assert.equal(context.suites.length, 2);
      assert.equal(context.suites[0].name, 'users');
      assert.equal(context.suites[0].description, 'users description');
      assert.equal(context.suites[0].tests.length, 2);
      assert.equal(context.suites[0].tests[0].api_calls[0].request, "GET /v1/users");
      assert.equal(context.suites[0].tests[1].api_calls[0].request, "GET /v1/users/123");

      assert.equal(context.suites[1].name, 'articles');
      assert.equal(context.suites[1].tests.length, 1);
      assert.equal(context.suites[1].tests[0].api_calls[0].request, "GET /v1/articles/123");
    });

    it('suite - raises exception when invalid', function() {
      var context = contextParser.emptyContext(),
          suite = {
            name: "users",
            tests: [
              {
                name: "list",
                requests: [ // should be api_calls
                  {
                    request: {
                      path: "/v1/users"
                    }
                  }
                ]
              }
            ]
          };
      assert.throws(
        function() {
          contextParser.handleProperty(context, 'suite', suite);
        },
        errorValidator('invalid_schema')
      )
    });
  });
});
