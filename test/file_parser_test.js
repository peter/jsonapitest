var assert = require('assert'),
    fileParser = require('../lib/file_parser');

var errorValidator = function(code) {
  return function(err) {
    return err.code === code && err.message.length > 0 && err.toString() === err.message;
  };
};

describe("file_parser", function() {
  describe("read", function() {
    it("raises an exception with no paths", function() {
      assert.throws(
        function() {
          fileParser.read([]);
        },
        errorValidator('missing_paths')
      );

      assert.throws(
        function() {
          fileParser.read();
        },
        errorValidator('missing_paths')
      );
    });

    it("raises an exception with non-existant file", function() {
      assert.throws(
        function() {
          fileParser.read(['this-file-does-not-exist']);
        },
        errorValidator('file_not_found')
      );      
    });

    it("raises an exception with non-JSON file", function() {
      assert.throws(
        function() {
          fileParser.read(['./test/files/invalid.txt']);
        },
        errorValidator('invalid_json')
      );
    });

    it("raises an exception with invalid top level elements", function() {
      assert.throws(
        function() {
          fileParser.read(['./test/files/invalid-top-level.json']);
        },
        errorValidator('invalid_root_property')
      );
    });

    it("raises an exception if there are invalid nexted elements", function() {
      assert.throws(
        function() {
          fileParser.read(['./test/files/invalid-schema.json']);
        },
        errorValidator('invalid_schema')
      );      
    });

    it("returns context for valid config file and multiple files with test suites", function() {
      var context = fileParser.read(['./test/files/config.json', './test/files/users_test.json', './test/files/articles_test.json']);
      assert.equal(context.config.defaults.api_call.request.base_url, 'http://localhost:3001');
      assert.equal(context.suites.length, 2);
      assert.equal(context.suites[0].name, 'users');
      assert.equal(context.suites[0].tests[0].api_calls[0].request.path, '/v1/users');
      assert.equal(context.suites[1].name, 'articles');
    });
  });

  describe("handleProperty", function() {
    it('suite - can add valid suite to context', function() {
      var context = fileParser.emptyContext(),
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
      fileParser.handleProperty(context, 'suite', suite);
      assert.equal(context.suites.length, 1);
      assert.equal(context.suites[0].tests[0].api_calls[0].request.path, "/v1/users");
    });

    it('suite - raises exception when invalid', function() {
      var context = fileParser.emptyContext(),
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
          fileParser.handleProperty(context, 'suite', suite);
        },
        errorValidator('invalid_schema')
      )
    });
  });
});
