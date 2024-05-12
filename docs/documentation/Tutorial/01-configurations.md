---
sidebar_position: 1
slug: /tutorial/configurations
---

# 01 - Configurations

Configurations are a key component to using the platform. 

They are:
- Simple `YAML` files that can be deployed in hosted and self hosted modes
- Can contain multiple interfaces, and each interface can have multiple actions
- Interfaces can serve outputs such as `HTTP` commonly
- Actions can be used to fetch, retrieve, transform data and act as a workflows

Proceed with the steps under managed or unmanaged depending on your preferences, you can even try both if you'd like!

<details>
    <summary>Hosted / Managed</summary>

    In the web interface you can simply upload your config files, and choose to deploy it to `staging` or `production`, revision control is also available.
    
    - Log in -> https://app.airpipe.io/
    - Navigate to -> https://app.airpipe.io/configurations
        - This lists all your currently deployed (hosted) configurations and their deployment status
        - Take note of your API endpoints, the format is:
            -  `https://api.airpipe.io/<org_uuid>/<environment>/<your_route>`
    - Click `Add New` under `Configurations` in the left hand menu, or navigate to -> https://app.airpipe.io/configuration/add
        - This is where you can optionally paste in and edit any configuration you like
</details>

<details>
    <summary>Self Hosted / Unmanaged</summary>


    You can tell the `airpipe` binary to target any directory to serve/run these configs.

    - Navigate to where you installed the binary too
    - Create a configs directory if necessary
    - Construct the following command, substituting your API key from the prior step, and your configs directory path
        ```sh
        ./airpipe --api-key hello --config-dir /path/to/configs
        ```
    - Run the command, and if successful you will see some log output in your terminal, if no errors are present everything is good

</details>