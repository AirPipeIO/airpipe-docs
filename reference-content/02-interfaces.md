An **interface** is an endpoint. Add any number of them to a config under
`interfaces:` — each key is the interface name (and default route). When an
interface is triggered it runs its ordered list of [actions](./03-actions.md).

```yml
interfaces:
  prod/user-login:
    summary: Log a user in
    description: Verify credentials and return a token
    tags: [auth]
    output: http
    method: POST
    actions:
      - name: CheckInput
      - name: VerifyUser
      - name: VerifyPassword
```

An interface can also run on a [schedule](/docs/configuration/scheduling), be
exposed as an [MCP tool](/docs/configuration/mcp-tools), and carry a
[network policy](/docs/configuration/access-control).

## Answering before the work finishes

By default an interface answers once every action has finished. Two fields change
that, and they are independent of each other.

`stream:` forwards a streaming action's output onward as it arrives, instead of only
returning it once the action completes. Point `from:` at an action already reading a
stream (`stream: true` on its `http:`) and give it a channel; subscribers receive the
pieces live while the action is still running.

`respond: early` returns `{ accepted, request_id }` with a `202` straight away and
finishes the run in the background. Use it when the work outlives what a caller — or a
proxy in front of you — is willing to wait for.

```yml
interfaces:
  chat:
    output: http
    method: POST
    respond: early                    # 202 now, keep working
    stream:
      from: AskModel                  # the action reading the stream
      to: channel
      channel: a|body::session_id|    # subscribers watch this
    actions:
      - name: AskModel
        http:
          url: https://api.example.com/v1/chat/completions
          method: POST
          stream: true
          idle_timeout: 30s
```

Together these are how a chat UI is built on Air Pipe: the browser posts, gets its
`202` immediately, and renders tokens as they arrive on the channel.

Two things to know before using `respond: early`. The status code is committed before
the work runs, so `http_code_on_error` and any assert after that point can no longer
change what the caller sees — a later failure has to reach them another way, which is
what the channel is for. And detached runs are capped per organisation: over the limit
the request is refused with `429` rather than queued.

Deltas are batched (about every 50ms, or 200 characters) rather than published one per
token. See [WebSocket channels](/docs/features/realtime/websocket) for subscribing.

All fields follow.
