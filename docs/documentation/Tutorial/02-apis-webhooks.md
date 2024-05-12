---
sidebar_position: 1
slug: /tutorial/apis-and-webhooks
---

# 02 - APIs & Webhooks

The most common usecase for many is building APIs and Webhooks. The initial part of the tutorial will focus on this.

These can be built from existing endpoints, shell commands, scripts, files etc. and chained with storing to a database or being ingested by another endpoint etc.

As we step through, you will be naturally exposed to how `workflows`, `automations` and `command` based utilities can be built.

## Steps

### 1. HTTP GET API
<details>
    <summary>Hosted / Managed</summary>
- Ensure you are logged into https://app.airpipe.io
- Click <button>[Deploy](https://app.airpipe.io/configuration/load?yml=https://raw.githubusercontent.com/airpipeio/airpipe-docs/main/docs/documentation/Tutorial/_yml/02-http-get.yml)</button> to load the below [example config](#example-config) into your account
    - Alternatively, go to Configurations > Add New, and copy and paste the example
- Check `Deploy to Staging` 
- In your browser navigate to:
    - https://app.airpipe.io/your_org_uuid/staging/tutorial/myroute?msg=hello
</details>
<details>
    <summary>Self Hosted / Unmanaged</summary>
- Copy this config into your config directory, update the path as necessary eg.
    ```
        .../some-path/configs/02-http-get.yml
    ```
- Start `airpipe` eg.
    ```
    ./airpipe
    ```
</details>

#### Example Config
```yml reference title="HTTP GET API"
https://github.com/airpipeio/airpipe-docs/blob/main/docs/documentation/Tutorial/_yml/02-http-get.yml
```