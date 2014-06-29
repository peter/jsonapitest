var assert = require('assert'),
    s = require('../lib/select_helper'),
    util = require('../lib/util');

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
    });
  });
});
