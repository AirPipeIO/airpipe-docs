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

## Success and failure: `expect_exit`

A command's exit code is its own failure signal, so it decides the action's outcome the same
way an HTTP status does. The default is `0`; anything else fails the action, which is what
makes `retry`, `run_when_failed` and error branches work against a failing script.

```yml
- name: Build
  command:
    run: ./build.sh            # exits non-zero -> the action fails
```

A failing command returns `stdout`, `stderr` and `exit_code` together, whatever the parse
config says, so an error branch can read the code and whatever the command wrote:

```yml
- name: Report
  run_when_failed: [Build]
  input: a|Build|              # .exit_code, .stdout, .stderr
```

| Value | Meaning |
|---|---|
| unset | `0` is success (the default) |
| `2` | one exact code |
| `[0, 1]` | any of a list — e.g. `grep`, where 1 means "no matches" |
| `any` | never fail on the exit code |

