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
          is_greater_than_or_equal_to: 18
```

The condition vocabulary is large — equality and ordering, string/pattern
(`contains`, `like`, `regex`, …), type and emptiness, and specialized validators
(`is_valid_jwt`, `is_valid_hmac`, `verify_bcrypt`, `verify_signature`,
`verify_schema`, `semver_matches`, …). The `filter` transform reuses the same
`Test` vocabulary. Every field of `Assert` and `Test` follows.
