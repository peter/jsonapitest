[![Build Status](https://travis-ci.org/peter/jsonapitest.svg?branch=master)](https://travis-ci.org/peter/jsonapitest)
[![Code Climate](https://codeclimate.com/github/peter/jsonapitest.png)](https://codeclimate.com/github/peter/jsonapitest)
[![Badge](https://coveralls.io/repos/peter/jsonapitest/badge.png?branch=master)](https://coveralls.io/r/peter/jsonapitest)

# JSON API Test

JSON driven testing of REST APIs.

This is a test framework targeted at JSON REST APIs. It comes in the form of a Node.js package called `jsonapitest`
that is available on the command line to run your tests. Tests are specified in JSON or JavaScript files and grouped into
test suites. Each test contains a list of API calls with assertions. The framework supports using JSON Schema
to validate the structure of responses. All HTTP traffic is logged extensively
by the test runner to help debug test failures. Any data (database records, user credentials etc.) that the tests
need are specified in JSON format and is easily interpolated into API calls. You can extend and customize
the framework with your own assertion functions, HTTP client, or logger.

## Table of Contents

* [Motivation](#motivation)
* [Installation](#installation)
* [Usage](#usage)
* [Test File Structure](#test-file-structure)
* [JavaScript instead of JSON](#javascript-instead-of-json)
* [The Anatomy of Test Files](#the-anatomy-of-test-files)
* [Config](#config)
* [Data](#data)
* [Suite](#suite)
* [API Call](#api-call)
* [Pending Tests](#pending-tests)
* [HTTP Clients](#http-clients)
* [Request](#request)
* [Response](#response)
* [Select](#select)
* [Assert](#assert)
* [Custom Assert Functions](#custom-assert-functions)
* [Status Assertions](#status-assertions)
* [Assert: schema](#assert-schema)
* [Assert: equal](#assert-equal)
* [Assert: equal_keys](#assert-equal_keys)
* [Assert: contains](#assert-contains)
* [Assert: contains_keys](#assert-contains_keys)
* [Assert: size](#assert-size)
* [Assert: Inline JavaScript](#assert-inline-javascript)
* [Assert: type](#assert-type)
* [Saving Data](#saving-data)
* [Data Interpolation](#data-interpolation)
* [Merging Objects](#merging-objects)
* [Logging](#logging)
* [Callbacks](#callbacks)

## Motivation

I had a REST API implemented in Node.js and I started out writing my API tests with Mocha and Supertest. Although this approach worked
I ended up with test code that was time consuming and complex. Also, I didn't like the fact that my
tests were coupled to the implementation of the API. I tried doing some semi automated testing with curl and although I appreciate the simplicity
of curl the approach wasn't sufficiently structured and automated. What I was looking for was a declarative and black-box
way to do API testing. Here are a few selling points for `jsonapitest`:

* Black box testing of APIs means the tests are not tied to the implementation behind the API (i.e. programming language, database etc.)
* Black box testing will encourage you to design more complete and user friendly APIs (since you cannot easily get at the implementation behind the API)
* By having test definitions be simple and pure data structures you are not tied to any particular test framework implementation. This means the test runner, the http client and the assertion engine could all be re-implemented and swapped out fairly easily.
* The fact that you are constrainted to a simple JSON structure for tests will help keep your tests dumb and devoid of complicated logic. This makes test maintenance easier.
* Since test specifications are pure data they lend themselves well to building for example a testing UI or API documentation.
* Debugging is helped by the verbose logging of all HTTP requests and responses (this log is also in JSON format)
* It's easy to point the test runner at different environments (i.e. a test, development or staging server)

## Installation

```
npm install jsonapitest -g
```

## Usage

Specify your test in a JSON file:

```json
{
  "config": {
    "defaults": {
      "api_call": {
        "request": {
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
          "email": {"type": "string", "format": "email"}
        }
      }
    },
    "users": {
      "member": {
        "id":1,
        "email":"joe@example.com"
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
	            "request": "/v1/users/{{users.member.id}}",
              "status": 200,
	            "assert": {
	              "select": "body",
	              "schema": "{{schema.user}}",
	              "equal_keys": {
	                "id": "{{users.member.id}}",
	                "email": "{{users.member.email}}"
	              }
	            }
	          }
	        ]
	      },
	      {
	        "name": "get_user_missing",
	        "description": "Trying to fetch info about a user that doesn't exist",
	        "api_calls": [
	          {
	            "request": "/v1/users/99999999",
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

Check out the [Parse CRUD example](doc/examples/parse/README.md) for more sample code.

## Test File Structure

Tests are written in one or more JSON or JavaScript files and you may choose any file structure you like.
With a small test case you may want to put all test code in a single file. A more typical
structure is to divide your test code into three sets of files: configuration, data, and test suites.
Here is an example:

```
test/api/config.json
test/api/data.json
test/api/users_test.json
test/api/articles_test.json
```

Here config.json will contain the configuration, data.json the data, users_test.json the
test suite for users, and articles_test.json the test suite for articles. To run the tests:

```
jsonapitest test/api/config.json test/api/data.json test/api/users_test.json test/api/articles_test.json
```

Or more conveniently:

```
jsonapitest test/api/*.json
```

The order in which test files are given to the test runner determines the execution order of tests. Since test suites
are supposed to be independent of eachother this typically won't affect the outcome. The order comes into play
if you have files with overlapping config or data properties. In this case later files will take precedence over earlier ones through a deep merge of the config and data properties. An example of how this may be used is when you would like to override the
default configuration or data. Suppose you usually run your tests against a local
test or development server but at times would like to run them against a remote staging server. You could then have
a configuration file at test/api/env/staging.json:

```json
{
  "config": {
    "defaults": {
      "api_call": {
        "request": {
          "base_url": "https://my.staging.api.example"
        }
      }
    }
  }
}
```

And run your tests against staging like so:

```
jsonapitest test/api/*.json test/api/env/staging.json
```

## JavaScript instead of JSON

As a more flexible and powerful alternative to JSON you have the option of specifying your
test files in JavaScript intead of JSON. JavaScript files should be Node.js modules
and `jsonapitest` will simply invoke `require` on them. Here is an example `config.js` file:

```javascript
'use strict';

module.exports = {
  config: {
    defaults: {
      api_call: {
        request: {
          base_url: "https://my.staging.api.example"
        }
      }
    }
  }
};
```

In addition to custom assert functions you can also write [inline javascript assertions](#assert-inline-javascript).
With JavaScript you also have the ability to use [regular expression equality matchers](#assert-equal).

## The Anatomy of Test Files

The JSON in test files may contain one or more of the following top level properties:

* [config](#configuration)
* [data](#data)
* [suite/suites](#suite)

## Config

The config property is an optional property where you can point out the path to a log file where HTTP requests are logged,
the base_url of your server, and any default headers and response status of your API calls:

```json
"config": {
  "log_path": "log/jsonapitest-results.json",
  "defaults": {
    "api_call": {
      "request": {
        "base_url": "http://localhost:3001",
        "headers": {
          "X-API-CALL-ID": "{{$api_call_id}}",
          "X-Token": "secret-api-token-goes-here",
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      },
      "status": 200
    }
  }
}
```

For the `X-API-CALL-ID` header above we are interpolating a built in variable called `$api_call_id` that will be set to a unique hex
digest for each API call (see more under [Data Interpolation](#data-interpolation)). This is a technique you can use to make it easier
to find test request in your server logs.

## Data

The data property is a free form custom container for any kind of data that you need for your tests, i.e. database data, user
credentials etc. Data is interpolated in api calls with the double curly syntax (i.e. {{my_data}}, see [Data Interpolation](#data-interpolation)).

You will most likely need to populate your database with test data before running your tests. If so any script that you write for this
should probably use the JSON data defined by the `data` property (i.e. database records or documents). In general its a good idea
to write your API tests so that they make as few assumptions about the state of the system as possible. However,
in some test scenarios you really need to know exactly what the state of the system is in order to be able to make assertions and achieve high test coverage.
One approach that works in some projects is to run tests against a copy of the production data with a small amount of known test data added to it. Data population is currently outside the scope of this framework.


### Generating Unique/Random Test Data

There are two pre-defined variables that you can [interpolate](#data-interpolation) into your API calls to generate unique data:

* `$run_id` - a 32 character long hex digest unique to the test run
* `$api_call_id` - a 32 character long hex digest that is unique to each API call

Here is an example request that creates a new user with a unique email address:

```json
{
  "request": {
    "method": "POST",
    "path": "/v1/users",
    "params": {
      "name": "Mr New User",
      "email": "new-user-{{$run_id}}@example.com"
    }
  }
}
```

### Environment Variables

You can interpolate environment variables into your `config` and `data` by using `$env.SOME_ENVIRONMENT_VARIABLE`.

## Suite

Use the suite property to define a single test suite:

```json
{
  "suite": {
    "name": "users",
    "description": "CRUD operations on the user resource",
    "tests": [
      {
        "name": "get_user_success",
        "description": "Fetch info about a user",
        "api_calls": [
          {
            "request": "GET /v1/users/{{users.member.id}}",
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
      }
    ]
  }
}
```

A test suite is made up of a name, an optional description, and an array of tests. Each test in turn has a name and an optional
description and an array of api calls. To define many test suites in a single file, use the suites (plural) property and have it
point to an array of suite objects.

A test suite is identified by its name so it needs to be unique. If your test suite grows large then a good
technique is to split your suite up into multiple files. When `jsonapitest` sees a test suite in a file with a name it has already seen it will merge the two suites (i.e. treat them as one).

## API Call

The API call lies at the heart of API testing and it is made up of an HTTP request and one or more assertions against the response. An API call can also save data from the HTTP response for use in later API calls.

To make the intention of API calls more obvious and help readability of tests you can use the optional properties `it` (or the property `description`) like this:

```json
{
  "it": "can GET a user of type member",
  "request": "/v1/users/{{users.member.id}}",
  "status": 200
}
```

## Pending Tests

Sometimes you want to write down the skeletons of your tests but you are not ready to execute them yet.
For this reason both the test and API call objects accept a `pending` boolean property.
If this property is set to true then the test or API call won't execute.
Any API calls that don't have a request property will be treated as pending and not execute. Here is an example:

```javascript
{
  suite: "articles",
  tests: [
    {
      name: "CRUD",
      api_calls: [
        {
          it: "can create an article"
        },
        {
          it: "can verify that the article exists"
        },
        {
          it: "can update the article"
        },
        {
          it: "can verify that the article is updated"
        },
        {
          it: "can delete the article"
        },
        {
          it: "can verify that the article is deleted"
        }
      ]
    }
  ]
}
```

## HTTP Clients

The framework ships with adapters for two popular HTTP clients - [superagent](https://github.com/visionmedia/superagent) (default) and [request](https://github.com/mikeal/request). Here is how to configure the `request` HTTP client:

```json
"config": {
  "modules": {
    "http_client": "./http_clients/request"
  }
}
```

In order to support a different HTTP client, all you have to do is write a simple adapter for it, see the
[superagent](https://github.com/peter/jsonapitest/blob/master/lib/http_clients/superagent.js) and
[request](https://github.com/peter/jsonapitest/blob/master/lib/http_clients/request.js) adapters
for examples of how to do this. You can either install your adapter globally as an npm package or set `config.modules.http_client`
to the absolute file path of your adapter.

## Request

The `request` property of each API call is an object with the following properties:

* `method` - the HTTP verb (i.e. GET, PUT, POST, DELETE etc.). Defaults to "GET".
* `path` - the path to make the request to. If a `base_url` has been configured then the `url` property will be set to the base_url joined with the path
* `url` - specify the full URL here instead of the path if you need a URL different from the base_url
* `headers` - custom HTTP headers
* `params` - query or post parameters
* `files` - an array with paths to files that will be uploaded with content type "multipart/form-data".

The `request` property may also be given as a string with a method and a path (or url). The `headers` and
`params` properties may be put at the top level of the API call for convenience:

```json
{
  "request": "POST /v1/users",
  "headers": {"X-Token": "secret-api-token-goes-here"},
  "params": {"name": "Joe"}
}
```

Notice that you can also append query parameters to the path instead of using the `params` property:

```json
{
  "request": "GET /v1/users?limit=10&offset=10"
}
```

## Response

The following properties are available in the HTTP response object:

* `status` - the response status code (an integer)
* `headers` - a hash with HTTP headers
* `body` - the parsed JSON body
* `response_time` - elapsed number of milliseconds from request to response (integer)

## Select

Selections on the response data are used to make assertions and to [save data](#saving-data). Selections can be made
on any property of [the response](#response). A selection is made up of a nested `key` and the following optional
properties:

* `pattern` - a regular expression
* `limit` - limit a selected array to a number of items
* `sort` - sort a selected array either ascending (`asc`) or descending (`desc`)

Selectors with just a key can be provided as just a string:

```json
"api_calls": [
  {
    "request": "/v1/users/1",
    "assert": {
      "select": "body.user.name",
      "equal": "Joe User"
    }
  }
]
```

The above expands to:

```json
"api_calls": [
  {
    "request": "/v1/users/1",
    "assert": {
      "select": {"key": "body.user.name"},
      "equal": "Joe User"
    }
  }
]
```

Here is the example with a regexp `pattern` added to it:

```json
"api_calls": [
  {
    "request": "/v1/users/1",
    "assert": {
      "select": {"key": "body.user.name", "pattern": "\\w+$"},
      "equal": "User"
    }
  }
]
```

If the regexp contains a capturing group then that group will be the selected value:

```json
"api_calls": [
  {
    "request": "/v1/users/1",
    "assert": {
      "select": {"key": "body.user.name", "pattern": "^\\w+ (\\w+)$"},
      "equal": "User"
    }
  }
]
```

A nested key also works on arrays:

```json
"api_calls": [
  {
    "request": "/v1/users",
    "assert": {
      "select": "body.users.name",
      "equal": ["First User", "Second User"]
    }
  }
]
```

You can use an array index to select a single item from an array:

```json
"api_calls": [
  {
    "request": "/v1/users",
    "assert": {
      "select": "body.users.name.1",
      "equal": "Second User"
    }
  }
]
```

You can apply sorting to an array:

```json
"api_calls": [
  {
    "request": "/v1/users",
    "assert": {
      "select": {"key": "body.users.name", "sort": "desc"},
      "equal": ["Second User", "First User"]
    }
  }
]
```

You can sort an array of objects by a property:

```json
"api_calls": [
  {
    "request": "/v1/users",
    "assert": {
      "select": {"key": "body.users", "sort": {"order": "desc", "by": "name"}},
      "equal": [{"name": "Second User"}, {"name": "First User"}]
    }
  }
]
```

The sort object also supports a `type` property that you can set to "time" to sort by a datetime property.

## Assert

An `assert` object is made up of a selection on the the response object and one ore more assertions against that selection.
If no selection is specified then the assertion will be made against the response body. The following assert functions are built in:

* [schema](#assert-schema)
* [equal](#assert-equal)
* [equal_keys](#assert-equal_keys)
* [contains](#assert-contains)
* [contains_keys](#assert-contains_keys)
* [size](#assert-size)

Each assertion type has a logically inverted counterpart with a `not_` prefix, i.e. `not_equal`, `not_contains` etc.

## Custom Assert Functions

You can provide your own assert functions to fit the needs of your application. Take a look at the built in
[assert functions](https://github.com/peter/jsonapitest/blob/master/lib/assert_functions.js) to see what the code
should look like. Each assert function takes two arguments - the selected response value and the value
given to the assert function property. The assert function should return `true`, `false`, or an object with an
`error_messages` property. Custom assert functions will take precedence over built in ones so that you can override them.
Put your assert functions in a globally installed npm package or provide an absolute file path in the config:

```json
"config": {
  "modules": {
    "assert_functions": "/absolute/path/to/your/assert/functions/file"
  }
}
```

## Status Assertions

Since making assertions about the response status code is so common some syntactic sugar is provided:

```json
"api_calls": [
  {
    "request": "/v1/users",
    "status": 200
  }
]
```

The above expands to:

```json
"api_calls": [
  {
    "request": "/v1/users",
    "assert": {
      "select": "status",
      "equal": 200
    }
  }
]
```

## Assert: schema

Use the `schema` property of an assert object to validate the response against a JSON schema:

```json
"api_calls": [
  {
    "request": "/v1/users/1",
    "assert": {
      "schema": {
        "type": "object",
        "properties": {
          "id": {"type": "integer"},
          "name": {"type": "string"},
          "email": {"type": "string"}
        },
        "required": ["id", "name", "email"],
        "additionalProperties": false
      }
    }
  }
]
```

## Assert: equal

The `equal` assertion does deep value equality check on arrays and objects. The values `null` and `undefined` are treated as equal. For other primitive values, i.e. numbers, strings and booleans, the types are not required to match and two values are regarded as equal if their string representation is equal. If you write your test files in JavaScript and provide a RegExp object then the JSON
representation of the select will be matched against the regular expression:

```javascript
{
  it: "Can get jsonapitest README",
  request: "GET /peter/jsonapitest",
  assert: {
    equal: /this regexp should match itself/
  }
}
```

## Assert: equal_keys

If you would like to make assertions against only a subset of keys in the response object you can use `equal_keys` instead of `equal`. Suppose your user
record has a large number of columns but you would only like to make assertions about the id and the email:

```json
{
  "request": "/v1/users/{{users.member.id}}",
  "assert": {
    "equal_keys": {
      "id": "{{users.member.id}}",
      "email": "{{users.member.email}}"
    }
  }
}
```

## Assert: contains

The `contains` assertion checks if a value is included in an array or a string.

## Assert: contains_keys

The `contains_keys` assertion checks if an array includes an object that matches the specified key-value pairs. It is thus the logical combination of `contains` and `equal_keys`.

```json
{
  "request": "/v1/users",
  "assert": {
    "select": "body.users",
    "contains_keys": {
      "name": "Peter"
    }
  }
}
```

## Assert: size

The `size` assertion checks the length of an array or a string:

```json
{
  "request": "/v1/users?limit=2",
  "assert": {
    "select": "body.users",
    "size": 2
  }
}
```

## Assert: Inline JavaScript

If you write your test suites in JavaScript you can use inline JavaScript assertions:

```javascript
{
  it: "should be possible to log in with correct credentials",
  request: "POST /v1/login",
  params: {
    user: {
      email: "{{user.editor.email}}",
      password: "{{user.editor.password}}"
    }
  },
  assert: function(body, headers) {
    assert.equal(body.user.email, this.user.editor.email);
  }
}
```

The inline assertion is invoked with two arguments: `body` and `headers`. The `this` object of the function will be set
to the `data` of the test. If the inline assertion does not throw an error (i.e. an assertion error) then it is considered a success.
See the [parse CRUD example](doc/examples/parse/crud_test.js) for more example code.

## Assert: type

As complement/alternative to schema assertions you can use type assertions from the [assert-duck-type](https://github.com/peter/assert-duck-type) library like this:

```javascript
{
  it: "can fetch recipe ingredients",
  request: "GET /v1/recipes/123",
  assert: [
    {
      select: "body.recipe.ingredients",
      size: 4,
      type: [{_id: 'number?', name: 'string', ingredient: 'boolean'}]
    },
    {
      select: "body.recipe.ingredients.0._id",
      not_equal: 999999,
      type: "Number"
    }
  ]
}
```

Adding a question mark to a type means missing value (null/undefined) will also match.

Here are a few other type examples:

* `string`
* `boolean`
* `number`
* `null`
* `{"foo": "string"}`

## Saving Data

Sometimes its useful to save data from a response for user in later API calls. In this case you can use the `save` property which takes
an object where the keys indicate where you would like to save the data and the values are [selectors](#selecting-response-data)
(works the same as in assertions).

```json
{
  "request": {
    "method": "PUT",
    "path": "/v1/profile",
    "params": {
      "name": "Some new cool name {{$api_call_id}}"
    }
  },
  "save": {
    "saved.update_user.name": "body.name"
  }
}
```

## Data Interpolation

Data interpolation is done by embedding nested data keys in double curly braces in strings. The interpolation happens right before an API call is executed. Example:

```json
{
  "request": "/v1/news?organization_id={{organizations.test.id}}"
}
```

If the embedded variable encompasses the entire string then the string will be replaced by a value with same type as the data (any of the JSON datatypes, i.e. object, array, number, string, boolean, or null). Here is an example where a string with an interpolation is replaced with an object:

```json
{
  "request": "/v1/news?organization_id={{organizations.test.id}}",
  "assert": {
    "equal": "{{organizations.test}}"
  }
}
```

## Merging Objects

You can use the `$merge` special object property to merge (extend) data objects. Here is an example where an authentication header is extended with a content type:

```json
"request": {
  "method": "PUT",
  "path": "/v1/profile",
  "headers": {"$merge": ["{{headers.member_auth}}", {"Content-Type": "multipart/form-data"}]},
  "params": {
    "name": "Some new cool name"
  },
  "files": {
    "portrait_image": "./test/api/files/portrait_image.jpg"
  }
}
```

## Logging

The default logger prints basic request info and test results to standard output. Details about all API calls are
logged in JSON format to a file configured by the `config.log_path` property.

If you don't like the default logger you can plug in your own. Take a look at the [callbacks/console.js](https://github.com/peter/jsonapitest/blob/master/lib/callbacks/console.js) to see what the interface looks like:

```json
"config": {
  "modules": {
    "callbacks": "my_logger_module"
  }
}
```

There is an experimental logger that prints curl command line equivalents of all requests. You can enable it along side
the default logger like so:

```json
"config": {
  "modules": {
    "callbacks": ["./loggers/console", "./loggers/curl"]
  }
}
```

## Callbacks

Logging is implemented via a generic callback mechanism that allows you to instrument `jsonapitest`
with the following events:

```javascript
module.exports = {
  suite: {
    start: function(suite) {},
    end: function(suite) {}
  },
  test: {
    start: function(suite, test) {},
    end: function(suite, test) {}
  },
  api_call: {
    start: function(suite, test, apiCall) {},
    end: function(suite, test, apiCall, err, result) {}
  },
  all: {
    start: function() {},
    end: function(success, results) {}
  }
};
```

The signatures of callback functions should match those above. All callback functions are invoked with `this`
set to the context of the test run. This means you can access/modify
test data via `this.data` in a callback function (i.e. for setup/teardown).

Callback functions are synchronous by default. To get asynchronous invocation - add a callback argument
to the function signature.

Configure your custom callbacks module by putting its path in `config.modules.callbacks`. Either make sure your
modules are installed globally with npm and provide a relative path or use an absolute path via an environment variable
like this:

```json
"config": {
  "modules": {
    "callbacks": ["$env.MODULES_PATH/my_first_callback", "$env.MODULES_PATH/my_second_callback"]
  }
}
```

Make sure your module exports an object with some or all of the functions listed above (check out [callbacks/console.js](https://github.com/peter/jsonapitest/blob/master/lib/callbacks/console.js) for an example).

Note that if you add custom callbacks then you need to explicitly add the default console logger or it will disappear:

```javascript
config: {
  modules: {
    callbacks: ["./callbacks/console", (__dirname + '/my_callback')]
  }
}
```
