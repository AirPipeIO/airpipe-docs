---
sidebar_position: 1
slug: /commands/
---

# Basic AirPipe Agent Features

<!-- add airpipe tutorial link -->

| Hands-on: Airpipe: Get Started tutorials

The Airpipe Agent accepts two commands `airpipe-agent server` or `airpipe-agent cli` depending in which mode you choose to run the agent.

To view a list of available commands run `airpipe-agent --help`

```console
kav@airpipe.io

Air Pipe Engine
Version: 1.0

Usage: airpipe <COMMAND>

Commands:
  server  Air Pipe Engine: Server Mode
  cli     Air Pipe Engine: CLI Mode
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help     Print help
  -V, --version  Print version

```

Use the `--help` or `-h` flags with the relevant subcommand for specific help. For example, to see help about 'server' mode you can run `airpipe-agent server --help`

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

<!-- To see help about 'cli' mode you can run `airpipe-agent cli --help`

```console
Air Pipe Engine: CLI Mode

Usage: airpipe cli [OPTIONS] --api-key <api-key> --interface <interface>

Options:
      --api-key <api-key>              Platform API Key
      --dotenv <dotenv>                Specific dotenv file
      --config <config>                Specific config file
      --config-dir <config-dir>        Serve config files from target directory
      --config-ids <config-ids>        Serve hosted configs - use * for all, otherwise supply an array of comma delimited uuids
      --otel-endpoint <otel-endpoint>  Open Telemetry endpoint [env: OTEL_ENDPOINT=]
      --log-level <log-level>          Log Levels: info, debug, warning, error, trace, critical [default: info]
      --run-tests <run-tests>          Run tests [possible values: true, false]
      --interface <interface>          Interface to run
  -h, --help                           Print help
``` -->
