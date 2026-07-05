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

## Document stores {#document_operation}

NoSQL / document stores use a `document_operation` block instead of `query` —
`database`, `collection`, `operation` (`find`, `findOne`, `insertOne`,
`updateMany`, `aggregate`, …) and the relevant `filter` / `pipeline` / `insert` /
`update` / `delete` / `options`. Full fields are in the `DocumentOperation` type
below.
