Run terminal commands as an action input — CLI tools, scripts, `curl`, `df`, `ps`,
package managers, and so on. Parse the output into structured data with `parse`.

```yml
actions:
  - name: DiskFree
    command:
      run: df -h
      parse:
        data_type: text
        split_whitespace: true
```

Use `parse` / `parse_stderr` to turn stdout/stderr into JSON, CSV, or XML — by
delimiter, whitespace, line range, keys, or regex `matches`.
