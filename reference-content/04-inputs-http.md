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

## Success and failure: `expect_status`

A response outside `expect_status` **fails the action**. The default is `2xx` (plus `304`),
so a 4xx or 5xx upstream fails the step that called it — which is what makes `retry`,
`run_when_failed` and `http_code_inherit_error` work without writing an assertion to
translate a status into an outcome.

```yml
actions:
  - name: Push
    retry: {attempts: 3, exponential_backoff: true}
    http:
      url: https://api.example.com/orders
      method: POST
```

A failed action **keeps its payload** — status, headers and body — so an error branch can
still read them:

```yml
  - name: Recover
    run_when_failed: [Push]
    input: a|Push|          # .status, .headers, .body are all here
```

When a non-2xx status is genuinely *data* rather than a failure, say so:

```yml
http:
  url: https://api.example.com/users/42
  expect_status: [2xx, 404]     # 404 means "no such user", not an error
```

| Value | Meaning |
|---|---|
| unset | `2xx` or `304` is success (the default) |
| `2xx` / `4xx` / `5xx` | a whole class |
| `404` | one exact code |
| `[2xx, 404]` | any of a list |
| `any` | never fail on status — the status is only data |

`304 Not Modified` counts as success by default because RFC 9110 §15.4.5 defines it as the
successful outcome of a conditional request whose validator matched — a poller using
`If-None-Match` gets one on its happy path.

### The outcome is declared, not inferred

`expect_status` decides whether the action failed. An `assert` validates the data and never
decides the outcome, so this does **not** do what it looks like:

```yml
# WRONG — the action fails on the 403 before the assert runs
http: {url: https://api.example.com/thing}
assert:
  tests:
    - value: status
      is_equal_to: 403
```

```yml
# RIGHT — say what you expect
http: {url: https://api.example.com/thing, expect_status: 403}
```

One rule, in one place: read an action and you can see what counts as failure without
tracing which assertions happen to mention `status`. The engine says so when you get it
wrong — the failure message names the `expect_status` line to add.

### One declaration for a whole interface

An interface whose actions share an expectation — a test runner hitting routes that answer
403 and 500 on purpose, a health-check fan-out that records whatever comes back — declares
it once. An action that sets its own always wins.

```yml
interfaces:
  tests/all:
    defaults:
      expect_status: any
    actions:
      - name: ChecksA
        http: {url: http://localhost:44111/route-a}   # inherits `any`
      - name: ChecksB
        http: {url: http://localhost:44111/route-b, expect_status: 2xx}  # overrides
```

### Polling for something that is not there yet

A `GET` that answers 404 until a record exists now fails on the first attempt, and 404 is
not in the default retry set, so the action gives up immediately. Say which one you mean:

```yml
# 404 is data; retry until the assert passes
http: {url: https://api.example.com/orders/42, expect_status: [2xx, 404]}
retry: {attempts: 10, delay: 500, exponential_backoff: true}
assert:
  tests:
    - value: body.id
      is_not_null: true
```

### Responses with no body

`204 No Content` and `304 Not Modified` carry no body by definition, and a `200` with
`content-length: 0` is legal. The body decodes to `null` rather than failing the action, so
a `DELETE` that answers 204 succeeds and `a|Delete::status|` still reads 204.

## Retrying safely: `idempotency`

Retrying a POST can mean charging a customer twice. RFC 9110 §9.2.2 permits automatically
retrying a non-idempotent request only when you have "some means to know that the request
semantics are actually idempotent... or some means to detect that the original request was
never applied". An idempotency key is that means.

```yml
http:
  url: https://api.stripe.com/v1/charges
  method: POST
  idempotency: {}                       # engine generates the key
```

Every attempt of one action execution sends the **same** key — that is the whole point, and
it is the part a config cannot express itself: `a|uuid|` is re-evaluated per attempt, so
each retry would carry a fresh key and be processed as a new request.

Set the key yourself when the *caller* may retry the whole workflow and you want those
attempts deduplicated too:

```yml
idempotency:
  key: a|body::orderId|                 # derived from your data
  header: PayPal-Request-Id             # default: Idempotency-Key
```

