var assert = require('assert'),
    s = require('../../lib/select_helper'),
    util = require('../../lib/util');

var res = {
  status: 200,
  body: {
    users: [{name: 'Joe User'}, {name: 'Foo User'}]
  }  
};

describe('select_helper', function() {
  describe('select', function() {
    it('selects a value from the response', function() {
      assert.deepEqual(s.select(res, {key: 'body.users.name.0'}), 'Joe User');
      assert.deepEqual(s.select(res, {key: 'body.users.name.0', pattern: '^\\w+'}), 'Joe');
      assert.deepEqual(s.select(res, {key: 'body.users.name', pattern: '^\\w+'}), ['Joe', 'Foo']);
      assert.deepEqual(s.select(res, {key: 'body.users.name', pattern: '^\\w+', limit: 1}), ['Joe']);
      assert.deepEqual(s.select(res, {key: 'body.users.name', limit: 1}), ['Joe User']);
      assert.deepEqual(s.select(res, {key: 'body.users.foobar', limit: 1}), [undefined]);

      // With sort
      assert.deepEqual(s.select(res, {key: 'body.users.name', pattern: '^\\w+', sort: 'asc'}), ['Foo', 'Joe']);
      assert.deepEqual(s.select(res, {key: 'body.users.name', pattern: '^\\w+', sort: 'desc'}), ['Joe', 'Foo']);
      assert.deepEqual(s.select(res, {key: 'body.users', sort: {by: 'name'}}), [{name: 'Foo User'}, {name: 'Joe User'}]);


      // Empty case
      assert.strictEqual(s.select(res, {key: 'foobar'}), undefined);
      assert.strictEqual(s.select(res, {key: 'foobar', pattern: '\\w+'}), undefined);
      assert.deepEqual(s.select(res, {key: 'body.users.foobar', pattern: '^\\w+'}), [undefined, undefined]);
    });
  });
});
