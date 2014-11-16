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
      type: ["string", "object"],
      properties: {
        it: {type: "string"},
        description: {type: "string"},
        request: {
          type: ["string", "object"],
          properties: {
            method: {type: "string"},
            path: {type: "string"},
            url: {type: "string"},
            params: {type: ["string", "object"]},
            files: {type: "object"},
            headers: {type: ["object", "array", "string"]}
          },
          additionalProperties: false
        },
        status: {type: ["integer", "string"]},
        params: {type: ["string", "object"]},
        headers: {type: ["object", "array", "string"]},
        save: {type: "object"},
        assert: {
          type: ["object", "array"],
          items: {"$ref": "#/definitions/assertion"},
          "$ref": "#/definitions/assertion"
        }
      },
      required: ["request"],
      additionalProperties: false
    },
    select: {
      type: ["string", "object"],
      properties: {
        key: {type: "string"},
        pattern: {type: "string"}
      },
      required: ["key"],
      additionalProperties: false
    },
    assertion: {
      type: ["array", "object"],
      properties: {
        select: {"$ref": "#/definitions/select"},
        schema: {type: ["string", "object"]},
        equal: {},
        not_equal: {},
        equal_keys: {type: ["string", "object"]},
        contains: {},
        not_contains: {},
        contains_keys: {},
        not_contains_keys: {},
        size: {type: "integer"}
      },
      additionalProperties: false,
      required: ["select"]
    }
  },
  properties: {
    name: {type: "string"},
    description: {type: "string"},
    tests: {
      type: "array",
      items: {"$ref": "#/definitions/test"}
    }
  },
  required: ["name", "tests"],
  additionalProperties: false
};
