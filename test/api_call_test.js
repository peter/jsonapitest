var assert = require('assert'),
    apiCall = require('../lib/api_call');

var errorValidator = function(code) {
  return function(err) {
    return err.code === code && err.message.length > 0 && err.toString() === err.message;
  };
};

describe('api_call', function() {
  describe('interpolate', function() {
    it('throws exception on non-strings', function() {
      assert.throws(
        function() {
          apiCall.interpolate({foo: 1}, {foo: 'bar'});          
        },
        errorValidator('interpolate_non_string')
      );
    });

    it('can interpolate string that consist only of a single variable interpolation so that it is replaced by a different type (number, object etc.)', function() {
      var data = {a: {b: {c: 1}}};
      assert.deepEqual(apiCall.interpolate("{{foo}}", data), null);
      assert.deepEqual(apiCall.interpolate("{{a}}", data), {b: {c: 1}});
      assert.deepEqual(apiCall.interpolate("{{a }}", data), {b: {c: 1}});
      assert.deepEqual(apiCall.interpolate("{{ a }}", data), {b: {c: 1}});
      assert.deepEqual(apiCall.interpolate("{{a.b}}", data), {c: 1});
      assert.deepEqual(apiCall.interpolate("{{a.b.c}}", data), 1);
      assert.equal(apiCall.interpolate("{{a. b.c}}", data), "{{a. b.c}}", "invalid key should be left alone");
      assert.deepEqual(apiCall.interpolate("{{a.b.c.d}}", data), null);
    });

    it('can interpolate string with many embedded variables', function() {
      var data = {a: {b: {c: 1}}};
      assert.deepEqual(apiCall.interpolate("{{foo}}{{foo}}", data), null);
      assert.deepEqual(apiCall.interpolate("a {{a.b.c}} b {{a.b.c}} c", data), "a 1 b 1 c");
      assert.deepEqual(apiCall.interpolate("{{a.b.c}} b {{a.b.c}}", data), "1 b 1");
      assert.deepEqual(apiCall.interpolate("{{a. b.c}} b {{a.b.c}}", data), "{{a. b.c}} b 1");
    });
  });

  describe('deepInterpolate', function() {
    it('works', function() {
      assert.deepEqual(
        apiCall.deepInterpolate(
          {request: {path: '/v1/users/{{users.member.id}}'}, response: {body: {equal: {name: "{{users.member.name}}"}}}},
          {users: {member: {id: 404, name: 'Peter M'}}}),
        {request: {path: '/v1/users/404'}, response: {body: {equal: {name: "Peter M"}}}}
      );
    });
  });

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
          {request: {path: '/v1/users/404', headers: [{"Content-Type": "application/json"}, {"Authentication": "opensesame"}]}, response: {status: [200, 201]}}),
        {request: {path: '/v1/users/404', headers: {"Content-Type": "application/json", "Authentication": "opensesame"}}, response: {status: [200, 201]}}
      );
    });
  });

  describe('parse', function() {
    it('uses interpolation and array merge', function() {
      assert.deepEqual(
        apiCall.parse(
          {request: {path: '/v1/users/{{users.member.id}}', headers: [{"User-Id": "{{users.member.id}}"}, {"User-Name": "{{users.member.name}}"}]}, response: {body: {equal: {name: "{{users.member.name}}"}}}},
          {data: {users: {member: {id: 404, name: 'Peter M'}}}}),
        {request: {path: '/v1/users/404', headers: {"User-Id": 404, "User-Name": "Peter M"}}, response: {body: {equal: {name: "Peter M"}}}}
      );      
    });

    it('can interpolate arrays with integers', function() {
      assert.deepEqual(
        apiCall.parse(
          {response: {status: "{{status.invalid}}"}},
          {data: {status: {invalid: [422, 400]}}}
        ),
        {response: {status: [422, 400]}}
      );
    });

    it('works with defaults', function() {
      var apiCallRaw = {
        "request": {
          "method":"PUT",
          "path":"/v1/profile",
          "headers":["{{headers.member_auth}}",{"Content-Type":"multipart/form-data"}],
          "params":{"name":"Some new cool name","email":"invalid-email"},
          "files":{"portrait_image":"portrait_image.jpg"}
          },
          "response":{"status":"{{status.invalid}}"}
        }, 
        context = {
          data: {headers: {member_auth: {"X-Auth-Token": '{{users.member.authentication_token}}'}}, status: {invalid: [422, 400]}, users: {member: {authentication_token: 'auth-secret'}}},
          config: {
            defaults: {
              "api_call": {
                "request": {
                  "base_url": "http://localhost:3002",
                  "headers": {
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
            "base_url": "http://localhost:3002",
            "path":"/v1/profile",
            "headers":{"X-Token": "api-secret", "X-Auth-Token": 'auth-secret', "Content-Type":"multipart/form-data", "Accept": "application/json"},
            "params":{"name":"Some new cool name","email":"invalid-email"},
            "files":{"portrait_image":"portrait_image.jpg"}
          },
          "response":{"status":[422, 400]}
        };
      assert.deepEqual(parsedApiCall, expectedApiCall);
    });
  });
});
