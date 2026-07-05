Actions are the steps an interface runs when called. Each action does one thing —
fetch data or transform it — and actions can be ordered, retried, and run
conditionally on each other's results.

An action's data comes from an `input:` selector (request data or a previous
action's output), or from a fetch: [`http`](./04-inputs-http.md),
[`database`](./06-inputs-database.md), [`command`](./05-inputs-command.md),
[`email`](./08-inputs-email.md), or a [`lookup`](/docs/configuration/interfaces/actions/lookups)
to fan out over an array. Then validate with [`assert`](./12-asserts.md), reshape
with [`post_transforms`](./11-transforms.md), and order with `run_when_succeeded`
/ `run_when_failed` / `depends_on`.

```yml
actions:
  - name: FetchUser
    http:
      url: https://api.example.com/users/a|params::id|
  - name: Notify
    run_when_succeeded: [FetchUser]
    http:
      url: https://hooks.example.com/notify
      body: { email: a|FetchUser::email| }
```

Reference a previous action's output with `a|ActionName::field|` — see
[Interpolation](/docs/configuration/interpolation). All action fields follow.
