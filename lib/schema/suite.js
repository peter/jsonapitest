module.exports = {
  type: "object",
  definitions: {
    test: {
      type: "object",
      properties: {
        name: {type: "string"},
        description: {type: "string"},
        api_calls: {
          type: "array",
          items: {"$ref": "#/definitions/api_call"}
        }
      },
      required: ["name", "api_calls"],
      additionalProperties: false
    },
    api_call: {
      type: "object",
      properties: {
        request: {
          type: "object",
          properties: {
            method: {type: "string"},
            path: {type: "string"},
            params: {type: "object"},
            files: {type: "object"},
            headers: {type: ["object", "array", "string"]}
          },
          required: ["path"],
          additionalProperties: false
        },
        status: {type: ["integer", "string"]},
        save: {type: "object"},
        assert: {
          type: "array",
          items: {"$ref": "#/definitions/assertion"},
        }
      },
      required: ["request"],
      additionalProperties: false
    },
    assertion: {
      type: "object",
      properties: {
        select: {type: "string"},
        schema: {type: ["string", "object"]},
        equal: {},
        not_equal: {},
        equal_keys: {type: "object"},
        contains: {},
        not_contains: {},
        length: {type: "integer"}
      },
      additionalProperties: false,
      required: ["select"]
    }
  },
  properties: {
    name: {type: "string"},
    tests: {
      type: "array",
      items: {"$ref": "#/definitions/test"}
    }
  },
  required: ["name", "tests"],
  additionalProperties: false    
};
