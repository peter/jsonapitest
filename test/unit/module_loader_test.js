var assert = require('assert'),
    m = require('../../lib/module_loader'),
    util = require('../../lib/util');

describe('module_loader', function() {
  describe('load', function() {    
    it('can load configured modules from paths', function() {
      var config = {modules: {callbacks: './callbacks/curl'}};
      assert.deepEqual(m.load({config: config}, 'callbacks').api_call.end.toString(), require('../../lib/callbacks/curl').api_call.end.toString());
    });

    it('can use configured pre-loaded modules', function() {
      var myModule = {foo: 'bar'},
          config = {modules: {callbacks: myModule}};
      assert.deepEqual(m.load({config: config}, 'callbacks'), myModule);
    })

    it('can load default modules', function() {
      assert.deepEqual(m.load({}, 'callbacks')[0].suite.start.toString(), require('../../lib/callbacks/console').suite.start.toString());
      assert.deepEqual(m.load({}, 'http_client'), require('../../lib/http_clients/superagent'));
      assert.equal(m.load({}, 'foobar'), null);
      assert.equal(m.load({}, 'foobar'), null);
    });
  });
});
