var assert = require('assert'),
    apiCall = require('../lib/api_call');

var errorValidator = function(code) {
  return function(err) {
    return err.code === code && err.message.length > 0 && err.toString() === err.message;
  };
};

describe('api_call', function() {
  describe('interpolate', function() {
    it('throws exception on non-strings', function() {
      assert.throws(
        function() {
          apiCall.interpolate({foo: 1}, {foo: 'bar'});          
        },
        errorValidator('interpolate_non_string')
      );
    });

    it('can interpolate string that consist only of a single variable interpolation so that it is replaced by a different type (number, object etc.)', function() {
      var data = {a: {b: {c: 1}}};
      assert.deepEqual(apiCall.interpolate("{{foo}}", data), null);
      assert.deepEqual(apiCall.interpolate("{{a}}", data), {b: {c: 1}});
      assert.deepEqual(apiCall.interpolate("{{a }}", data), {b: {c: 1}});
      assert.deepEqual(apiCall.interpolate("{{ a }}", data), {b: {c: 1}});
      assert.deepEqual(apiCall.interpolate("{{a.b}}", data), {c: 1});
      assert.deepEqual(apiCall.interpolate("{{a.b.c}}", data), 1);
      assert.equal(apiCall.interpolate("{{a. b.c}}", data), "{{a. b.c}}", "invalid key should be left alone");
      assert.deepEqual(apiCall.interpolate("{{a.b.c.d}}", data), null);
    });

    it('can interpolate string with many embedded variables', function() {
      var data = {a: {b: {c: 1}}};
      assert.deepEqual(apiCall.interpolate("{{foo}}{{foo}}", data), null);
      assert.deepEqual(apiCall.interpolate("a {{a.b.c}} b {{a.b.c}} c", data), "a 1 b 1 c");
      assert.deepEqual(apiCall.interpolate("{{a.b.c}} b {{a.b.c}}", data), "1 b 1");
      assert.deepEqual(apiCall.interpolate("{{a. b.c}} b {{a.b.c}}", data), "{{a. b.c}} b 1");
    });
  });

  describe('arrayMerge', function() {
    it('works', function() {
      assert.deepEqual(apiCall.arrayMerge([{bla: 0, foo: {nested: 1}}, {foo: {nested: 2}, bar: 3}, {foo: {nested: 3}, bar: 4, baz: 5}]), {bla: 0, foo: {nested: 3}, bar: 4, baz: 5});
    });
  });
});
