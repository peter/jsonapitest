var assert = require('assert'),
    a = require('../../lib/assert_helper'),
    util = require('../../lib/util');

describe('assert_helper', function() {
  describe('parseFunctions', function() {
    it('returns positive/negative and function names for all assertions', function() {
      assert.deepEqual(a.parseFunctions({select: 'body.user.name', not_equal: 'User', contains: 'Joe'}),
        [{positive: false, functionName: 'equal', key: 'not_equal', value: 'User'}, {positive: true, functionName: 'contains', key: 'contains', value: 'Joe'}]);
      assert.deepEqual(a.parseFunctions({select: 'body.user.name', not_foo: {bar: 1}}),
        [{positive: false, functionName: 'foo', key: 'not_foo', value: {bar: 1}}]);
    });
  });

  describe('errors', function() {
    it('returns errors for failed positive/negative assertions', function() {
      assert.deepEqual(a.errors({select: 'body.user.name', equal: 'Joe User', not_contains: 'Joe'}, 'Joe User'),
        [{type: 'not_contains', select: 'body.user.name', expected: 'Joe', actual: 'Joe User'}]);
    });

    it('returns empty array if there are no errors', function() {
      assert.deepEqual(a.errors({select: 'body.user.name', equal: 'Joe User', contains: 'Joe'}, 'Joe User'), []);
    });
  });
});
