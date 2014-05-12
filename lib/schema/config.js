module.exports = {
  type: "object",
  definitions: {
    environment: {
      type: "object",
      properties: {
        base_url: {
          type: "string",
          format: "uri"
        }
      },
      required: ["base_url"],
      additionalProperties: false
    }
  },
  properties: {
    environments: {
      type: "object",
      properties: {
        test: {"$ref": "#/definitions/environment"},
        staging: {"$ref": "#/definitions/environment"}
      },
      required: ["test"]
    }
  },
  required: ["environments"]
};
