"use strict";
var util = require('./util'),
    response = require('./response'),
    interpolate = require('./interpolate');

var isPending = function(test, apiCall) {
  if (test.pending || apiCall.pending || apiCall.request == null) {
    return true;
  } else {
    return false;
  }
};

var arrayMerge = function(array) {
  if (!util.isArray(array)) {
    throw new util.Error("array_merge_invalid_array", "Expected array argument but got " + array);
  }
  var result = {};
  array.forEach(function(hash) {
    if (!util.isObject(hash)) {
      throw new util.Error("array_merge_invalid_array", "Expected array to only contain objects but got " + hash);
    }
    result = util.deepMerge(result, hash);
  });
  return result;
};
exports.arrayMerge = arrayMerge;

var deepArrayMerge = function(object) {
  var result = util.cloneDeep(object);
  util.each(object, function(value, key) {
    if (util.isObject(value) && value.$merge) {
      result[key] = arrayMerge(value.$merge);
    } else if (util.isObject(value)) {
      result[key] = deepArrayMerge(value);
    }
  });
  return result;
};
exports.deepArrayMerge = deepArrayMerge;

var normalizeStructure = function(apiCall) {
  if (apiCall.params && apiCall.request) {
    apiCall.request.params = apiCall.params;
    delete apiCall.params;
  }

  if (apiCall.headers && apiCall.request) {
    apiCall.request.headers = apiCall.headers;
    delete apiCall.headers;
  }
  return apiCall;
};
exports.normalizeStructure = normalizeStructure;

var validateRequest = function(apiCall) {
  if (apiCall.pending) return apiCall;
  if (!apiCall.request) {
    util.raise("api_call_missing_request", "Missing request property in api_call: " + JSON.stringify(apiCall));
  }
  if (!apiCall.request.url) {
    util.raise("api_call_missing_request_url", "Missing request url in api_call: " + JSON.stringify(apiCall));
  }
  return apiCall;
};
exports.validateRequest = validateRequest;

var normalizeRequest = function(apiCall) {
  var request = apiCall.request;
  if (request) {
    if (request.url == null && request.path && request.base_url) {
      request.url = request.base_url + request.path;
    }
    if (request.url) {
      delete request.base_url;
      delete request.path;
    }
    request.method = request.method || 'GET';
  }
  return apiCall;
};
exports.normalizeRequest = normalizeRequest;

var VALID_METHODS = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD'];

var parseRequestString = function(apiCall) {
  if (typeof apiCall.request === 'string') {
    var parts = apiCall.request.split(' '),
        firstPart = parts[0],
        lastPart = parts[parts.length-1];
    if (parts.length === 1 || parts.length === 2) {
      if (util.isUrl(lastPart)) {
        apiCall.request = {url: lastPart};
      } else {
        apiCall.request = {path: lastPart};
      }
      if (parts.length === 2) {
        if (!util.contains(VALID_METHODS, firstPart)) {
          throw new util.Error("api_call_invalid_method", "Unrecognized HTTP method in api_call: " + JSON.stringify(apiCall));
        }
        apiCall.request['method'] = firstPart;
      }
    } else {
      throw new util.Error("api_call_invalid_request", "Could not parse request string in api_call: " + JSON.stringify(apiCall));
    }
  }
  return apiCall;
};
exports.parseRequestString = parseRequestString;

// Return a fully expanded data representation of the API call (request/response) by:
// 1. Using any defaults from context.config.defaults.api_call
// 2. Data variable interpolations ({{users.joe.email}}) using context.data
// 3. Merges of arrays with hashes, i.e. [{"Content-Type": "application/json"}, {"Authorization": "foobar"}] becomes {"Content-Type": "application/json", "Authorization": "foobar"}
// 4. Replaces base_url, path with url
var parse = function(apiCall, context) {
  // FIXME: should we really do a double pass variable interpolation?
  var defaults = util.nestedValue.get(context, 'config.defaults.api_call') || {},
      dataInterpolate = function(apiCall) { return interpolate.deep(apiCall, (context.data || {})) },
      mergeDefaults = function(apiCall) { return util.deepMerge(defaults, apiCall) };
  return util.compose(
    validateRequest,
    normalizeRequest,
    dataInterpolate,
    mergeDefaults,
    deepArrayMerge,
    normalizeStructure,
    parseRequestString,
    dataInterpolate
  )(apiCall);
};
exports.parse = parse;

exports.run = function(context, suite, test, apiCallRaw, callback) {
  if (isPending(test, apiCallRaw)) apiCallRaw.pending = true;
  var apiCall = parse(apiCallRaw, context),
      client = util.loadModule(context, 'http_client'),
      result = {suite: suite.name, test: test.name, api_call: apiCall, errors: []};
  context.callbacks.run('api_call.start', [suite, test, apiCall], function() {
    if (apiCall.pending) {
      result.pending = true;
      return callback(null, result);
    }
    client.request(apiCall.request, function(err, res) {
      if (err) {
        result.errors = [err];
      } else {
        var errors = response.process(apiCall, res, context),
            err = errors.length > 0 ? errors : null;
        result.response = res;
        result.errors = errors;
      }
      if (test.description) result.test_description = test.description;
      context.callbacks.run('api_call.end', [suite, test, apiCall, err, result], function() {
        callback(err, result)
      });
    });
  });
};
