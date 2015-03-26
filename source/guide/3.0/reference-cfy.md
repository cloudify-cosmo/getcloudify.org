---
layout: bt_wiki
title: CFY CLI Command Reference
category: Reference
publish: true
abstract: Reference for CFY commands
pageord: 200
---

{% linklist h3 %}

{%note title=Note%}
Verbose output can be applied to every action by supplying the --verbosity (or -v) flag.
{%endnote%}

### **status**

**Description:** queries the status of the management server

**Usage:** `cfy status [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *management-ip*: the management-server to use

**Example:** `cfy status`

------

###  **use**

**Description:** defines a default management server to work with

**Usage:** `cfy use <management_ip> [-a, --alias <alias>] [-f, --force] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
  - *management_ip*: the management-server to define as the default management server

- **Optional:**
	- *alias*: a local alias for the given management server address
	- *force*: a flag indicating authorization to overwrite the alias provided if it's already in use

**Example:** `cfy use 10.0.0.1 -a my-mgmt-server`

------

###  **init**

**Description:** initializes a cloudify working directory for a given provider

**Usage:** `cfy init <provider> [-t, --target-dir <dir>] [-r, --reset-config] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *provider*: the cloudify provider to use for initialization

- **Optional:**
	- *target-dir*: the directory that will be used as the cloudify working directory
	- *reset-config*: a flag indicating overwriting existing configuration is allowed

**Example:** `cfy init openstack`

------

###  **bootstrap**

**Description:** bootstraps cloudify on the current provider

**Usage:** `cfy bootstrap [-c, --config-file <file>] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *config-file*: path to the config file

**Example:** `cfy bootstrap`

------

###  **teardown**

**Description:** tears down the management-server, as well as any local resources under its context

**Usage:** `cfy teardown [-c, --config-file] [-f, --force] [-fv, --force-validation] [-fd, --force-deployments] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *config-file*: path to the config file
	- *force*: a flag indicating confirmation for this irreversible action
	- *force-validation*: A flag indicating confirmation for the provider to continue with the teardown process even if conflicts are detected, allowing whatever resources with which there aren't any conflicts to be removed
	- *force-deployments*: A flag indicating confirmation to continue with the teardown process even if the management server currently has active deployments
	- *management-ip*: the management-server to use

**Example:** `cfy teardown -f`

------

###  **blueprints upload**

**Description:** uploads a blueprint to the management server

**Usage:** `cfy blueprints upload <blueprint_path> [-b, --blueprint-id <blueprint_id>] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *blueprint_path*: path to the blueprint (yaml file) to upload

- **Optional:**
	- *blueprint_id*: a unique id for the uploaded blueprint (Plan name is used if this parameter is omitted)
	- *management-ip*: the management-server to use

**Example:** `cfy blueprints upload blueprint.yaml`

{%warning title=Foo%}
This command will in fact upload the entire folder of the given target file rather than just the target file itself (to support imports, plugins and so on..) - It is therefore recommended to have a designated folder for the blueprint, where there won't be any unrelated files.
{%endwarning%}

------

###  **blueprints list**

**Description:** lists the blueprint on the management server, as well as the blueprints local aliases

**Usage:** `cfy blueprints list [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *management-ip*: the management-server to use

**Example:** `cfy blueprints list`

------

###  **blueprints delete**

**Description:** deletes the blueprint from the management server

**Usage:** `cfy blueprints delete [-b, --blueprint-id <blueprint_id>] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *blueprint_id*: the id of the blueprint to delete

- **Optional:**
	- *management-ip*: the management-server to use

**Example:** `cfy blueprints delete -b my-blueprint`

------

###  **deployments create**

**Description:** creates a deployment from a blueprint

**Usage:** `cfy deployments create [-b, --blueprint-id <blueprint_id>] [-d, --deployment-id <deployment_id>] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *blueprint_id*: the id of the blueprint to deploy
	- *deployment_id*: a unique id for the created deployment

- **Optional:**
	- *management-ip*: the management-server to use

**Example:** `cfy deployments create -b my-blueprint -d my-deployment`

------

###  **deployments delete**

**Description:** deletes the deployment (and its resources) from the management server

**Usage:** `cfy deployments delete [-d, --deployments-id <deployment_id>] [-f, --ignore-live-nodes] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *blueprint_id*: the id of the blueprint to delete

