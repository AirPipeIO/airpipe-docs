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
| The database rejected the query: a syntax error, a missing table or column, a permission or login failure | `500` | `the database rejected the query` |
| An upstream (`http:`) was unreachable | `503` | `upstream unreachable` |
| An upstream timed out | `503` | `upstream timed out` |

The driver's own message is kept in `errors`. Upstream failures answer `503` rather than `502` /
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
