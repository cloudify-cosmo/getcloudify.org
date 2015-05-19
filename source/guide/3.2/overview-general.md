---
layout: bt_wiki
title: Architecture Overview
category: Product Overview
publish: false
abstract: Overview of Cloudify's Architecture
pageord: 100

terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

Cloudify 3 has a new architecture and a new code base and is composed of the following main parts:

* **Comand-Line Interface**
* **Manager**
* **Agents**

## The Command-Line Interface

Cloudify's CLI is written in Python and comprises of several modules:

* The CLI module itself which provides the interface.
* Cloudify's DSL parser which parses blueprints.
* Cloudify's Plugins used for bootstrapping a Cloudify Manager or for executing Cloudify workflows locally.

The CLI uses Cloudify's REST client module to interact with the Manager running Cloudify's REST service.
All requests are served via a proxy.


## The Manager

Cloudify's Manager comprises of Cloudify's code and a set of Open-Source applications. An elaborate explanation on these applications is provided [here](overview-components.html).

The Manager's architecture is designed in such a way to provide support for all potential operational flows you might require when managing your applications such as:

* Event Stream Processing
* Secured Requests
* Metrics Queuing, Aggregation and Analysis
* Logs/Events Queuing, Aggregation and Analysis
* Manual or Automated Task execution and Queuing based on live streams of events or aggregated data.
* Interaction with Cloudify's Agents for executing tasks on application hosts and maintaining them.

## The Agents

Cloudify's Agents are entities designed to execute tasks on application hosts. They're able to listen to task queues and execute tasks when required.

The agents are designed to execute tasks using [Cloudify specific Plugins](plugins-general.html).

In the background, the same agents used on the hosts are also used in the Manager but in a different context. For instance, each deployment has two agents, one of which talks to IaaS APIs to deploy resources.

Note that Cloudify can run in "Agentless" mode which means that agents can use certain plugins to manage hosts without the agents being installed on them. A user can decide which server nodes will have agents installed on them by stating the choice in the blueprint.

More on agents [here](agents-general.md).

![Cloudify Manager Architecture](/guide/images3/architecture/cloudify_flows.png)


### Plugins
Plugins are python facades for any third party tool you want to use with any Cloudify workflow. Notable examples are plugins for IaaS API's, plugins for Configuration Management tools and even plugins for installation and configuration of monitoring agents.

The plugin has methods that correspond to Node Interface Operations. These methods are decorated with the `@operation` decorator and get the `context` argument that holds handlers to node runtime properties, the plugin logger, and in case of a relationship task, to the other Node in the relationship.



### Logs and Events
Cloudify offers logs & events as the main troubleshooting and tracing tools:

* **Events** - Cloudify reports user facing events for any step in the workflow and task execution. The events are in JSON format and have all the relevant context included.

* **Logs** - Cloudify has a logger that enriches log entries with all relevant context information.

These can later be used to perform manual and automated past and predictive analysis of system states and outages.

### Log & Event gathering mechanism
Cloudify has a built-in mechanism for log & events shipping, indexing and storage.
This mechanism is currently only used for Cloudify's logs and events but will be extended to support application related information later on. The mechanism is composed of [RabbitMQ](http://www.rabbitmq.com) as the main transport and queueing component. [Logstash](http://logstash.net/), as the means to format and enrich logs (so we can format and pipe them in various formats for different integrations) and [Elasticsearch](http://www.elasticsearch.org/) as the indexing and storage mechanism.

To enjoy the benefits of this mechanism, the REST API exposes some methods to run queries on Elasticsearch and other methods for getting events and logs for a particular workflow execution.

# Cloudify Technical Scenarios

Cloudify's architecture supports the following main technical flows:

