module.exports = {
  type: ["object", "null", "undefined"],
  properties: {
    suite: {type: "string"},
    test: {type: "string"}
  },
  additionalProperties: false
};
