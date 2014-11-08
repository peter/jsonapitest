var util = require('./util');

module.exports = function(context) {
  var loggers = util.array(util.loadModule(context, 'logger'));
  return {
    log: function(key, args) {
      util.each(loggers, function(logger) {
        var logFunction = util.nestedValue.get(logger, key);
        if (logFunction) logFunction.apply(null, args);
      });
    }
  };
};
