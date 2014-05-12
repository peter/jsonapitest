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
            headers: {type: ["object", "array"]}
          },
          required: ["path"],
          additionalProperties: false
        },
        response: {
          type: "object",
          properties: {
            status: {type: ["integer", "string"]},
            body: {type: ["string", "object"]},
            headers: {type: ["object", "array"]}              
          },
          additionalProperties: false
        }
      },
      required: ["request"],
      additionalProperties: false
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
