module.exports = {
  type: "object",
  properties: {
    log_path: {type: "string"},
    modules: {
      type: "object",
      properties: {
        logger: {type: ["null", "array", "string"]},
        http_client: {type: "string"},
        assert_functions: {type: "string"}
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
