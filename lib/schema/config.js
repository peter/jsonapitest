module.exports = {
  type: "object",
  properties: {
    defaults: {
      type: "object",
      properties: {
        request: {
          type: "object",
          properties: {
            headers: {type: "object"},
            base_url: {type: "string"}
          },
          additionalProperties: false
        },
        response: {
          type: "object",
          properties: {
            status: {type: ["integer", "array"]}
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};
