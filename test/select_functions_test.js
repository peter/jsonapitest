var assert = require('assert'),
    s = require('../lib/select_functions'),
    util = require('../lib/util');

var res = {
  status: 200,
  body: {
    users: [{name: 'Joe User'}, {name: 'Foo User'}]
  }  
};

describe('select_functions', function() {
  describe('key', function() {
    it('returns value for nested key from response', function() {
      assert.deepEqual(s.key('body.users.name', res), ['Joe User', 'Foo User']);
      assert.deepEqual(s.key('body.users.name.0', res), 'Joe User');
      assert.deepEqual(s.key('body.users', res), [{name: 'Joe User'}, {name: 'Foo User'}]);
    });
  });

  describe('pattern', function() {
    it('extracts pattern from response', function() {
      assert.deepEqual(s.pattern('^\\w+', ['Joe User', 'Foo User']), ['Joe', 'Foo']);
      assert.deepEqual(s.pattern('^(\\w+) \\w+$', ['Joe User', 'Foo User']), ['Joe', 'Foo']);
      assert.deepEqual(s.pattern('^\\w+ (\\w+)$', ['Joe User', 'Foo User']), ['User', 'User']);
    });
  });
});
