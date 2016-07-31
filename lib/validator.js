"use strict";
var ZSchema = require("z-schema")
var validator = new ZSchema({});

exports.validate = function(json, schema) {
  validator.validate(json, schema);
  return validator.getLastErrors() || [];
};
