---
sidebar_position: 3
slug: /configuration/airpipe-runtime
displayed_sidebar: referenceSidebar
---

# Command: runtime

Manages the script runtimes that back the [`code:` action](/docs/features/code).

You only need this if a script **imports a module**. A script that imports nothing runs in the
engine's embedded interpreter, which is always available and needs no installation.

Runtimes are downloaded rather than bundled: the worker carries a full JavaScript engine and is
around 100 MB, while the scripts that need it are a small minority.

## `runtime install`

```console
airpipe runtime install [RUNTIME] [--version <v>] [--dir <path>] [--force]
```

| argument | default | |
|---|---|---|
| `RUNTIME` | `js-deno` | which runtime, as `<language>-<implementation>` |
| `--version` | latest published | install a specific version instead |
| `--dir` | beside the `airpipe` binary | install somewhere else |
| `--force` | off | replace a worker that is already installed |

```console
$ airpipe runtime install js-deno
```

The download is verified against its published checksum before anything is written, and the file
is moved into place atomically — an interrupted install leaves the previous worker intact rather
than a half-written binary.

Run it once per host. A worker is built for one platform and one CPU architecture, so an
`arm64` host needs the `arm64` build; there is no cross-architecture worker.

## Where the engine looks

At execution, in this order — first match wins:

| # | location |
|---|---|
| 1 | `AIRPIPE__SCRIPT_RUNTIME_JS` — a full path to a worker binary |
| 2 | `AIRPIPE__RUNTIME_DIR` — a directory holding one |
| 3 | beside the running `airpipe` binary — where `install` puts it by default |
| 4 | anywhere on `PATH` |

The engine never downloads a runtime by itself. Installing one is an explicit operator action, so
a worker appearing on a host is always something somebody did.

## Environment variables

| variable | |
|---|---|
| `AIRPIPE__SCRIPT_RUNTIME_JS` | path to a worker binary, overriding the search |
| `AIRPIPE__RUNTIME_DIR` | directory to search for a worker, and the parent of the module stores |
| `AIRPIPE_SCRIPT_STORE` | where resolved module stores live, if not under the runtime dir |
| `AIRPIPE_DOWNLOAD_URL` | download host, if you mirror releases internally |

## Module stores

Each distinct set of declared `dependencies` gets its own store, named from a hash of that set, so
two configs asking for different versions of the same package cannot collide.

Packages are resolved on first use and cached on disk — nothing is fetched while a request is in
flight. Stores are hardlinked from the shared package cache, so ten configs using the same package
cost one copy on disk, provided the store and the cache are on the same filesystem.

## See also

- [JavaScript in a config](/docs/features/code) — the `code:` action and its `dependencies` block.
