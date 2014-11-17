var assert = require('assert'),
    join = require('path').join,
    testRunner = require('../../lib/test_runner'),
    fileParser = require('../../lib/file_parser')
    util = require('../../lib/util');

var exampleFilePath = function(filename) {
  return join(__dirname, '../../doc/examples/parse', filename);
};

var parseExamplePaths = util.map(['config.json', 'data.json', 'crud_test.json'], exampleFilePath);

var setTimeout = function(test) {
  test.timeout(50000); // 50 seconds (default is 2 seconds)
};

describe('test_runner', function() {
  describe('run', function() {
    it('runs parse CRUD example with default http_client (superagent) and default callbacks (console)', function(done) {
      setTimeout(this);
      var _context = fileParser.read(parseExamplePaths);
      delete _context.config.log_path;
      testRunner.run(_context, function(success, results) {
        assert.equal(success, true);
        done();
      });
    });

    it('runs parse CRUD example with request http_client and console/curl callbacks', function(done) {
      setTimeout(this);
      var _context = fileParser.read(parseExamplePaths);
      _context.config.modules = {
        http_client: './http_clients/request',
        callbacks: ['./callbacks/console', './callbacks/curl']
      };
      delete _context.config.log_path;
      testRunner.run(_context, function(success, results) {
        assert.equal(success, true);
        done();
      });
    });

    it('runs parse CRUD JavaScript example with default settings', function(done) {
      setTimeout(this);
      var paths = parseExamplePaths
      paths[paths.length - 1].replace('.json', 'js');
      var _context = fileParser.read(paths);
      delete _context.config.log_path;
      testRunner.run(_context, function(success, results) {
        assert.equal(success, true);
        done();
      });
    });
  });
});
