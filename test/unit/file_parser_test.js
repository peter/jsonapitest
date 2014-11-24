var assert = require('assert'),
    contextParser = require('../../lib/context_parser'),
    fileParser = require('../../lib/file_parser');

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
          fileParser.read(['this-file-does-not-exist.json']);
        },
        errorValidator('file_not_found')
      );
    });

    it("raises an exception with non-JSON file", function() {
      assert.throws(
        function() {
          fileParser.read(['./test/files/invalid.txt']);
        },
        errorValidator('invalid_file_extension')
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

  describe('parseFile', function() {
    it('can parse a test suite', function() {
      var context = contextParser.emptyContext(),
          data = {
            suite: {
              name: "My Test Suite",
              description: "Should parse just fine",
              tests: [
                {
                  name: "My Test",
                  description: "Has a couple of assertions",
                  api_calls: [
                    {
                      request: "/v1/users/1",
                      assert: {
                        select: "body",
                        schema: "{{schema.user}}"
                      },
                      save: {
                        "saved.user": "body"
                      }
                    },
                    {
                      request: "/v1/users",
                      assert: {
                        select: {key: "body.users.name", pattern: "\\w+$"},
                        equal: ["User 1", "User 2"]
                      },
                      save: {
                        "saved.user_names": {key: "body.users.name", pattern: "\\w+$"}
                      }
                    }
                  ]
                }
              ]
            }
          },
          file = {data: data, path: "some-file.json"};
      fileParser.parseFile(context, file);
      assert.equal(context.suites.length, 1);
      assert.deepEqual(context.suites[0], data.suite);
    });

    it('does not accept test suite with an invalid select', function() {
      var context = contextParser.emptyContext(),
          data = {
            suite: {
              name: "My Test Suite",
              description: "Should parse just fine",
              tests: [
                {
                  name: "My Test",
                  description: "Has a couple of assertions",
                  api_calls: [
                    {
                      request: "/v1/users/1",
                      assert: {
                        select: "body",
                        schema: "{{schema.user}}"
                      },
                      save: {
                        "saved.user": "body"
                      }
                    },
                    {
                      request: "/v1/users",
                      assert: {
                        select: {key: "body.users.name", patterns: "\\w+$"},
                        equal: ["User 1", "User 2"]
                      },
                      save: {
                        "saved.user_names": {property: "body.users.name", pattern: "\\w+$"}
                      }
                    }
                  ]
                }
              ]
            }
          },
          file = {data: data, path: "some-file.json"};
      assert.throws(
        function() {
          fileParser.parseFile(context, file);
        },
        errorValidator('invalid_schema')
      )
    });
  });

  describe('expandPaths', function() {
    it('returns file paths as-is, regardless of file type if topLevel=true', function() {
      var paths = [
        'test/files',
        'README.md',
        'index.js'
      ];
      var extensions = ['.js', '.json'];
      var topLevel = true;
      var expect = [
        'test/files/articles_test.json',
        'test/files/config.json',
        'test/files/invalid-schema.json',
        'test/files/invalid-top-level.json',
        'test/files/users_test.json',
        'README.md',
        'index.js'
      ];
      assert.deepEqual(fileParser.expandPaths(paths, extensions, topLevel), expect);
    });

    it('returns only .js and .json file paths as-is if topLevel=false', function() {
      var paths = [
        'test/files',
        'README.md',
        'index.js',
        'package.json'
      ];
      var extensions = ['.json'];
      var topLevel = false;
      var expect = [
        'test/files/articles_test.json',
        'test/files/config.json',
        'test/files/invalid-schema.json',
        'test/files/invalid-top-level.json',
        'test/files/users_test.json',
        'package.json'
      ];
      assert.deepEqual(fileParser.expandPaths(paths, extensions, topLevel), expect);
    });
  });
});
