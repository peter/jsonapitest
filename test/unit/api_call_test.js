var assert = require('assert'),
    apiCall = require('../../lib/api_call');

describe('api_call', function() {
  describe('arrayMerge', function() {
    it('works', function() {
      assert.deepEqual(
        apiCall.arrayMerge([{bla: 0, foo: {nested: 1}}, {foo: {nested: 2}, bar: 3}, {foo: {nested: 3}, bar: 4, baz: 5}]),
        {bla: 0, foo: {nested: 3}, bar: 4, baz: 5}
      );
    });
  });

  describe('deepArrayMerge', function() {
    it('works', function() {
      assert.deepEqual(
        apiCall.deepArrayMerge(
          {request: {path: '/v1/users/404', headers: {$merge: [{"Content-Type": "application/json"}, {"Authentication": "opensesame"}]}}, response: {status: [200, 201]}}),
        {request: {path: '/v1/users/404', headers: {"Content-Type": "application/json", "Authentication": "opensesame"}}, response: {status: [200, 201]}}
      );
    });
  });

  describe('normalizeRequest', function() {
    it('combines path and base_url into a url', function() {
      assert.deepEqual(apiCall.normalizeRequest({request: {base_url: 'http://foobar.com', path: '/bla'}}), {request: {method: 'GET', url: 'http://foobar.com/bla'}})
      assert.deepEqual(apiCall.normalizeRequest({request: {base_url: 'http://foobar.com', url: 'http://otherdomain.com/bla'}}), {request: {method: 'GET', url: 'http://otherdomain.com/bla'}})
      assert.deepEqual(apiCall.normalizeRequest({request: {method: 'POST', base_url: 'http://foobar.com', url: 'http://otherdomain.com/bla'}}), {request: {method: 'POST', url: 'http://otherdomain.com/bla'}})
    });
    it('defaults method to GET', function() {
      assert.deepEqual(apiCall.normalizeRequest({request: {url: 'http://foobar.com'}}), {request: {method: 'GET', url: 'http://foobar.com'}})
      assert.deepEqual(apiCall.normalizeRequest({request: {method: 'DELETE', url: 'http://foobar.com'}}), {request: {method: 'DELETE', url: 'http://foobar.com'}})
    });
  });

  describe('parseRequestString', function() {
    it('can parse a request string', function() {
      assert.deepEqual(apiCall.parseRequestString({request: '/foo/bar?bla=1'}), {request: {path: '/foo/bar?bla=1'}});
      assert.deepEqual(apiCall.parseRequestString({request: 'http://foo/bar?bla=1'}), {request: {url: 'http://foo/bar?bla=1'}});
      assert.deepEqual(apiCall.parseRequestString({request: 'DELETE /foo/bar?bla=1'}), {request: {method: 'DELETE', path: '/foo/bar?bla=1'}});
    });

    it('defaults http method to GET', function() {
      assert.deepEqual(apiCall.parseRequestString({request: {path: '/foo/bar?bla=1'}}), {request: {path: '/foo/bar?bla=1'}});
    });
  });

  describe('parse', function() {
    it('uses interpolation and array merge', function() {
      // Empty case - no interpolation, no array merge, no defaults
      assert.deepEqual(
        apiCall.parse({request: {method: 'GET', url: '/bar'}}, {}),
        {request: {method: 'GET', url: '/bar'}}
      );

      // Only array merge
      assert.deepEqual(
        apiCall.parse({request: {$merge: [{url: '/bar', method: 'DELETE'}, {url: '/bla'}]}} , {}),
        {request: {url: '/bla', method: 'DELETE'}}
      );

      assert.deepEqual(
        apiCall.parse(
          {request: {method: 'GET', url: '/v1/users/{{users.member.id}}', headers: {$merge: [{"User-Id": "{{users.member.id}}"}, {"User-Name": "{{users.member.name}}"}]}}, response: {body: {equal: {name: "{{users.member.name}}"}}}},
          {data: {users: {member: {id: 404, name: 'Peter M'}}}}),
        {request: {method: 'GET', url: '/v1/users/404', headers: {"User-Id": 404, "User-Name": "Peter M"}}, response: {body: {equal: {name: "Peter M"}}}}
      );
    });

    it('can interpolate arrays with integers', function() {
      assert.deepEqual(
        apiCall.parse(
          {request: {method: 'GET', url: 'foo'}, response: {status: "{{status.invalid}}"}},
          {data: {status: {invalid: [422, 400]}}}
        ),
        {request: {method: 'GET', url: 'foo'}, response: {status: [422, 400]}}
      );
    });

    it('can parse request strings', function() {
      var config = {defaults: {api_call: {request: {base_url: 'http://example.com'}}}};
      assert.deepEqual(
        apiCall.parse({request: '/foobar'}, {config: config}),
        {request: {method: 'GET', url: 'http://example.com/foobar'}}
      );

      assert.deepEqual(
        apiCall.parse({request: 'POST /foobar'}, {config: config}),
        {request: {method: 'POST', url: 'http://example.com/foobar'}}
      );

      assert.deepEqual(
        apiCall.parse({request: 'http://example.com/foobar'}, {}),
        {request: {method: 'GET', url: 'http://example.com/foobar'}}
      );

      assert.deepEqual(
        apiCall.parse({request: 'POST /foobar/{{user_id}}'}, {data: {user_id: 5}, config: config}),
        {request: {method: 'POST', url: 'http://example.com/foobar/5'}}
      );

      assert.deepEqual(
        apiCall.parse({request: '{{post_request}}'}, {data: {post_request: {method: 'POST', path: '/foobar/5'}}, config: config}),
        {request: {method: 'POST', url: 'http://example.com/foobar/5'}}
      );
    });

    it('works with defaults', function() {
      var apiCallRaw = {
        "request": {
          "method":"PUT",
          "path":"/v1/profile",
          "headers":{$merge: ["{{headers.member_auth}}",{"Content-Type":"multipart/form-data"}]},
          "params":{"name":"Some new cool name","email":"invalid-email"},
          "files":{"portrait_image":"portrait_image.jpg"}
          },
          "response":{"status":"{{status.invalid}}"}
        },
        context = {
          data: {$api_call_id: "ash8h1230fhlkahsdf", headers: {member_auth: {"X-Auth-Token": '{{users.member.authentication_token}}'}}, status: {invalid: [422, 400]}, users: {member: {authentication_token: 'auth-secret'}}},
          config: {
            defaults: {
              "api_call": {
                "request": {
                  "base_url": "http://localhost:3002",
                  "headers": {
                    "X-API-CALL-ID": "{{$api_call_id}}",
                    "X-Token": "api-secret",
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                  }
                },
                "response": {
                  "status": [200, 201]
                }
              }
            }
          }
        },
        parsedApiCall = apiCall.parse(apiCallRaw, context),
        expectedApiCall = {
          "request": {
            "method":"PUT",
            "url": "http://localhost:3002/v1/profile",
            "headers":{"X-API-CALL-ID": "ash8h1230fhlkahsdf", "X-Token": "api-secret", "X-Auth-Token": 'auth-secret', "Content-Type":"multipart/form-data", "Accept": "application/json"},
            "params":{"name":"Some new cool name","email":"invalid-email"},
            "files":{"portrait_image":"portrait_image.jpg"}
          },
          "response":{"status":[422, 400]}
        };
      assert.deepEqual(Object.keys(parsedApiCall.request).sort(), Object.keys(expectedApiCall.request).sort());
      assert.deepEqual(parsedApiCall.request.url, expectedApiCall.request.url);
      assert.deepEqual(parsedApiCall.request.headers, expectedApiCall.request.headers);
      assert.deepEqual(parsedApiCall.request.params, expectedApiCall.request.params);
      assert.deepEqual(parsedApiCall.request.files, expectedApiCall.request.files);
      assert.deepEqual(parsedApiCall.request, expectedApiCall.request);
      assert.deepEqual(parsedApiCall.response, expectedApiCall.response);
      assert.deepEqual(parsedApiCall, expectedApiCall);
    });
  });
});