## Bootstrap
Bootstrapping is the process of installing the Cloudify [manager](#the-manager-orchestrator). It is executed via the CLI using a blueprint (called manager blueprint). This blueprint, describes the cloud resources to provision including the manager VM. The blueprint also describes the manager installation using either Deb packages or a Docker container.

## [Blueprint](reference-terminology.html#blueprint) Upload
The first step the user must take to install an application is to have the application orchestration plan (aka `blueprint`) and its related resources uploaded to the manager. This is done by using the GUI or the CLI [command](reference-cfy.html#blueprints-upload) `cfy blueprints upload`. When using the CLI, This command will pack the blueprint YAML file folder to a `tar.gz` file and upload it to the Cloudify manager REST server. Once the blueprint has been validated, it will be stored in the Cloudify manager file server (hosted by [nginx](http://nginx.org)).

## [Deployment](reference-terminology.html#deployment) Creation
In order to deploy and manage an application you need to create a runtime data model in the manager. This is where the manager keeps the state of the application. Multiple deployments can be created out of a single blueprint, but once a deployment is created it is independent of other deplyoments of the same blueprint.

To create a deployment, use the GUI or the CLI [command](reference-cfy.html#deployments-create) `cfy deployments create`.
This will create the deployment data in the manager, including the deployment's [nodes](reference-terminology.html#node) and [node-instances](reference-terminology.html#node-instance) data. Additionally, creating a deployment will execute the `deployment_environment.create` [workflow](reference-terminology.html#workflow), which will install the deployment-specific Cloudify agents on the manager and their relevant plugins. The agents installation happens in the background, but it is required to finish before other workflows may be executed for the given deployment.

## [Workflow](reference-terminology.html#workflow) Execution
Any automation process from initial setup to auto-scaling is performed by running a workflow script.
In order to execute a workflow use the GUI or the CLI [command](reference-cfy.html#deployments-execute) `cfy deployments execute`. This will create an [execution](reference-terminology.html#execution) object for the deployment in the manager and run the script.

A general diagram of a workflow's execution:

![Task Execution Example](/guide/images3/architecture/cloudify_workflow_processing.png)

The Workflow engine runs the workflow algorithm and in each step processes the selected nodes:

1. The workflow reads the node information from the database.

2. The workflow sends a command through the task broker to the agent. The command has the implementation information for the agent:
  * Which plugin to use and where to find it (URL).
  * Which function in the plugin to invoke.
  * The node's [properties](reference-terminology.html#properties).
  * The node's [runtime properties](reference-terminology.html#runtime-properties).

3. The designated agent (Manager side or Application VM side, depending on the task) gets the command from the queue

4. The agent starts executing the task by invoking a plugin function.

5. The plugin interfaces with third-party API or CLI to execute the task.

## [Deployment](reference-terminology.html#deployment) Deletion
To delete a deployment and free its resources on the manager, use the GUI or the CLI [command](reference-cfy.html#deployments-delete) `cfy deployments delete`. This will delete all of the deployment's data which is stored on the manager, including its [execution](reference-terminology.html#execution), [nodes](reference-terminology.html#node) and [node-instances](reference-terminology.html#node-instance) data.

Additionally, deleting a deployment will execute the `workers_installation.uninstall` [workflow](reference-terminology.html#workflow), which will uninstall the deployment-specific Cloudify agents from the manager. Unlike the agent installation process during Deployment Creation, The agents uninstallation process doesn't happen in the background, and it'll block until the agents have been successfully uninstalled.

{%note title=Note%}
Deployment Deletion is merely the reversed process of Deployment Creation, and as such it won't delete application VMs and/or other resources which were created by executing workflows. Deleting such resources is only possible by executing another workflow. For example, deleting resources created by the [built-in install workflow](reference-builtin-workflows.html#install) may be possible by executing the [built-in uninstall workflow](reference-builtin-workflows.html#uninstall).

Attempting to delete a deployment which has [live nodes](reference-terminology.html#live-node) will issue a warning regarding this very matter. However, it is possible to force deletion of a deployment with live nodes from both the UI and CLI.
{%endnote%}

## [Blueprint](reference-terminology.html#blueprint) Deletion
Once all deployments of a blueprint have been deleted, it's also possible to delete the blueprint itself from the manager using the UI or the CLI [command](reference-cfy.html#blueprints-delete) `cfy blueprints delete`.

## Teardown
Teardown is the reversed process for the [Bootstrap](#bootstrap) process. It is executed via the CLI using the [command](reference-cfy.html#teardown) `cfy teardown`. This command also is meant to clear any resources provisioned and installations made by the bootstrap process (e.g. delete networks, security groups, the manager VM, etc.).
