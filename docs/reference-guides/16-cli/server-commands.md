---
sidebar_position: 2
slug: /configuration/server
displayed_sidebar: referenceSidebar
---

# Command: server

The `airpipe-agent server` command specifies the mode in which the `airpipe-agent` will run in.
The command has a variety of options the agent can run with.

use: `airpipe-agent server`

```console
Air Pipe Engine: Server Mode

Usage: airpipe server [OPTIONS]

Options:
      --api-key <api-key>
          Platform API Key (defaults to the key stored by `airpipe login`) [env: AIRPIPE_API_KEY=]
      --dotenv <dotenv>
          Specific dotenv file [env: AIRPIPE_DOTENV=]
      --config <config>
          Specific config file [env: AIRPIPE_CONFIG=]
      --config-dir <config-dir>
          Serve config files from target directory [env: AIRPIPE_CONFIG_DIR=]
      --config-ids <config-ids>
          Serve hosted configs - use * for all, otherwise supply an array of comma delimited uuids [env: AIRPIPE_CONFIG_IDS=]
      --otel-endpoint <otel-endpoint>
          Open Telemetry endpoint [env: AIRPIPE_OTEL_ENDPOINT=]
      --log-level <log-level>
          Log Levels: info, debug, warning, error, trace, critical [env: AIRPIPE_LOG_LVL=] [default: info]
      --address <address>
          HTTP bind address [default: 0.0.0.0]
      --port <port>
          HTTP Port [default: 4111]
      --udp-port <udp-port>
          UDP Port [default: 4119]
      --staging <staging>
          Cosmetic identifier, for eg. helps to understand billing by environment [env: STAGING=] [default: false] [possible values: true, false]
      --docs-title <docs-title>
          Title shown in auto-generated API documentation [env: AIRPIPE_DOCS_TITLE=]
      --docs-description <docs-description>
          Description shown in auto-generated API documentation [env: AIRPIPE_DOCS_DESCRIPTION=]
      --metrics-address <metrics-address>
          Prometheus /metrics bind (self-hosted): host:port, or 'off' to disable. 'off' also drops per-request instrumentation. Default is loopback so metrics are not exposed on the public API bind; set 0.0.0.0:<port> only behind a firewall. [env: AIRPIPE__METRICS_BIND=] [default: 127.0.0.1:9090]
  -h, --help
          Print help
```

The `server` command needs an API key (`--api-key`, `AIRPIPE_API_KEY`, or the key stored by `airpipe login`) and one of the `config` flags to start the agent.

## Usage

Usage: `airpipe-agent server --api-key <key> --config-dir my/airpipe-configs/`

```console
{"msg":"starting up","level":"INFO","ts":"2024-03-29T09:47:58.388111736Z","mode":"server","svc":"airpipe","configs_local":1,"git_version":"4214b8a"}
{"msg":"establishing db connections","level":"INFO","ts":"2024-03-29T09:47:58.64216329Z","mode":"server","svc":"airpipe"}
{"msg":"starting config poller","level":"INFO","ts":"2024-03-29T09:47:58.642454032Z","mode":"server","svc":"airpipe"}
```

### Config Options

- `--config` Specific config file to be run `--config /path/to/file/config.yml`
- `--config-dir` Serve all airpipe configurations from the specificed directory `--config-dir /airpipe/configs`
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

### Prometheus metrics bind

The Prometheus `/metrics` endpoint is served on its **own** listener — separate from the API bind above — so it is not exposed alongside your public API. `--metrics-address` (env `AIRPIPE__METRICS_BIND`) controls it, default **`127.0.0.1:9090`** (loopback):

- `--metrics-address 127.0.0.1:9090` — loopback (default); scrape locally or via a sidecar.
- `--metrics-address 0.0.0.0:9090` — all interfaces; **firewall the port** (metrics are unauthenticated by Prometheus convention).
- `--metrics-address off` — disable the endpoint entirely (also drops the per-request instrumentation overhead).

Scrape it at `http://<metrics-bind>/metrics` (default `http://127.0.0.1:9090/metrics`). Available in self-hosted modes only. *(Added in engine 1.7.2; earlier versions served `/metrics` on the API port.)*

### OpenTelemetry

Air Pipe ships traces to any OpenTelemetry collector over OTLP HTTP. Set `--otel-endpoint` (env `AIRPIPE_OTEL_ENDPOINT`) to the collector's traces URL, including the `/v1/traces` path: the engine posts to the URL exactly as given.

```console
airpipe server --config-dir my/airpipe-configs/ --otel-endpoint http://localhost:4318/v1/traces
```

Requires engine 3.11.2 or later. Headers, sampling and what each span carries are in [OpenTelemetry tracing](/docs/otel-tracing).
