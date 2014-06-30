"use strict";
var JaySchema = require('jayschema');
var jayschema = new JaySchema();

exports.validate = jayschema.validate.bind(jayschema);
