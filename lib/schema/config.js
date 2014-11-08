module.exports = {
  type: "object",
  properties: {
    log_path: {type: "string"},
    modules: {
      type: "object",
      properties: {
        callbacks: {type: ["null", "array", "string", "object"]},
        http_client: {type: ["string", "object"]},
        assert_functions: {type: ["string", "object"]}
      },
      additionalProperties: false
    },
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
