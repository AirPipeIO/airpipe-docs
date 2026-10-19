---
sidebar_position: 1
slug: /configuration/airpipe-agent
displayed_sidebar: referenceSidebar
---

# Basic AirPipe Agent Features

<!-- add airpipe tutorial link -->

| Hands-on: Airpipe: Get Started tutorials

The Airpipe Agent accepts two commands `airpipe-agent server` or `airpipe-agent cli` depending in which mode you choose to run the agent.

To view a list of available commands run `airpipe-agent --help`

```console
kav@airpipe.io

Air Pipe Engine
Version: 3.11.2

Usage: airpipe <COMMAND>

Commands:
  server   Air Pipe Engine: Server Mode
  cli      Air Pipe Engine: CLI Mode
  login    Air Pipe Engine: connect this machine to your account
  logout   Air Pipe Engine: forget this machine's stored credentials
  whoami   Air Pipe Engine: show what this machine is connected to
  runtime  Air Pipe Engine: manage script runtimes for the code: action
  help     Print this message or the help of the given subcommand(s)

Options:
  -h, --help     Print help
  -V, --version  Print version
```

Use the `--help` or `-h` flags with the relevant subcommand for specific help. For example, to see help about 'server' mode you can run `airpipe-agent server --help`

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

<!-- To see help about 'cli' mode you can run `airpipe-agent cli --help`

```console
Air Pipe Engine: CLI Mode

Usage: airpipe cli [OPTIONS] --interface <interface>

Options:
      --api-key <api-key>              Platform API Key (defaults to the key stored by `airpipe login`) [env: AIRPIPE_API_KEY=]
      --dotenv <dotenv>                Specific dotenv file [env: AIRPIPE_DOTENV=]
      --config <config>                Specific config file [env: AIRPIPE_CONFIG=]
      --config-dir <config-dir>        Serve config files from target directory [env: AIRPIPE_CONFIG_DIR=]
      --config-ids <config-ids>        Serve hosted configs - use * for all, otherwise supply an array of comma delimited uuids [env: AIRPIPE_CONFIG_IDS=]
      --otel-endpoint <otel-endpoint>  Open Telemetry endpoint [env: AIRPIPE_OTEL_ENDPOINT=]
      --log-level <log-level>          Log Levels: info, debug, warning, error, trace, critical [env: AIRPIPE_LOG_LVL=] [default: info]
      --run-tests <run-tests>          Run tests [possible values: true, false]
      --interface <interface>          Interface to run
      --staging <staging>              Cosmetic identifier, for eg. helps to understand billing by environment [env: STAGING=] [default: false] [possible values: true, false]
  -h, --help                           Print help
``` -->
