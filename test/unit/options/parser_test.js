var assert = require('assert'),
    parse = require('../../../lib/options/parser').parse;

describe('options/parser', function() {
  describe('parse', function() {
    it('can parse options on long form (--option) with a value along with other args', function() {
      var args = [
        'first_file.js',
        '--test',
        'get',
        '--suite',
        'users',
        'second_file.js'
      ];
      var expect = {
        args: ['first_file.js', 'second_file.js'],
        options: {
          test: 'get',
          suite: 'users'
        }
      };
      assert.deepEqual(parse(args, ['test', 'suite']), expect);
    });

    it('can parse options on short form (-opt) with a value along with other args', function() {
      var args = [
        '-t',
        'get',
        'first_file.js',
        'second_file.js',
        '-s',
        'users'
      ];
      var expect = {
        args: ['first_file.js', 'second_file.js'],
        options: {
          test: 'get',
          suite: 'users'
        }
      };
      assert.deepEqual(parse(args, ['test', 'suite']), expect);
    });

    it('it throws an error for invalid option names', function() {
      var args = [
        'first_file.js',
        '--foobar',
        'get',
        '--suite',
        'users',
        'second_file.js'
      ];
      assert.throws(
        function() {
          parse(args, ['test', 'suite']);
        },
        function(err) {
          return err.message === 'Invalid option foobar, must be one of: test, suite';
        }
      );
    });

    it('it throws an error if an option is missing its value', function() {
      var args = [
        'first_file.js',
        '--suite'
      ];
      assert.throws(
        function() {
          parse(args, ['test', 'suite']);
        },
        function(err) {
          return err.message === 'Missing value for option suite';
        }
      );
    });    
  });
});
