---
sidebar_position: 2
slug: /commands/server
---

# Command: server

The `airpipe-agent server` command specifies the mode in which the `airpipe-agent` will run in.
The command has a variety of options the agent can run with.

use: `airpipe-agent server`

```console
Air Pipe Engine: Server Mode

Usage: airpipe server [OPTIONS] --api-key <api-key>

Options:
      --api-key <api-key>              Platform API Key
      --dotenv <dotenv>                Specific dotenv file
      --config <config>                Specific config file
      --config-dir <config-dir>        Serve config files from target directory
      --config-ids <config-ids>        Serve hosted configs - use * for all, otherwise supply an array of comma delimited uuids
      --otel-endpoint <otel-endpoint>  Open Telemetry endpoint [env: OTEL_ENDPOINT=]
      --log-level <log-level>          Log Levels: info, debug, warning, error, trace, critical [default: info]
      --address <address>              HTTP bind address [default: 0.0.0.0]
      --port <port>                    HTTP Port [default: 4111]
  -h, --help                           Print help
```

The `server` command alone does not run the agent as it requires `--api-key` and one of the `config` flags to start the agent.

## Usage

Usage: `airpipe-agent server --api-key <key> --config-dir my/airpipe-configs/`

```console
{"msg":"starting up","level":"INFO","ts":"2024-03-29T09:47:58.388111736Z","mode":"server","svc":"airpipe","configs_local":1,"git_version":"4214b8a"}
{"msg":"establishing db connections","level":"INFO","ts":"2024-03-29T09:47:58.64216329Z","mode":"server","svc":"airpipe"}
{"msg":"starting config poller","level":"INFO","ts":"2024-03-29T09:47:58.642454032Z","mode":"server","svc":"airpipe"}
```

### Config Options

- `--config` Specific config file to be run `--config /path/to/file/config.yml`
- `--config-dor` Serve all airpipe configurations from the specificed directory `--config-dir /airpipe/configs`
- `--config-ids` Serve hosted configs with \* for all or supply an array of comma delimited uuids `--config-ids [123,124,123]`

### Environment Variables

Airpipe offers a `--dotenv` flag to specify any environment specific variables that AirPipe configurations require.

### Log Levels

The airpipe agent supports standard log levels and defaults to info when run without the `--log-level` flag. Log Levels are structured and ouput in JSON.

- `--log-level info`: logs out conicse messages as the airpipe-agent is being started/used
- `--log-level debug`: logs out detailed information for troubleshooting
- `--log-level warning`: log level which indicates unexpected behaviour that does not crash/exit out of the agent
- `--log-level error`: logs out system components that are inoperable/interfering with the agent functionality
- `--log-level trace`: most verbose option for full visibility
- `--log-level critical`: signifies critical issues that need to be resolved

### Network

By default `airpipe-agent` will run on the default address, using the `--address` flag you can specify what endpoint you want airpipe to run on.

By default `airpipe-agent` will run on port `4111` specific the `--port` flag to run on a different port

### OpenTelemetry

AirPipe offers support for OTEL endpoints by specifying the `--otel-endpoint` flag. Useful for connecting existing traces or starting new traces to be shipped off to your OTEL collector.

<!-- Add an example command/picture of OTEL collector -->
