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

## What `retry` repeats

`retry` only repeats failures that could plausibly succeed on another attempt. By default
that is `408`, `429`, `500`, `502`, `503`, `504` and transport failures (connection refused,
DNS, timeout). A `400` or `401` is attempted once: repeating it cannot change the answer,
and at scale it turns a partner's bad day into a retry storm.

```yml
- name: Push
  retry:
    attempts: 3
    delay: 100
    exponential_backoff: true      # 100ms, 200ms, 400ms...
    max_delay: 30000               # ...capped
  http: {url: https://api.example.com/x, method: POST}
```

The default set is the intersection of what Polly, the AWS and Azure SDKs and urllib3 all
treat as transient. It deliberately excludes `501` and `505`, which are permanent — proxies
blanket all of `5xx` because they cannot know better, but `on: [5xx]` is available if you
want that.

| Field | Effect |
|---|---|
| `on` | replace the default set — codes (`429`), classes (`5xx`), `timeout`, `connect`, `any` |
| `except` | subtract from whatever `on` resolves to, including the default |
| `respect_retry_after` | honour a `Retry-After` response header over the computed backoff (default `true`, still bounded by `max_delay`) |
| `jitter` | `full` (default) or `none` |
| `max_delay` | upper bound on a single wait, in milliseconds |

Jitter is on by default because without it every client that failed together retries
together, and a recovering upstream is hit by the same synchronised wave it just fell over
to.

Two narrowings worth knowing:

- `retry.on: [connect]` retries **only** failures that provably never reached the server —
  the strictest safe setting for a non-idempotent endpoint whose provider has no
  idempotency-key support. A timeout after the request was sent leaves the outcome unknown.
- Classification applies only when an unexpected status is why the action failed. An action
  that returned a fine status and failed its `assert` — polling until a record appears — is
  retried as it always was.

