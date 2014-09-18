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

**Usage:** `cfy status [-v, --verbosity]`

**Example:** `cfy status`

------

###  **use**

**Description:** defines a default management server to work with

**Usage:** `cfy use [-t, --management-ip <management_ip>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
  - *-t, --management-ip*: the management-server to define as the default management server

**Example:** `cfy use -t 10.0.0.1`

------

###  **init**

**Description:** initializes a cloudify working directory for a given provider

**Usage:** `cfy init [-p, --provider <provider>] [-r, --reset-config] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-p, --provider*: the cloudify provider to use for initialization

- **Optional:**
	- *-r, --reset-config*: a flag indicating that overwriting existing configuration is allowed

**Example:** `cfy init -p openstack`

------

###  **bootstrap**

**Description:** bootstraps cloudify on the current provider

**Usage:** `cfy bootstrap [-c, --config-file <file>] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *-c, --config-file*: path to the config file

**Example:** `cfy bootstrap`

------

###  **teardown**

**Description:** tears down the management-server, as well as any local resources under its context

**Usage:** `cfy teardown [-c, --config-file] [-f, --force] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *-c, --config-file*: path to the config file
	- *-f, --force*: a flag indicating confirmation for this irreversible action

**Example:** `cfy teardown -f`

------

###  **blueprints upload**

**Description:** uploads a blueprint to the management server

**Usage:** `cfy blueprints upload [-p, --blueprint-path <blueprint_path>] [-b, --blueprint-id <blueprint_id>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-p, --blueprint-path*: path to the blueprint (yaml file) to upload

- **Optional:**
	- *-b, --blueprint-id*: a unique id for the uploaded blueprint (Plan name is used if this parameter is omitted)

**Example:** `cfy blueprints upload -p blueprint.yaml`

{%warning title=Foo%}
This command will in fact upload the entire folder of the given target file rather than just the target file itself (to support imports, plugins and so on..) - It is therefore recommended to have a designated folder for the blueprint, where there won't be any unrelated files.
{%endwarning%}

------

###  **blueprints list**

**Description:** lists the blueprint on the management server, as well as the blueprints local aliases

**Usage:** `cfy blueprints list [-v, --verbosity]`

**Example:** `cfy blueprints list`

------

###  **blueprints delete**

**Description:** deletes the blueprint from the management server

**Usage:** `cfy blueprints delete [-b, --blueprint-id <blueprint_id>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-b, --blueprint-id*: the id of the blueprint to delete

**Example:** `cfy blueprints delete -b my-blueprint`

------

###  **deployments create**

**Description:** creates a deployment from a blueprint

**Usage:** `cfy deployments create [-b, --blueprint-id <blueprint_id>] [-d, --deployment-id <deployment_id>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-b, --blueprint-id*: the id of the blueprint to deploy
	- *-d, --deployment-id*: a unique id for the created deployment

**Example:** `cfy deployments create -b my-blueprint -d my-deployment`

------

###  **deployments delete**

**Description:** deletes the deployment (and its resources) from the management server

**Usage:** `cfy deployments delete [-d, --deployments-id <deployment_id>] [-f, --ignore-live-nodes] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *blueprint_id*: the id of the blueprint to delete

- **Optional:**
	- *ignore-live-nodes*: a flag determining whether to delete the deployment even if it still has live nodes

**Example:** `cfy deployments delete -d my-deployment`

------


### **deployments list**

**Description** Lists deployments on management server

**Usage** `cfy deployments list [-b, --blueprint-id <blueprint-id>] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *-b, --blueprint-id*: the id of a blueprint, to list only deployments of that specific blueprint

------

###  **workflows get**

**Description:** gets a workflow by its name and deployment id. This command will also show the workflow's parameters.

**Usage:** `cfy workflows get [-w, --workflow-id <workflow_id>] [-d, --deployment-id <deployment_id] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-w, --workflow-id*: the id/name of the workflow to get
	- *-d, --deployment-id*: the id of the deployment for which the workflow belongs

**Example:** `cfy workflows get -w my-workflow -d my-deployment`


------

###  **workflows list**

**Description:** lists the workflows of a deployment

**Usage:** `cfy workflows list [-d, --deployment-id <deployment_id>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-d, --deployment-id*: the id of the deployment whose workflows to list

**Example:** `cfy workflows list -d my-deployment`


------

###  **executions start**

**Description:** executes a workflow on a deployment

**Usage:** `cfy executions start [-w, --workflow <workflow-id>] [-d, --deployment-id <deployment_id>] [-p, --parameters <parameters>] [--allow-custom-parameters] [-v, --verbosity] [--timeout <timeout>] [--force]`

**Parameters:**

- **Mandatory:**
	- *-w, --workflow*: the id of the workflow to execute
	- *-d, --deployment-id*: the deployment id on which the operation should be executed

- **Optional:**
	- *-p, --parameters*: parameters for the workflow execution (in JSON format)
	- *--allow-custom-parameters*: A flag for allowing the passing of custom parameters (parameters which were not defined in the workflow's schema in the blueprint) to the execution
	- *--timeout*: operation timeout in seconds (The execution itself will keep going. It is the CLI that will stop waiting for it to terminate)
	- *--force*: A flag indicating the workflow should execute even if there is an ongoing execution for the provided deployment

**Example:** `cfy executions start -w install -d my-deployment`

------


###  **executions get**

**Description:** gets an execution by its id. This command will also show the execution's parameters.

**Usage:** `cfy executions get [-e, --execution-id <execution_id>] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-e, --execution-id*: the id of the execution to get

**Example:** `cfy executions get -e my-execution`


------

###  **executions list**

**Description:** list executions

**Usage:** `cfy executions list [-d, --deployment-id <deployment_id>] [-v, --verbosity]`

**Parameters:**

- **Optional:**
	- *-d, --deployment-id*: the id of the deployment whose executions to list

**Example:** `cfy executions list -d my-deployment`

------

###  **executions cancel**

**Description:** Cancels an execution by its id

**Usage:** `cfy executions cancel [-e, --execution-id <execution_id>] [-f, --force] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-e, --execution-id*: the id of the execution to cancel

- **Optional:**
	- *--force*: A flag indicating authorization to terminate the execution abruptly rather than request an orderly termination

**Example:** `cfy executions cancel -e some-execution-id -f`

------

###  **events list**

**Description:** fetches events of an execution

**Usage:** `cfy events list [-e, --execution-id <execution_id>] [-l, --include-logs] [-v, --verbosity]`

**Parameters:**

- **Mandatory:**
	- *-e, --execution-id*: the id of the execution to fetch events for

- **Optional:**
	- *include-logs*: determines whether to fetch logs in addition to events

**Example:** `cfy events list --execution-id 92515e66-5c8f-41e0-a361-2a1ad92706b2`
