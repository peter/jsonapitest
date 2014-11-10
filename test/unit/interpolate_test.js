var assert = require('assert'),
    interpolate = require('../../lib/interpolate');

var errorValidator = function(code) {
  return function(err) {
    return err.code === code && err.message.length > 0 && err.toString() === err.message;
  };
};

describe('interpolate', function() {
  describe('value', function() {
    it('throws exception on non-strings', function() {
      assert.throws(
        function() {
          interpolate.value({foo: 1}, {foo: 'bar'});
        },
        errorValidator('interpolate_non_string')
      );
    });

    it('can interpolate string that consist only of a single variable interpolation so that it is replaced by a different type (number, object etc.)', function() {
      var data = {a: {b: {c: 1}}};
      assert.strictEqual(interpolate.value("{{foo}}", data), undefined);
      assert.deepEqual(interpolate.value("{{a}}", data), {b: {c: 1}});
      assert.deepEqual(interpolate.value("{{a }}", data), {b: {c: 1}});
      assert.deepEqual(interpolate.value("{{ a }}", data), {b: {c: 1}});
      assert.deepEqual(interpolate.value("{{a.b}}", data), {c: 1});
      assert.deepEqual(interpolate.value("{{a.b.c}}", data), 1);
      assert.equal(interpolate.value("{{a. b.c}}", data), "{{a. b.c}}", "invalid key should be left alone");
      assert.strictEqual(interpolate.value("{{a.b.c.d}}", data), undefined);
    });

    it('can interpolate global/magic variables starting with a dollar sign', function() {
      var data = {a: 1, $a: 2};
      assert.deepEqual(interpolate.value("{{a}}", data), 1);
      assert.deepEqual(interpolate.value("{{$a}}", data), 2);
    });

    it('can interpolate variables starting with underscore', function() {
      var data = {post: {_id: 1}};
      assert.deepEqual(interpolate.value("{{post}}", data), {_id: 1});
      assert.equal(interpolate.value("{{post._id}}", data), 1);
    });

    it('can interpolate string with many embedded variables', function() {
      var data = {a: {b: {c: 1}}, d: 2};
      assert.deepEqual(interpolate.value("{{foo}}{{foo}}", data), null);
      assert.deepEqual(interpolate.value("{{a.b.c}} {{d}}", data), "1 2");
      assert.deepEqual(interpolate.value("a {{a.b.c}} b {{a.b.c}} c", data), "a 1 b 1 c");
      assert.deepEqual(interpolate.value("{{a.b.c}} b {{a.b.c}}", data), "1 b 1");
      assert.deepEqual(interpolate.value("{{a. b.c}} b {{a.b.c}}", data), "{{a. b.c}} b 1");
    });
  });

  describe('deep', function() {
    it('works with a typical api call', function() {
      assert.deepEqual(
        interpolate.deep(
          {request: {path: '/v1/users/{{users.member.id}}'}, response: {body: {equal: {name: "{{users.member.name}}"}}}},
          {users: {member: {id: 404, name: 'Peter M'}}}),
        {request: {path: '/v1/users/404'}, response: {body: {equal: {name: "Peter M"}}}}
      );
    });

    it('works with assert hashes with a length property (would break lodash.each)', function() {
      assert.deepEqual(
        interpolate.deep(
          {
            select: "body.section.widget_versions",
            length: 1,
            contains_keys: {
              _id: "{{widget_version.first_puff._id}}",
              title: "{{widget_version.first_puff.title}}"
            }
          },
          {widget_version: {first_puff: {_id: 123, title: 'Main'}}}),
          {
            select: "body.section.widget_versions",
            length: 1,
            contains_keys: {
              _id: 123,
              title: "Main"
            }
          }
      );
    });
  });
});
