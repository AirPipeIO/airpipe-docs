Asserts validate data. Add an `assert:` block with a list of `tests` to an action
(to gate it) or to an interface (to check the final result). Each test resolves a
value — with `value` (a JSON path), `jq`, `pointer`, or an `action` reference —
then checks it with one or more conditions.

```yml
actions:
  - name: CheckBody
    input: a|body|
    assert:
      http_code_on_error: 400
      tests:
        - value: email
          is_not_null: true
          is_not_empty: true
        - value: age
          data_type: Number # a body or query value can arrive as text
          is_greater_than_or_equal_to: 18
```

The condition vocabulary is large — equality and ordering, string/pattern
(`contains`, `like`, `regex`, …), type and emptiness, and specialized validators
(`is_valid_jwt`, `is_valid_hmac`, `verify_bcrypt`, `verify_signature`,
`verify_schema`, `semver_matches`, …). The `filter` transform reuses the same
`Test` vocabulary. Every field of `Assert` and `Test` follows.

## When the step itself fails

An action's own `assert` judges the data the action produced. If the action itself failed,
it produced nothing to judge: the tests do not run, and the action answers with what failed.

| What failed | Status | `error` |
|---|---|---|
| The database could not be reached: refused, timed out, pool exhausted, restarting or failing over | `503` | `database unavailable` |
| The database rejected the query: a syntax error, a missing table or column (in MongoDB, an unknown pipeline stage or command), a permission or login failure | `500` | `the database rejected the query` |
| An upstream (`http:`) was unreachable | `503` | `upstream unreachable` |
| An upstream timed out | `503` | `upstream timed out` |

This holds for Postgres, MySQL, SQL Server, SQLite and MongoDB (MongoDB from 3.22.1). The driver's own message is kept in `errors`. Upstream failures answer `503` rather than `502` /
`504` so the body reaches the caller: proxies and CDNs commonly replace the body of a `502` or
`504` with their own error page. A failure caused by the request's data — a
duplicate key, a value a column rejects — is still judged by the tests, so a check that
answers `409` for a duplicate keeps doing so.

```yml
  orders/get:
    output: http
    method: POST
    actions:
      - name: GetOrder
        database: main
        query: SELECT id, status FROM orders WHERE id = $1
        params: [a|body::id|]
        assert:
          http_code_on_error: 404
          error_message: Order not found
          tests:
            - value: count()
              is_equal_to: 1
```

With order `1` in the table, `{"id": 1}` answers `200` and `{"id": 99}` answers `404`
`Order not found`. With the database down, both answer `503` `database unavailable`.
Before 3.19.0 that was a `404` as well, telling the caller the order did not exist; on a token
lookup it was a `401`, signing the caller out.

## Missing fields

A check that cannot read its field fails: there is nothing there to match. With no
`authorization` header, this answers `401` `Sign in first`:

```yml
  me:
    output: http
    method: GET
    actions:
      - name: CheckAuth
        input: a|headers|
        hide_data_on_error: true # don't send the request's headers back
        assert:
          http_code_on_error: 401
          error_message: Sign in first
          tests:
            - value: authorization
              starts_with: "Bearer "
```

The negated checks (`not_contains`, `not_starts_with`, `not_regex`, …) pass a missing field,
because it really does not contain the text; so does `is_not_equal_to`. Before 3.20.0 the text
checks (`starts_with`, `contains`, `regex`, `like`, …) passed a missing field too, and this
guard let the request through.

A field that may be left out says so with `is_not_null: false`. When it is missing, the test's
other checks are not run; when it is present, they are:

```yml
  files/rename:
    output: http
    method: POST
    actions:
      - name: CheckBody
        input: a|body|
        assert:
          http_code_on_error: 400
          tests:
            - value: filename
              is_not_null: false
              ends_with: [".yml", ".yaml"]
```

`{}` and `{"filename": "app.yml"}` answer `200`; `{"filename": "app.exe"}` answers `400`.

## Text checks take text

`starts_with`, `ends_with` and their `not_` forms compare text, and so do `contains` and
`not_contains` against a string or a number. Write a number operand in quotes: YAML reads an
unquoted `3.10` as the number `3.1`, which would match `"3.15"`. Rather than guess, the
engine refuses an unquoted number: validation rejects it, and at run time the test fails with
`starts_with: 2026 is a number, and starts_with compares text — write it in quotes ("2026"), or add ->to_string to the marker it comes from.`
An operand taken from a marker (`starts_with: a|body::prefix|`) is checked once it resolves:
a number from the data needs `->to_string`, and a marker that resolves to nothing fails the
check.

```yml
- value: version
  starts_with: "3.10"
```

Against an array, `contains` checks membership and a number is a fair operand: `contains: 5`
passes for `[1, 5]`. To check a number against a set of numbers, use `is_in`.
