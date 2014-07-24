var util = require('./util');

module.exports = function(context) {
  var logger = util.nestedValue.get(context, 'config.modules.logger', ['./loggers/console']);
  if (!util.isArray(logger)) logger = util.compact([logger]);
  return {
    log: function(key, args) {
      util.each(logger, function(value, i) {
        var logModule = util.loadModule(context, ('logger.' + i), value),
            logFunction = util.nestedValue.get(logModule, key);
        if (logFunction) logFunction.apply(null, args);
      });
    }
  };
};
