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
