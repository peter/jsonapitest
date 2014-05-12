# JSON Driven Api Test

## TODO

* Check response times?

## Example of nested JSON Schema object validation inside Array

```javascript
validator.validate({foo: 1}, {
  type: "object",
  properties: {
    api_calls: {
      type: "array"
    }
  },
  additionalProperties: false,
  required: ["api_calls"]
})
// => 2 ERRORS

validator.validate({tests: [{foo: 1}]}, {
  type: "object",
  properties: {
    tests: {
      type: "array",
      items: {
        type: "object",
        properties: {
          api_calls: {
            type: "array"
          }
        },
        additionalProperties: false,
        required: ["api_calls"]
      }
    }
  }
})
// => 2 ERRORS

validator.validate({tests: [{foo: 1}]}, {
  type: "object",
  definitions: {
    test: {
      type: "object",
      properties: {
        api_calls: {
          type: "array"
        }
      },
      additionalProperties: false,
      required: ["api_calls"]
    }
  },
  properties: {
    tests: {
      type: "array",
      items: {"$ref": "#/definitions/test"}
    }
  }
})
// => 2 ERRORS
```
