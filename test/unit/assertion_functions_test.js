'use strict';

var assert = require('assert'),
    a = require('../../lib/assert_functions');

describe('assert_functions', function() {
  describe('schema', function() {
    it('returns object with error_messages property if schema doesnt validate', function() {
      var schema = {
        type: 'object',
        properties: {
          id: {type: 'integer'},
          name: {type: 'string'},
          email: {type: 'string'}
        },
        required: ['id', 'email'],
        additionalProperties: false
      };
      assert.deepEqual(a.schema({id: 1, name: 'Joe', email: 'joe@example.com'}, {type: 'object'}), {error_messages: []});
      assert.deepEqual(a.schema({id: 1, name: 'Joe', email: 'joe@example.com'}, schema), {error_messages: []});
      assert.equal(a.schema({name: 'Joe', email: 'joe@example.com'}, schema).error_messages.length, 1);
    });
  });

  describe('equal', function() {
    it('checks deep equality on objects and arrays', function() {
      assert.equal(a.equal({foo: 1, bar: {baz: 2}}, {foo: 1, bar: {baz: 2}}), true);
      assert.equal(a.equal({foo: 1, bar: {baz: 3}}, {foo: 1, bar: {baz: 2}}), false);
      assert.equal(a.equal({foo: 1}, {foo: 1}), true);
      assert.equal(a.equal({foo: 1}, {foo: 2}), false);
      assert.equal(a.equal(['foo', [{bar: 'bar'}]], ['foo', [{bar: 'bar'}]]), true);
      assert.equal(a.equal(['foo', ['bar']], ['foo', ['bars']]), false);
      assert.equal(a.equal(['foo'], ['foo']), true);
      assert.equal(a.equal(['foo'], ['foo', 'bar']), false);
    });

    it('treats null/undefined as equal', function() {
      assert.equal(a.equal(null, null), true);
      assert.equal(a.equal(undefined, null), true);
    });

    it('does string comparison on numbers, strings, and booleans', function() {
      assert.equal(a.equal(5, 5), true);
      assert.equal(a.equal(5, 6), false);
      assert.equal(a.equal(5, '5'), true);
      assert.equal(a.equal('5', 5), true);
      assert.equal(a.equal('5', 6), false);
      assert.equal(a.equal('foo', 'foo'), true);
      assert.equal(a.equal('foo', 'bar'), false);
      assert.equal(a.equal(true, true), true);
      assert.equal(a.equal(false, false), true);
      assert.equal(a.equal(false, true), false);
      assert.equal(a.equal(true, 'true'), true);
      assert.equal(a.equal('true', true), true);
    });
  });

  describe('equal_keys', function() {
    it('returns true for objects where values match for all keys', function() {
      assert.deepEqual(a.equal_keys({foo: 1, bar: 2}, {foo: 1}), {error_messages: []});
      assert.deepEqual(a.equal_keys({foo: 1, bar: 2}, {foo: 2}), {error_messages: ["Invalid keys: foo"]});
      assert.deepEqual(a.equal_keys({foo: 1, bar: 2}, {foo: 1, bar: 2}), {error_messages: []});
      assert.deepEqual(a.equal_keys({foo: 1, bar: 2}, {foo: 1, bar: 3}), {error_messages: ["Invalid keys: bar"]});
      assert.deepEqual(a.equal_keys({foo: 1, bar: 2}, {foo: 1, bar: 2, baz: 3}), {error_messages: ["Invalid keys: baz"]});
      assert.deepEqual(a.equal_keys({}, {foo: 1}), {error_messages: ["Invalid keys: foo"]});
      assert.deepEqual(a.equal_keys({bar: 1}, {foo: 1}), {error_messages: ["Invalid keys: foo"]});
    });

    it('returns false for non-objects', function() {
      assert.deepEqual(a.equal_keys(null, {foo: 1}), {error_messages: ["Invalid keys: foo"]});
      assert.deepEqual(a.equal_keys(undefined, {foo: 1}), {error_messages: ["Invalid keys: foo"]});
      assert.deepEqual(a.equal_keys(['foo'], {foo: 1}), {error_messages: ["Invalid keys: foo"]});
      assert.deepEqual(a.equal_keys('foo', {foo: 1}), {error_messages: ["Invalid keys: foo"]});
      assert.deepEqual(a.equal_keys(5, {foo: 1}), {error_messages: ["Invalid keys: foo"]});
      assert.deepEqual(a.equal_keys(true, {foo: 1}), {error_messages: ["Invalid keys: foo"]});
    });
  });

  describe('contains', function() {
    it('works for arrays', function() {
      assert.equal(a.contains(['a', 'b', 'c'], 'a'), true);
      assert.equal(a.contains(['a', 'b', 'c'], 'b'), true);
      assert.equal(a.contains(['a', 'b', 'c'], 'd'), false);
      assert.equal(a.contains(['a', 'b', 'c'], null), false);
      assert.equal(a.contains([{foo: 'a'}, {foo: 'b'}, {foo: 'c'}], {foo: 'b'}), true);
      assert.equal(a.contains([{foo: 'a'}, {foo: 'b'}, {foo: 'c'}], {foo: 'd'}), false);
      assert.equal(a.contains([6, 5, 4], 4), true);
      assert.equal(a.contains([6, 5, 4], 7), false);
      assert.equal(a.contains([6, 5, 4], '4'), true);
    });

    it('returns false for null/undefined', function() {
      assert.equal(a.contains(null, 'a'), false);
      assert.equal(a.contains(undefined, 'a'), false);
    });

    it('works for strings and objects', function() {
      assert.equal(a.contains('foobar', 'foo'), true);
      assert.equal(a.contains('foobar', 'ooba'), true);
      assert.equal(a.contains('foobar', 'bar'), true);
      assert.equal(a.contains('foobar', 'bars'), false);
      assert.equal(a.contains({foo: 'bar'}, 'bar'), true);
      assert.equal(a.contains({foo: 'bar'}, 'foo'), true);
      assert.equal(a.contains({foo: 'bar'}, 'foos'), false);
      assert.equal(a.contains(5, '5'), true);
      assert.equal(a.contains(5, '6'), false);
    });
  });

  describe('contains_keys', function() {
    it('applies an equal_keys to arrays', function() {
      var select = [{foo: 'a', bar: 1}, {foo: 'b', bar: 2}, {foo: 'c', bar: 3}];
      assert.equal(a.contains_keys(select, {foo: 'a'}), true);
      assert.equal(a.contains_keys(select, {foo: 'a', bar: 1}), true);
      assert.equal(a.contains_keys(select, {foo: 'a', bar: 2}), false);
      assert.equal(a.contains_keys(select, {foobar: 'a'}), false);
    });
  });

  describe('size', function() {
    it('returns true for strings/arrays with certain length', function() {
      // arrays
      assert.equal(a.size(['a', 'b'], 2), true);
      assert.equal(a.size(['a', 'b'], 1), false);
      assert.equal(a.size(['a'], 1), true);
      assert.equal(a.size([], 0), true);
      assert.equal(a.size([], 1), false);

      // strings
      assert.equal(a.size('foobar', 6), true);
      assert.equal(a.size('foobar', 5), false);
      assert.equal(a.size('', 0), true);
      assert.equal(a.size('', 1), false);
    });

    it('returns false for null and values without length property', function() {
      assert.equal(a.size(null, 1), false);
      assert.equal(a.size(null, 0), false);
      assert.equal(a.size(undefined, 0), false);
      assert.equal(a.size(5, 1), false);
      assert.equal(a.size({foo: 1}, 1), false);
    });
  });

  describe('type', function() {
    it('can check valid types', function() {
      var validTypes = [
        ['number', 5],
        ['null', null],
        ['boolean', true],
        ['boolean', false],
        ['string', 'foobar'],
        ['string?', undefined],
        ['string?', null],
        ['string', 'foobar'],
        ['object', {foo: 1}],
        [{}, {foo: 1}],
        [{foo: 'number'}, {foo: 1}],
        [['number'], [3]]
      ];
      validTypes.forEach(function(t) {
        var explain = 'type ' + t[0] + ' should match value ' + t[1];
        assert.equal(a.type(t[1], t[0]).error_messages.length, 0, explain);
      });
    });

    it('can check invalid types', function() {
      var invalidTypes = [
        ['number', '5'],
        ['string', true],
        ['string?', 4],
        ['string?', {}],
        ['string?', function() {}],
        ['object', []],
        ['object', function() {}],
        [['number'], ['3']]
      ];
      invalidTypes.forEach(function(t) {
        var explain = 'type ' + t[0] + ' should *not* match value ' + t[1];
        assert.equal(a.type(t[1], t[0]).error_messages.length, 1, explain);
      });
    });
  });
});
