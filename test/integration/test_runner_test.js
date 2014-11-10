var assert = require('assert'),
    join = require('path').join,
    testRunner = require('../../lib/test_runner'),
    fileParser = require('../../lib/file_parser')
    util = require('../../lib/util');

var parseExamplePaths = util.map(['config.json', 'data.json', 'crud_test.json'], function(filename) {
  return join(__dirname, '../../doc/examples/parse', filename);
});

describe('test_runner', function() {
  describe('run', function() {    
    it('runs parse CRUD example with default http_client (superagent) and default callbacks (console)', function(done) {
      this.timeout(50000); // 50 seconds (default is 2 seconds)
      var _context = fileParser.read(parseExamplePaths);
      testRunner.run(_context, function(success, results) {
        assert.equal(success, true);
        done();
      });
    });

    it('runs parse CRUD example with request http_client and console/curl callbacks', function(done) {
      this.timeout(50000); // 50 seconds (default is 2 seconds)
      var _context = fileParser.read(parseExamplePaths);
      _context.config.modules = {
        http_client: './http_clients/request',
        callbacks: ['./callbacks/console', './callbacks/curl']
      };
      testRunner.run(_context, function(success, results) {
        assert.equal(success, true);
        done();
      });
    });
  });
});
