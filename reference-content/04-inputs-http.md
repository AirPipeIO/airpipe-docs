Supply an HTTP URL for an action to use as an input, or to call an upstream API.

```yml
interfaces:
  http/basic:
    output: http
    method: GET
    actions:
      - name: BasicHTTP
        http:
          url: https://jsonplaceholder.typicode.com/todos/1
```

HTTP actions also support auth (bearer / basic / digest), TLS options, multipart
uploads, automatic pagination, and reverse-proxy passthrough. Every field is
documented below.
