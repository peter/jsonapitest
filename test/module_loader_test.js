var assert = require('assert'),
    m = require('../lib/module_loader'),
    util = require('../lib/util');

describe('module_loader', function() {
  describe('load', function() {    
    it('can load configured modules', function() {
      var config = {modules: {logger: './loggers/curl'}};
      assert.deepEqual(m.load({config: config}, 'logger').api_call.start, require('../lib/loggers/curl')(config).api_call.start);
    });

    it('can load default modules', function() {
      assert.deepEqual(m.load({}, 'logger')[0].suite.start.toString(), require('../lib/loggers/console')(null).suite.start.toString());
      assert.deepEqual(m.load({}, 'http_client'), require('../lib/http_clients/superagent'));
      assert.equal(m.load({}, 'foobar'), null);
      assert.equal(m.load({}, 'foobar'), null);
    });
  });
});
