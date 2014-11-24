var assert = require('assert'),
    filteredList = require('../../../lib/options/filter').filteredList;

describe('options/filter', function() {
  describe('filteredList', function() {
    it('can match beginning of name case insensitive', function() {
      var list = [
        {name: "Articles"},
        {name: "Users"},
        {name: "Categories"}
      ];
      var name = "art";
      var expect = [
        {name: "Articles"}
      ];
      assert.deepEqual(filteredList(list, name), expect);
    });

    it('can match end of name case insensitive', function() {
      var list = [
        {name: "Articles"},
        {name: "Users"},
        {name: "Categories"}
      ];
      var name = "es";
      var expect = [
        {name: "Articles"},
        {name: "Categories"}
      ];
      assert.deepEqual(filteredList(list, name), expect);      
    });

    it('can match middle of name case insensitive', function() {
      var list = [
        {name: "Articles"},
        {name: "Users"},
        {name: "Categories"}
      ];
      var name = "ER";
      var expect = [
        {name: "Users"},
      ];
      assert.deepEqual(filteredList(list, name), expect);      
    });

    it('can return no matches', function() {
      var list = [
        {name: "Articles"},
        {name: "Users"},
        {name: "Categories"}
      ];
      var name = "foobar";
      var expect = [
      ];
      assert.deepEqual(filteredList(list, name), expect);      
    });

    it('can match whole name', function() {
      var list = [
        {name: "Articles"},
        {name: "Users"},
        {name: "Categories"}
      ];
      var name = "Categories";
      var expect = [
        {name: "Categories"}
      ];
      assert.deepEqual(filteredList(list, name), expect);      
    });
  });
});
