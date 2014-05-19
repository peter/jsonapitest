var assert = require('assert'),
    util = require('../lib/util'),
    response = require('../lib/response');

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

describe('response', function() {
  describe('select', function() {
    it('returns a value from the response given a key', function() {
      assert.deepEqual(response.select(res, {select: 'body.user'}), {id: 2, name: "Joe"});
      assert.equal(response.select(res, {select: 'body.user.id'}), 2);
      assert.equal(response.select(res, {select: 'body.user.name'}), 'Joe');
      assert.equal(response.select(res, {select: 'headers.Location'}), "http://example.com/users/2");

      assert.equal(response.select(res, {select: 'body.user.foo'}), null);
      assert.equal(response.select(res, {select: 'foo'}), null);
    });

    it('returns a value from the response given a key and a regexp pattern', function() {
      assert.equal(response.select(res, {select: 'headers.Location', pattern: "(\\d+)$"}), "2");
      assert.equal(response.select(res, {select: 'headers.Location', pattern: "example\\.com"}), "example.com");
      
      assert.equal(response.select(res, {select: 'headers.Location', pattern: "foobar"}), null);
      assert.equal(response.select(res, {select: 'foobar', pattern: "foobar"}), null);
    });
  });

  describe('save', function() {
    it('saves selected values into the data with certain keys', function() {
      var data = {},
          r = util.deepMerge(res, {save: {"user.new": {select: "body.user.id"}}});
      response.save(r, data);
      assert.deepEqual(data, {"user": {"new": 2}})
    });

    it('overwrites existing data value', function() {
      var data = {"user": {"new": "foobar"}},
          r = util.deepMerge(res, {save: {"user.new": {select: "body.user.id"}}});
      response.save(r, data);
      assert.deepEqual(data, {"user": {"new": 2}})      
    });

    it('writes null if selector doesnt match', function() {
      var data = {},
          r = util.deepMerge(res, {save: {"user.new": {select: "foobar"}}});
      response.save(r, data);
      assert.deepEqual(data, {"user": {"new": null}})
    });

    it('can save multiple values', function() {
      var data = {},
          r = util.deepMerge(res, {save: {
            "user.new.name": {select: "body.user.name"},
            "user.new.id": {select: "headers.Location", pattern: "(\\d+)$"}}
          });
      response.save(r, data);
      assert.deepEqual(data, {"user": {"new": {id: "2", name: "Joe"}}})
    });
  });
});
