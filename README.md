# JSON API Test

JSON driven testing of JSON HTTP APIs (REST APIs). Uses JSON Schema for validation.

This is a test framework targeted at JSON HTTP REST APIs. It comes in the form of a Node.js package called jsonapitest
that is available on the command line to run your tests. Tests are specified in JSON files and have the structure of
test suites containing a set of tests. Each test contains a list of API calls (HTTP requests) with assertions about the
response. All HTTP traffic is logged exhaustively by the test runner to help debug test failures.
Any data (database records, user credentials etc.) that the tests need are specified in JSON format and this is
easily be interpolated in the API calls. The test runner only needs to be configured with a log file, a base_url for
your API (i.e. a local development/test server or a remote staging server) and any default headers that your API calls need.

## Motivation

I had a REST API implemented in Node.js that I needed to test and I started out using Mocca and Supertest. Although this approach did the job
I found the resulting code time consuming, messy, and complex. Also, I didn't like the fact that my
tests were coupled to the implementation. I tried doing some semi automated testing with curl and although I appreciate the simplicity
of curl the approach wasn't sufficiently structured and automated for my needs. What I was looking for was a declarative and black-box
way to do API testing. Here are a few selling (and discussion) points:

* Black box testing of APIs means the tests are not tied to the implementation behind the API (i.e. programming language, database etc.)
* Black box testing will encourage you to design more complete and user friendly APIs (since you cannot easily poke at the implementation)
* As test definitions are simple and pure data structures you are not tied to any particular test framework implementation. This means the test runner, the http client and the assertion engine could all be re-implemented and swapped out fairly easily.
* The fact that you are constrainted to a simple JSON structure for tests will help keep your tests dumb and devoid of complicated logic. This makes maintenance easier.
* Since test specifications are pure data they lend themselves well to building a testing UI or any API related documentation.
* Debugging is helped by the verbose logging of HTTP requests and responses that the test runner provides
* It's easy to point the test runner at different environments (i.e. test, development or staging servers)

## Installation

```
npm install jsonapitest -g
```

## Example

Specify your test in a JSON file:

```json
{
  "config": {
    "log_path": "log/jsonapitest-results.json",
    "defaults": {
      "api_call": {
        "request": {
	        "method": "GET",
          "base_url": "https://api.some-hostname.com"
        }
      }
    }
  },
  "data": {
    "schema": {
      "user": {
        "type": "object",
        "properties": {
          "id": {"type": "integer"},
          "name": {"type": "string"},
          "email": {"type": "string", "format": "email"},
          "description": {"type": ["string", "null"]},
          "authentication_token": {"type": "string"}
        },
        "required": ["id", "name", "email"],
        "additionalProperties": false
      }
    },
    "users": {
      "member": {
        "id":1,
        "name":"Joe User",
        "email":"joe@example.com",
        "role":"member",
        "authentication_token":"A9Gx5REcGP9NzXjFKMYM"
      }
  	}
  },
  "suites": [
  	{
  		"name": "users",
    	"tests": [
	      {
	        "name": "get_user_success",
	        "description": "Fetch info about a user",
	        "api_calls": [
	          {
	            "request": {
	              "path": "/v1/users/{{users.member.id}}"
	            },
	            "assert": [{
	              "select": "body",
	              "schema": "{{schema.user}}",
	              "equal_keys": {
	                "id": "{{users.member.id}}",
	                "email": "{{users.member.email}}"
	              }
	            }]
	          }
	        ]
	      },
	      {
	        "name": "get_user_missing",
	        "description": "Trying to fetch info about a user that doesn't exist",
	        "api_calls": [
	          {
	            "request": {
	              "path": "/v1/users/99999999"
	            },
	            "status": 404
	          }
	        ]
	      }
    	]
  	}
  ]
}
```

Run it:

```
jsonapitest path-to-your-test-file.json
```

## Stability

This is a pre-alpha release and a proof of concept. It needs more real world usage to mature.

## TODO

* Documentation
	* Magic variables/operators
		* $merge
		* $run_id
		$ $api_call_id
	* Variable interpolation {{my_var}}
	* Assertion types
		* status assertions
		* schema, equal, not_equal, contains, not_contains, length
	* Logging and debugging
	* Example using Parse REST API

## Discussion

* An extends property for api calls or a name property with the ability to reuse api calls?
* Can we get a stack trace on ECONNREFUSED and other errors?
* Should we really do double pass data interpolation of api calls, i.e. interpolate on the data itself? Maybe if we really need something like this would have something separate from the data (in config?) that is interpolated.
* Check response times?
* Ability to provide a custom request_client or logger that gets required and used (the plugin needs to be installed globally via npm?)
* Useful to log curl statements?
* Timeouts?
* Use yuidoc?

## Resources

* [Understanding JSON Schema Book](http://spacetelescope.github.io/understanding-json-schema/UnderstandingJSONSchema.pdf)
