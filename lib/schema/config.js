module.exports = {
  type: "object",
  properties: {
    defaults: {
      type: "object",
      properties: {
        api_call: {
          type: "object",
          properties: {
            request: {
              type: "object",
              properties: {
                headers: {type: "object"},
                base_url: {type: "string"},
                method: {type: "string"}
              },
              additionalProperties: false
            },
            status: {type: ["string", "integer"]}
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};
