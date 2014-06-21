# Parse JsonApiTest CRUD Example

This is an example that illustrates testing a CRUD Parse REST API using `jsonapitest`.

## Configuration

The path to the log file, the base_url, and the API key headers to be included in all requests are configured in
[config.json](config.json).

## Data

The data for the GameScore object being created as well as the JSON schema for GameScore are in [data.json](data.json).

## Test Suite

The test suite has a single test that runs through the CRUD cycle in [crud_test.json](crud_test.json).

## Running the Test Suite

```
./index.js doc/examples/parse/*.json
```

Output:

```
-----------------------------------------------------------------------
Parse CRUD
-----------------------------------------------------------------------

Parse CRUD/create_get_list_update_delete - You can create a Parse object, get and list it, update its name, and then delete it
POST https://api.parse.com/1/classes/GameScore (5618ms) - OK!
GET https://api.parse.com/1/classes/GameScore/U3tRLb5Pai (1012ms) - OK!
GET https://api.parse.com/1/classes/GameScore (963ms) - OK!
PUT https://api.parse.com/1/classes/GameScore/U3tRLb5Pai (1225ms) - OK!
GET https://api.parse.com/1/classes/GameScore/U3tRLb5Pai (961ms) - OK!
DELETE https://api.parse.com/1/classes/GameScore/U3tRLb5Pai (4489ms) - OK!
GET https://api.parse.com/1/classes/GameScore/U3tRLb5Pai (1383ms) - OK!

logging all results to doc/examples/parse/log/results.json

SUCCESS!
```

## Logging

All HTTP requests and responses are logged in [log/results.json](log/results.json).
