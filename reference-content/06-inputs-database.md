Define a database in `global.databases` (reused across actions) or inline on an
action. Connect with a `driver` + `conn_string`, or with discrete
`user`/`pass`/`host`/`dbname` fields — don't mix the two.

Supported drivers: `postgres`, `mysql`, `mssql`, `sqlite`, `mongodb`
(also Azure Cosmos DB and Amazon DocumentDB via the MongoDB driver).

```yml
global:
  databases:
    main:
      driver: postgres
      conn_string: "postgresql://a|env::PG_USER|:a|env::PG_PASS|@a|env::PG_HOST|/app"

interfaces:
  users:
    method: GET
    actions:
      - name: List
        database: main
        query: SELECT * FROM users
```

Pass request values to a query with `params` (`params: [a|body::email|]`), not `input:`. An
`input:` read from the request (`a|body|`, `a|params|`, ...) is used *instead* of running the
query: the action answers with the request and the query never runs. Validation refuses a
database action with both, and config load warns about it.

When the database cannot be reached or rejects the query, the action answers `503` or `500`,
even if its own `assert` would answer something else — see
[When the step itself fails](./12-asserts.md#when-the-step-itself-fails).

## Document stores {#document_operation}

NoSQL / document stores use a `document_operation` block instead of `query` —
`database`, `collection`, `operation` (`find`, `findOne`, `insertOne`,
`updateMany`, `aggregate`, …) and the relevant `filter` / `pipeline` / `insert` /
`update` / `delete` / `options`. Full fields are in the `DocumentOperation` type
below.
