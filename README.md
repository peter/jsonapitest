# JSON API Test

JSON driven testing of JSON HTTP APIs (REST APIs). Uses JSON Schema for validation.

## Status

NOTE: Work in Progress. Not yet functional.

## TODO

* Documentation
  * Magic variables/operators
    * $merge
    * $run_id
    $ $api_call_id
  * Variable interpolation {{my_var}}
* Handle case where the server cannot be reached (response is undefined)
* Need verbose mode for debugging - log curl statements of requests?
* Ability to compare objects with util.equalValues?
* Example using Parse REST API
* Execution order of suites
* Execution order of tests within suites
* Timeouts?
* Save data from response.body
* Runner/results with configurable loggers

## Discussion

* An extends property for api calls or a name property with the ability to reuse api calls?
* Can we get a stack trace on ECONNREFUSED and other errors?
* Should we really do double pass data interpolation of api calls, i.e. interpolate on the data itself? Maybe if we really need something like this would have something separate from the data (in config?) that is interpolated.
* Check response times?
* Ability to provide a custom request_client or logger that gets required and used (the plugin needs to be installed globally via npm?)
