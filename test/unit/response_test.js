var assert = require('assert'),
    util = require('../../lib/util'),
    response = require('../../lib/response');

var res = {
  status: 201,
  headers: {
    "Content-Type": "application/json",
    "Location": "http://example.com/users/2"
  },
  body: {
    user: {
      id: 2,
      name: "Joe"
    }
  }
};

var resWithVisits = {
  status: 201,
  headers: {
    "Content-Type": "application/json",
    "Location": "http://example.com/users/2"
  },
  body: {
    user: {
      id: 2,
      name: "Joe",
      visited_site_ids: [100, 101],
      wished_for_site_ids: [],
      eventor_clubs: [{id: 5, name: 'Östermalms IP'}]
    }
  }
};

describe('response', function() {
  describe('select', function() {
    it('returns a value from the response given a key', function() {
      assert.deepEqual(response.select(res, 'body.user'), {id: 2, name: "Joe"});
      assert.equal(response.select(res, 'body.user.id'), 2);
      assert.equal(response.select(res, 'body.user.name'), 'Joe');
      assert.equal(response.select(res, 'headers.Location'), "http://example.com/users/2");

      assert.equal(response.select(res, 'body.user.foo'), null);
      assert.equal(response.select(res, 'foo'), null);
    });

    it('returns a value from the response given a key and a regexp pattern', function() {
      // String match
      assert.equal(response.select(res, {key: 'headers.Location', pattern: "(\\d+)$"}), "2");
      assert.equal(response.select(res, {key: 'headers.Location', pattern: "\\d+$"}), "2");
      assert.equal(response.select(res, {key: 'headers.Location', pattern: "example\\.com"}), "example.com");

      // Object match
      assert.equal(response.select(res, {key: 'headers', pattern: "\"Location\":\"([^\"]+)\""}), "http://example.com/users/2");

      // Array match
      assert.deepEqual(response.select({body: {users: [{name: "Joe User"}, {name: "Foo User"}]}}, 'body.users.name'), ["Joe User", "Foo User"]);
      assert.deepEqual(response.select({body: {users: [{name: "Joe User"}, {name: "Foo User"}]}}, {key: 'body.users.name'}), ["Joe User", "Foo User"]);
      assert.deepEqual(response.select({body: {users: [{name: "Joe User"}, {name: "Foo User"}]}}, {key: 'body.users.name', pattern: "^\\w+"}), ["Joe", "Foo"]);
      assert.deepEqual(response.select({body: {users: [{name: "Joe User"}, {name: "Foo User"}]}}, {key: 'body.users.name.0', pattern: "^\\w+"}), "Joe");

      // No match
      assert.equal(response.select(res, {key: 'headers.Location', pattern: "foobar"}), null);
      assert.equal(response.select(res, {key: 'foobar', pattern: "foobar"}), null);
    });

    it('can select from arrays - either by index or by property (produces a map)', function() {
      // Select by index
      assert.deepEqual(response.select({a: ['foo', 'bar']}, {key: 'a.0'}), 'foo')
      assert.deepEqual(response.select({a: ['foo', 'bar']}, {key: 'a.1'}), 'bar')
      assert.deepEqual(response.select({a: {b: {c: ['foo', 'bar']}}}, {key: 'a.b.c.1'}), 'bar')

      // Select by index empty case
      assert.strictEqual(response.select({}, {key: 'a.0'}), undefined)
      assert.strictEqual(response.select({a: null}, {key: 'a'}), null)
      assert.strictEqual(response.select({a: null}, {key: 'a.0'}), undefined)
      assert.deepEqual(response.select({a: []}, {key: 'a.0'}), undefined)
      assert.deepEqual(response.select({a: {}}, {key: 'a.0'}), undefined)
      assert.deepEqual(response.select({a: ['foo']}, {key: 'a.1'}), undefined)

      // Select by property
      assert.deepEqual(response.select({a: {foo: 'foo'}}, {key: 'a.foo'}), 'foo');
      assert.deepEqual(response.select({a: [{foo: 'foo'}]}, {key: 'a.foo'}), ['foo']);
      assert.deepEqual(response.select({a: [{foo: 'foo', bla: 'bla'}, {foo: 'bar', blubba: 'blubba'}]}, {key: 'a.foo'}), ['foo', 'bar']);

      // Select by property empty case
      assert.deepEqual(response.select({}, {key: 'a.foo'}), undefined)
      assert.deepEqual(response.select({a: null}, {key: 'a.foo'}), undefined)
      assert.deepEqual(response.select({a: []}, {key: 'a.foo'}), [])
      assert.deepEqual(response.select({a: {}}, {key: 'a.foo'}), undefined)
      assert.deepEqual(response.select({a: {bar: 'bar'}}, {key: 'a.foo'}), undefined)
    });
  });

  describe('save', function() {
    it('saves selected values into the data with certain keys', function() {
      var data = {},
          options = {"user.new": "body.user.id"};
      response.save(options, res, data);
      assert.deepEqual(data, {"user": {"new": 2}})
    });

    it('overwrites existing data value', function() {
      var data = {"user": {"new": "foobar"}},
          options = {"user.new": {key: "body.user.id"}};
      response.save(options, res, data);
      assert.deepEqual(data, {"user": {"new": 2}})
    });

    it('writes null if selector doesnt match', function() {
      var data = {},
          options = {"user.new": {key: "foobar"}};
      response.save(options, res, data);
      assert.deepEqual(data, {"user": {"new": undefined}})
    });

    it('can save multiple values', function() {
      var data = {},
          options = {
            "user.new.name": "body.user.name",
            "user.new.id": {key: "headers.Location", pattern: "(\\d+)$"}
          };
      response.save(options, res, data);
      assert.deepEqual(data, {"user": {"new": {id: "2", name: "Joe"}}})
    });
  });

  describe('assert', function() {
    it('can check equality on a selector', function() {
      // One or more primitive values
      assert.deepEqual(response.assert({}, {select: 'body.user.id', equal: 2}, res), []);
      assert.deepEqual(response.assert({}, {select: 'body.user.id', equal: 1}, res),
        [{type: 'equal', select: 'body.user.id', expected: 1, actual: 2}]);
      assert.deepEqual(response.assert({}, {select: 'body.user.name', equal: 'Peter'}, res),
        [{type: 'equal', select: 'body.user.name', expected: 'Peter', actual: 'Joe'}]);

      // object value
      assert.deepEqual(response.assert({}, {select: 'body', equal: {user: {id: 2, name: 'Joe'}}}, res), []);
      assert.deepEqual(response.assert({}, {select: 'body', equal: {user: {id: 1, name: 'Joe'}}}, res),
        [{type: 'equal', select: 'body', expected: {user: {id: 1, name: 'Joe'}}, actual: {user: {id: 2, name: 'Joe'}}}]);
    });

    it('defaults select to body', function() {
      assert.deepEqual(response.assert({}, {equal: {user: {id: 2, name: 'Joe'}}}, res), []);
    });

    it('can check equality for a subset of keys on a selected object', function() {
      assert.deepEqual(response.assert({}, {select: 'body.user', equal_keys: {id: 2}}, res), []);
      assert.deepEqual(response.assert({}, {select: 'body.user', equal_keys: {name: 'Joe'}}, res), []);
      assert.deepEqual(response.assert({}, {select: 'body.user', equal_keys: {id: 2, name: 'Joe'}}, res), []);
      assert.deepEqual(response.assert({}, {select: 'body.user', equal_keys: {id: 1}}, res),
        [{type: 'equal_keys', select: 'body.user', expected: {id: 1}, actual: {id: 2, name: "Joe"}, error_messages: ["Invalid keys: id"]}]);
      assert.deepEqual(response.assert({}, {select: 'body.user', equal_keys: {id: 2, name: 'Peter'}}, res),
        [{type: 'equal_keys', select: 'body.user', expected: {id: 2, name: 'Peter'}, actual: {id: 2, name: "Joe"}, error_messages: ["Invalid keys: name"]}]);
    });

    it('can check not_equal on a selector', function() {
      assert.deepEqual(response.assert({}, {select: 'body.user.id', not_equal: 1}, res), []);
      assert.deepEqual(response.assert({}, {select: 'body.user.id', not_equal: 2}, res),
        [{type: 'not_equal', select: 'body.user.id', expected: 2, actual: 2}]);
    });

    it('can check contains/not_contains against array value of selector', function() {
      assert.deepEqual(response.assert({}, {select: 'body.user.visited_site_ids', contains: 100}, resWithVisits), []);
      assert.deepEqual(response.assert({}, {select: 'body.user.visited_site_ids', not_contains: 100}, resWithVisits),
        [{type: 'not_contains', select: 'body.user.visited_site_ids', expected: 100, actual: [100, 101]}]);

      assert.deepEqual(response.assert({}, {select: 'body.user.visited_site_ids', contains: 101}, resWithVisits), []);

      assert.deepEqual(response.assert({}, {select: 'body.user.visited_site_ids', contains: 102}, resWithVisits),
        [{type: 'contains', select: 'body.user.visited_site_ids', expected: 102, actual: [100, 101]}]);
      assert.deepEqual(response.assert({}, {select: 'body.user.visited_site_ids', not_contains: 102}, resWithVisits), []);

      assert.deepEqual(response.assert({}, {select: 'body.user.wished_for_site_ids', contains: 100}, resWithVisits),
        [{type: 'contains', select: 'body.user.wished_for_site_ids', expected: 100, actual: []}]);

      assert.deepEqual(response.assert({}, {select: 'body.user.eventor_clubs', contains: {id: 5, name: 'Östermalms IP'}}, resWithVisits), []);
      assert.deepEqual(response.assert({}, {select: 'body.user.eventor_clubs', contains: {id: 5, name: 'Foo'}}, resWithVisits),
        [{type: 'contains', select: 'body.user.eventor_clubs', expected: {id: 5, name: 'Foo'}, actual: [{id: 5, name: 'Östermalms IP'}]}]);
      assert.deepEqual(response.assert({}, {select: 'body.user.eventor_clubs', not_contains: {id: 5, name: 'Foo'}}, resWithVisits), []);
    });

    it('can validate against a schema', function() {
      var schema1 = {
        type: "object",
        properties: {
          id: {type: "integer"},
          name: {type: "string"}
        },
        required: ["id", "name"],
        additionalProperties: false
      },
      res1 = {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Location": "http://example.com/users/2"
        },
        body: {
          user: {
            id: 2,
            name: "Joe"
          }
        }
      },
      res2 = {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Location": "http://example.com/users/2"
        },
        body: {
          user: {
            foo: 2,
            name: "Joe"
          }
        }
      },
      result = null;

      // no errors
      assert.deepEqual(response.assert({}, {select: 'body.user', schema: schema1}, res1), []);
      assert.deepEqual(response.assert({}, {select: 'body.user', schema: schema1, equal: {id: 2, name: 'Joe'}}, res1), []);
      assert.deepEqual(response.assert({}, {select: 'status', schema: {type: "integer"}}, res1), []);

      // schema doesn't match
      result = response.assert({}, {select: 'body.user', schema: schema1}, res2);
      assert.equal(result.length, 1);
      assert.equal(result[0].type, 'schema');
      assert(result[0].error_messages);

      // equals check doesn't match
      result = response.assert({}, {select: 'body.user', schema: schema1, equal: {id: 9}}, res1);
      assert.equal(result.length, 1);
      assert.equal(result[0].type, 'equal');

      // schema and equals both don't match
      result = response.assert({}, {select: 'body.user', schema: schema1, equal: {foo: 2, name: 'Peter'}}, res2);
      assert.equal(result.length, 2);
      assert.equal(result[0].type, 'schema');
      assert(result[0].error_messages);
      assert.deepEqual(result[1], {type: 'equal', select: 'body.user', expected: {foo: 2, name: 'Peter'}, actual: {foo: 2, name: 'Joe'}});
    });

    it('can invoke JavaScript assert functions', function() {
      var data = {user: {name: "Joe"}},
          nameFunction = function(body) {
            assert.equal(body.user.name, this.user.name);
          },
          errors = null;

      errors = response.assert(data, nameFunction, {body: {user: {name: "Joe"}}});
      assert.deepEqual(errors, []);

      errors = response.assert(data, nameFunction, {body: {user: {name: "Foobar"}}});
      assert.equal(errors.length, 1);
      assert(errors[0].error_message.indexOf("Foobar") !== -1);
      assert(errors[0].error_stack.indexOf("AssertionError") !== -1);
    });
  });
});
