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
[network policy](/docs/configuration/access-control). All fields follow.
