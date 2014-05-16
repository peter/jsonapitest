var assert = require('assert'),
    util = require('../lib/util');

describe('util', function() {
  describe('deepMerge', function() {
    it('merges two objects recursively and non-destructively', function() {
      var object1 = {a: 0, b: 2, c: {d: 3}, e: {f: 4, g: 5}},
          object2 = {b: 3, c: 4, e: {f: 5, h: 6}},
          result = util.deepMerge(object1, object2);
      assert.deepEqual(result, {a: 0, b: 3, c: 4, e: {f: 5, g: 5, h: 6}})
      result.e.f = 100;
      assert.deepEqual({a: 0, b: 2, c: {d: 3}, e: {f: 4, g: 5}}, object1); // unchanged      

      assert.deepEqual(util.deepMerge({}, {a: 0}), {a: 0});
      assert.deepEqual(util.deepMerge({a: 1}, {}), {a: 1});
      assert.deepEqual(util.deepMerge({a: 1}, {b: 1}), {a: 1, b: 1});
      assert.deepEqual(util.deepMerge({a: 1}, {a: 2, b: 1}), {a: 2, b: 1});
      assert.deepEqual(util.deepMerge({a: "1"}, {a: "2", b: "1"}), {a: "2", b: "1"});
      assert.deepEqual(util.deepMerge({a: "1"}, {a: {b: "1"}}), {a: {b: "1"}});

      object1 = {a: 1};
      object2 = {b: {c: 2}};
      result = util.deepMerge(object1, object2);
      assert.deepEqual(result, {a: 1, b: {c: 2}});
      result.b.c = 3;
      assert.deepEqual(object2, {b: {c: 2}}, "merged object should be unchanged");
    });
  });

  describe('nestedValue.get', function() {
    it('works', function() {
      assert.equal(util.nestedValue.get({foo: {bar: 1}}, 'foo.bar'), 1);
      assert.equal(util.nestedValue.get({foo: {bar: "1"}}, 'foo.bar'), "1");
      assert.deepEqual(util.nestedValue.get({foo: {bar: {baz: 2}}}, 'foo.bar'), {baz: 2});
    });

    it('returns null if key doesnt exist', function() {
      assert.equal(util.nestedValue.get({foo: 1}, 'foo.bar'), null);
      assert.equal(util.nestedValue.get({}, 'foo.bar'), null);
    });
  });
  describe('nestedValue.set', function() {
    it('works', function() {
      // Already has value
      var hash = {foo: 1};
      util.nestedValue.set(hash, 'foo', 2)
      assert.deepEqual(hash, {foo: 2});

      // Missing
      hash = {};
      util.nestedValue.set(hash, 'foo', 1);
      assert.deepEqual(hash, {foo: 1});

      // Null
      hash = {foo: null};
      util.nestedValue.set(hash, 'foo', 1);
      assert.deepEqual(hash, {foo: 1});      

      // Nested hash
      hash = {foo: {bar: {baz: 2}}};
      util.nestedValue.set(hash, 'foo.bar', 1);
      assert.deepEqual(hash, {foo: {bar: 1}});      

      // Nested missing
      hash = {foo: {bar: {baz: 2}}};
      util.nestedValue.set(hash, 'bla.bla', 1);
      assert.deepEqual(hash, {foo: {bar: {baz: 2}}, bla: {bla: 1}});      
    });
  });
});
