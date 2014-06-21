var util = require('./util'),
    client = require('./request_clients/superagent'),
    response = require('./response');

var interpolate = function(value, data) {
  if (value == null || typeof value !== 'string') {
    throw new util.Error('interpolate_non_string', 'Can only interpolate strings but got value=' + value);
  }
  if (value.indexOf('{{') == -1) return value;
  var result = value,
      matches = util.uniq(value.match(/{{\s*[\$\w\._-]+\s*}}/g)),
      key = null,
      replaceValue = null;
  matches.forEach(function(match) {
    key = matches[0].slice(2, matches[0].length-2).trim(); // drop the double curlys, allow leading/trailing whitespace
    replaceValue = util.nestedValue.get(data, key);
    if (matches.length === 1 && matches[0].length === value.length) {
      // 1. If we matched the whole string, then replace it completely, possibly with a different type (i.e. object, number etc.)
      result = replaceValue;    
    } else {
      // 2. Otherwise - replace all occurences of regexp with data value toString
      result = util.replaceAll(match, (replaceValue || ''), result);
    }
  });
  return result === '' ? null : result;
};
exports.interpolate = interpolate;

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

var deepInterpolate = function(object, data) {
  var result = util.cloneDeep(object);
  util.each(object, function(value, key) {
    if (typeof value === 'string') {
      result[key] = interpolate(value, data);
    } else if (util.isObject(value)) {
      result[key] = deepInterpolate(value, data);
    }
  });
  return result;
};
exports.deepInterpolate = deepInterpolate;

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

var validateRequest = function(apiCall) {
  if (!apiCall.request) {
    throw new util.Error("api_call_missing_request", "Missing request property in api_call: " + JSON.stringify(apiCall));
  }
  if (!apiCall.request.url) {
    throw new util.Error("api_call_missing_request_url", "Missing request url in api_call: " + JSON.stringify(apiCall)); 
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
      dataInterpolate = function(apiCall) { return deepInterpolate(apiCall, (context.data || {})) },
      mergeDefaults = function(apiCall) { return util.deepMerge(defaults, apiCall) };
  return util.compose(
    validateRequest,
    normalizeRequest,
    dataInterpolate,
    mergeDefaults,
    deepArrayMerge,
    parseRequestString,
    dataInterpolate
  )(apiCall);
};
exports.parse = parse;

exports.run = function(context, suite, test, apiCallRaw, callback) {
  var apiCall = parse(apiCallRaw, context);
  context.logger.api_call.start(suite, test, apiCall);
  client.request(apiCall.request, function(err, res) {
    if (err) {
      var result = {suite: suite.name, test: test.name, api_call: apiCall, errors: [err]};
    } else {
      var errors = response.process(apiCall, res, context.data),
          err = errors.length > 0 ? errors : null,
          result = {suite: suite.name, test: test.name, api_call: apiCall, response: res, errors: errors};
    }
    context.logger.api_call.end(suite, test, apiCall, err, result);
    callback(err, result)
  });
};
