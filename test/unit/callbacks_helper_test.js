var assert = require('assert'),
    util = require('../../lib/util'),
    callbacksHelper = require('../../lib/callbacks_helper'),
    emptyContext = require('../../lib/context_parser').emptyContext;

describe('callbacks_helper', function() {
  describe('run', function() {
    it('uses console callback if callbacks is undefined', function(done) {
      callbacksHelper(emptyContext()).run('all.start', [], function() {
        callbacksHelper(emptyContext()).run('all.end', [true, {}], done);
      });
    });

    it('does nothing if modules.callbacks is null', function(done) {
      var context = util.merge(emptyContext(), {config: {modules: {callbacks: null}}});
      callbacksHelper(context).run('all.start', [], done);
    });

    it('does nothing if modules.callbacks is empty array', function(done) {
      var context = util.merge(emptyContext(), {config: {modules: {callbacks: []}}});
      callbacksHelper(context).run('all.start', [], done);
    });

    it('can invoke several custom callbacks, sync and async', function(done) {
      var events = [],
        log = function(key, self, args) {
          events.push({key: key, self: self, args: args});
        },
        syncCallback = {
          all: {
            start: function() {
              log('sync.all.start', this, util.args(arguments));
            }
          }
        },
        asyncCallback = {
          all: {
            start: function(next) {
              log('async.all.start', this, util.args(arguments));
              next();
            },
            end: function(success, result, next) {
              log('async.all.end', this, util.args(arguments));
              next();
            }
          }
        },
        context = util.merge(emptyContext(), {config: {modules: {callbacks: [syncCallback, asyncCallback]}}}),
        callbacks = callbacksHelper(context);

      callbacks.run('all.start', [], function() {
        assert.deepEqual(util.pluck(events, 'key'), ['sync.all.start', 'async.all.start']);
        assert.deepEqual(util.pluck(events, 'self'), [context, context]);
        assert.deepEqual(util.pluck(events, 'args')[0], []);
        assert.equal(util.pluck(events, 'args')[1].length, 1);
        callbacks.run('all.end', [true, {}], function() {
          assert.deepEqual(util.pluck(events, 'key'), ['sync.all.start', 'async.all.start', 'async.all.end']);
          assert.deepEqual(util.pluck(events, 'self'), [context, context, context]);
          assert.equal(util.pluck(events, 'args')[2].length, 3);
          done();
        });
      });
    });
  });
});
