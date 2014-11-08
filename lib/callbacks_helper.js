var util = require('./util'),
    async = require('async');

module.exports = function(context) {
  var callbacks = util.array(util.loadModule(context, 'callbacks'));
  return {
    run: function(key, args, callback) {
      async.eachSeries(callbacks, function(callback, next) {
        var cbFunction = util.nestedValue.get(callback, key);
        if (cbFunction) {
          if (cbFunction.length === (args.length + 1)) {
            cbFunction.apply(context, args.concat([next]));
          } else {
            cbFunction.apply(context, args);
            next();
          }
        } else {
          next();
        }
      }, callback);
    }
  };
};
