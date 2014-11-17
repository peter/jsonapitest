# Parse JsonApiTest CRUD Example

This is an example that illustrates testing a CRUD Parse REST API using `jsonapitest`.

## Configuration

The path to the log file, the base_url, and the API key headers to be included in all requests are configured in
[config.json](config.json).

## Data

The data for the GameScore object being created as well as the JSON schema for GameScore are in [data.json](data.json).

## Test Suite

The test suite has a single test that runs through the CRUD cycle in [crud_test.json](crud_test.json).

There is an alternative [JavaScript version](crud_test.js) that demonstrates using inline JavaScript for assertions.

## Running the Test Suite

```
./index.js doc/examples/parse/*.json
```

Output:

```
-----------------------------------------------------------------------
SUITE: Parse CRUD
-----------------------------------------------------------------------

-----------------------------------------------------------------------
TEST: Parse CRUD/create_get_list_update_delete - You can create a Parse object, get and list it, update its name, and then delete it
-----------------------------------------------------------------------

it can create a GameScore object
  POST https://api.parse.com/1/classes/GameScore - 201 (2775ms) - OK!
it can get a GameScore object
  GET https://api.parse.com/1/classes/GameScore/dOYTXJWhRH - 200 (4700ms) - OK!
it can list GameScore objects
  GET https://api.parse.com/1/classes/GameScore - 200 (644ms) - OK!
it can update name of GameScore object
  PUT https://api.parse.com/1/classes/GameScore/dOYTXJWhRH - 200 (581ms) - OK!
it can get new name of GameScore object
  GET https://api.parse.com/1/classes/GameScore/dOYTXJWhRH - 200 (614ms) - OK!
it can delete GameScore object
  DELETE https://api.parse.com/1/classes/GameScore/dOYTXJWhRH - 200 (580ms) - OK!
it gets a 404 for deleted GameScore object
  GET https://api.parse.com/1/classes/GameScore/dOYTXJWhRH - 404 (604ms) - OK!

logging all results to doc/examples/parse/log/results.json

0/1 tests failed in 0/1 suites - 7 API calls with 1500ms average response time

SUCCESS!
```

## Logging

All HTTP requests and responses are logged in [log/results.json](log/results.json).
