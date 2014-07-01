var util = require('./util');

module.exports = function(context) {
  return {
    log: function(key, args) {
      var logger = util.loadModule(context, 'logger'),
        logFunction = logger && util.nestedValue.get(logger, key);
       if (logFunction) logFunction.apply(null, args);
    }
  };
};
