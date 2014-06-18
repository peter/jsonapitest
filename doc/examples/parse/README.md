# Parse JsonApiTest CRUD Example

This is an example that illustrates testing a CRUD Parse REST API.

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
POST https://api.parse.com/1/classes/GameScore (807ms) - OK!
GET https://api.parse.com/1/classes/GameScore/g4HJyCKD8F (620ms) - OK!
GET https://api.parse.com/1/classes/GameScore (711ms) - OK!
PUT https://api.parse.com/1/classes/GameScore/g4HJyCKD8F (623ms) - OK!
GET https://api.parse.com/1/classes/GameScore/g4HJyCKD8F (608ms) - OK!
DELETE https://api.parse.com/1/classes/GameScore/g4HJyCKD8F (657ms) - OK!
GET https://api.parse.com/1/classes/GameScore/g4HJyCKD8F (582ms) - OK!

logging all results to doc/examples/parse/log/results.json

SUCCESS!
```

All the HTTP requests are logged in [log/results.json](log/results.json).