- **Optional:**
	- *ignore-live-nodes*: a flag determining whether to delete the deployment even if it still has live nodes
	- *management-ip*: the management-server to use

**Example:** `cfy deployments delete -d my-deployment`

------

###  **deployments execute**

**Description:** executes an operation on a deployment

**Usage:** `cfy deployments execute <operation> [-d, --deployment-id <deployment_id>] [-p, --parameters <parameters>] [--allow-custom-parameters] [-t, --management-ip <ip>] [-v, --verbosity] [--timeout <timeout>] [--force]`

**Parameters:**

- **Mandatory:**
	- *operation*: the name of the operation to execute
	- *deployment_id*: the deployment id on which the operation should be executed

- **Optional:**
	- *parameters*: parameters for the workflow execution (in JSON format)
	- *allow-custom-parameters*: A flag for allowing the passing of custom parameters (parameters which were not defined in the workflow's schema in the blueprint) to the execution
	- *management-ip*: the management-server to use
	- *timeout*: operation timeout in seconds (The execution itself will keep going. It is the CLI that will stop waiting for it to terminate)
	- *force*: A flag indicating the workflow should execute even if there is an ongoing execution for the provided deployment

**Example:** `cfy deployments execute install -d my-deployment`

------

**Command** deployments list

**Description** Lists deployments on management server

**Usage** `cfy deployments list [-b, --blueprint-id <blueprint-id>] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *blueprint-id*: the id of a blueprint, to list only deployments of that specific blueprint
	- *management-ip*: the management-server to use

------

###  **workflows get**

**Description:** gets a workflow by its name and deployment id. This command will also show the workflow's parameters.

**Usage:** `cfy workflows get [-w, --workflow-id <workflow_id>] [-d, --deployment-id <deployment_id] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *workflow_id*: the id/name of the workflow to get
	- *deployment_id*: the id of the deployment for which the workflow belongs

- **Optional:**
	- *management-ip*: the management-server to use

**Example:** `cfy workflows get -w my-workflow -d my-deployment`


------

###  **workflows list**

**Description:** lists the workflows of a deployment

**Usage:** `cfy workflows list [-d, --deployment-id <deployment_id>] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *deployment_id*: the id of the deployment whose workflows to list

- **Optional:**
	- *management-ip*: the management-server to use

**Example:** `cfy workflows list -d my-deployment`


------

###  **executions get**

**Description:** gets an execution by its id. This command will also show the execution's parameters.

**Usage:** `cfy executions get [-e, --execution-id <execution_id>] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *execution_id*: the id of the execution to get

- **Optional:**
	- *management-ip*: the management-server to use

**Example:** `cfy executions get -e my-execution`


------

###  **executions list**

**Description:** lists the executions of a deployment

**Usage:** `cfy executions list [-d, --deployment-id <deployment_id>] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *deployment_id*: the id of the deployment whose executions to list

- **Optional:**
	- *management-ip*: the management-server to use

**Example:** `cfy executions list -d my-deployment`

------

###  **executions cancel**

**Description:** Cancels an execution by its id

**Usage:** `cfy executions cancel [-e, --execution-id <execution_id>] [-f, --force] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *execution_id*: the id of the execution to cancel

- **Optional:**
	- *force*: A flag indicating authorization to terminate the execution abruptly rather than request an orderly termination
	- *management-ip*: the management-server to use

**Example:** `cfy executions cancel -e some-execution-id -f`

------

###  **events**

**Description:** fetches events of an execution

**Usage:** `cfy events [-h] [-e EXECUTION_ID] [-l, --include-logs] [-t, --management-ip <ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *execution-id*: the id of the execution to fetch events for

- **Optional:**
	- *include-logs*: determines whether to fetch logs in addition to events
	- *management-ip*: the management-server to use

**Example:** `cfy events --execution-id 92515e66-5c8f-41e0-a361-2a1ad92706b2`
