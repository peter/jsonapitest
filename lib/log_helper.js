var util = require('./util');

module.exports = function(context) {
  var loggers = util.loadModule(context, 'logger');
  if (!util.isArray(loggers)) loggers = util.compact([logModules]);
  return {
    log: function(key, args) {
      util.each(loggers, function(logger) {
        var logFunction = util.nestedValue.get(logger, key);
        if (logFunction) logFunction.apply(null, args);
      });
    }
  };
};
