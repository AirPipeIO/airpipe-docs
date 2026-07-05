Transforms reshape an action's data after it is fetched. Declare a
`post_transforms:` block — an **array of transform functions** applied in order.

```yml
actions:
  - name: AddAttribute
    http:
      url: https://jsonplaceholder.typicode.com/todos/10
    post_transforms:
      - extract_value: ".body"
      - add_attribute:
          env: production
```

The `filter` transform reuses the
[assertion](/docs/configuration/interfaces/actions/asserts) vocabulary to keep
only matching elements. Every transform and its fields are listed below.
