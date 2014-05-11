module.exports = {
  data: {
    type: "object"
  },
  config: {
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
  },
  suite: {
    type: "object",
    definitions: {
      request: {
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
        }
      }
    },
    properties: {
      name: {type: "string"},
      tests: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {type: "string"},
            description: {type: "string"},
            requests: {
              type: "array",
              items: {"$ref": "#/definitions/request"}
            }
          }
        }
      }
    },
    required: ["name", "tests"],
    additionalProperties: false
  }
};
