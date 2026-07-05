Send an email from an action. Delivery is over SMTP — configure it with an `smtp`
block, then set `from`, `to` (plus optional `cc`, `bcc`, `reply_to`), `subject`,
and an `html` or `text` body.

```yml
actions:
  - name: SendWelcome
    email:
      smtp:
        server: smtp.example.com
        port: 587
        user: a|secret::smtp_user|
        pass: a|secret::smtp_pass|
      from: hello@example.com
      to: a|body::email|
      subject: Welcome
      html: "<h1>Welcome aboard</h1>"
```
