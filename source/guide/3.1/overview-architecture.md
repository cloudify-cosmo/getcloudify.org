---
layout: bt_wiki
title: Architecture Overview
category: Product Overview
publish: true
abstract: Explains the architecture and flow of Cloudify 3.0 the DevOps Orchestrator
pageord: 100

terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Architecture
Cloudify 3.0 has a new architecture and a new code base. Cloudify 3.0 is composed of the following main parts:

* **CLI client**
* **Manager (Orchestrator)**
* **Agents**

## The CLI client

The CLI client is an executable (written in Python and packaged with python and any relevant dependencies in an executable).
The CLI can run on Windows, Linux and Mac OS. The CLI provides 2 main functions:

* **Manager Bootstrapping[(?)]({{page.terminology_link}}#bootstrapping)**  - This is of course an optional functionality as you may install the manager with your preferred tool.

* **Managing Applications[(?)]({{page.terminology_link}}#application)** - The CLI serves as a REST client versus the Cloudify manager REST interface. It provides the user with the full set of functions for deploying & managing applications including log/event browsing.

![Cloudify components]({{ site.baseurl }}/guide/images3/architecture/Cloudify_Stack.png)

Fig.1 - Cloudify Stack (CLI, Manager, Agents)


## The Manager (Orchestrator)
The Cloudify Manager is a stateful orchestrator that deploys and manages applications decribed in orchestration plans called [blueprints](#blueprint). The manager's main responsibility is to run automation processes described in workflow[(?)]({{page.terminology_link}}#workflow) scripts and issue execution commands to the agents[(?)]({{page.terminology_link}}#agent). The manager's flows and components are discussed in detail below.

## The Agents
The Cloudify Agents[(?)]({{page.terminology_link}}#agent) are responsible for managing the manager's command execution using a set of plugins[(?)]({{page.terminology_link}}#plugin).
There is a manager side agent per application[(?)]({{page.terminology_link}}#application) deployment[(?)]({{page.terminology_link}}#deployment) and optional agent on each application VM.

**The manager side agents** handle IaaS related tasks[(?)]({{page.terminology_link}}#task) (e.g. creating a VM or a Network, binding a floating IP to a VM). Manager side agents can also be used with other tools such as [Fabric](http://www.fabfile.org/) or REST to remotely execute tasks.

**The application side agents** are optionally located on application VM's. The user can state in the blueprint[(?)]({{page.terminology_link}}#blueprint) which VM's will have an agent installed on them. The application side agents are installed by the manager side agent as part of the VM creation task. Once running, the application side agent can install plugins and execute tasks locally. Typical tasks will be middleware installaton and configuration and application modules deployment.

![Cloudify Manager Architecture]({{ site.baseurl }}/guide/images3/architecture/cloudify_flows.png)

Fig.2 - Cloudify Flows

## Cloudify Manager Components


### Proxy and File Server

Cloudify uses [Nginx](http://nginx.org/) as its frontend reverse proxy and file server (In later versions it will also be used for security related features.)

### REST API

Cloudify is controlled via a REST API. The REST API covers all the Cloud Orchestration and Management functions. See [Cloudify REST API Documentation](http://getcloudify.org/guide/3.1/rest-api/index.html).
You can use the REST API through Cloudify's Non-interactive CLI or write your own REST client.

Cloudify REST controllers are written in python using the [flask framework](http://flask.pocoo.org/) and run behind a [gUnicorn container](http://gunicorn.org/)



### Web GUI
Cloudify's Web GUI works vs. the REST API but adds additional value and visibility.

The GUI has the following screens:

* Blueprints[(?)]({{page.terminology_link}}#blueprint) screen - a catalog of all uploaded blueprints
* Blueprint Specific Screen - a set of views for a particular blueprint including:
    * Blueprint Topology[(?)]({{page.terminology_link}}#topology)
    * Blueprint Network Topology
    * Blueprint Node list
    * Blueprint Source
* Deployments screen
* Deployment Topology screen
* Deployment Network Topology screen
* Deployment Events[(?)]({{page.terminology_link}}#event) screen
* Deployment Performance Metrics screen


### Workflow Engine

Cloudify uses a Workflow engine to allow for any automation process through built-in and custom workflows[(?)]({{page.terminology_link}}#workflow).
The Workflow engine is responsible for timing and orchestrating tasks for creating / manipulating the application[(?)]({{page.terminology_link}}#application) components. To achieve that the workflow engine interacts with the Blueprint and runtime data to get the properties[(?)]({{page.terminology_link}}#properties) and plugin[(?)]({{page.terminology_link}}#plugin) information and writes tasks[(?)]({{page.terminology_link}}#task) to the task broker.
Cloudify's workflow engine is built on top of [Celery tasks broker](http://www.celeryproject.org/). The user can write custom workflows in Python using API's that provide access to the topology[(?)]({{page.terminology_link}}#topology) components and allow for steps execution and state[(?)]({{page.terminology_link}}#node-instance-state) reporting.

### Runtime Model

Cloudify uses [Elasticsearch](http://www.elasticsearch.org/) as its data store for deployment[(?)]({{page.terminology_link}}#deployment) state. The deployment model and runtime data[(?)]({{page.terminology_link}}#runtime-data) are stored as JSON documents.


### Metrics Database


Cloudify uses [InfluxDB](http://influxdb.com/) as the monitoring metrics repository. Influx provides flexible schema for metrics and metrics metadata as well as a query language. Cloudify stores every metric reported by a monitoring tool into influxdb and define time based aggregations as well as statistic calculations.


### Policy Engine

Cloudify offers a policy engine[(?)]({{page.terminology_link}}#policy-engine) that runs custom policies[(?)]({{page.terminology_link}}#policy) in order to make runtime decisions about availability, SLA, etc. For example, during installation, the policy engine consumes streams of events coming from monitoring probes or tools. The policy engine analyzes these streams to decide if a specific node[(?)]({{page.terminology_link}}#node) is up and running and provides the required functionality. The results of such "start detection" policies are fed into the runtime model.

Cloudify uses [Riemann.IO CEP](http://riemann.io/) as the core of the policy engine component. A Cloudify user doesn't need to access or config Riemann directly. The Policies are registered, activated, deactivated and deleted by the Workflow Engine as part of the orchestration process.



The policies are written in [Clojure](http://clojure.org/). Riemann offers many [built in functions for analyzing monitoring information](http://riemann.io/api.html).
Cloudify offers policy examples for the common use cases.


### Task Broker

Cloudify uses [Celery](http://www.celeryproject.org/) with a [RabbitMQ](http://www.rabbitmq.com/) message bus to manage task[(?)]({{page.terminology_link}}#task) distribution and execution.
Cloudify tasks contain:
* the blueprint[(?)]({{page.terminology_link}}#blueprint) and runtime properties[(?)]({{page.arch_link}}#runtime-properties) (if applicable) of the relevant node[(?)]({{page.arch_link}}#node);
* the plugin[(?)]({{page.arch_link}}#plugin) (name and URL) that will execute the task;
* the operation name the plugin needs to execute.

Cloudify agents[(?)]({{page.arch_link}}#agent) that are based on Celery workers listen to the RabbitMQ queues to obtain tasks they need to execute (see more information below). Once a message arrives, they invoke the task and report back.


### Tasks
A Task is the execution of one function in a [plugin](#plugin) with a given set of arguments.

The arguments describe the context of the execution including [node](#node) [properties](#properties) and [Runtime Properties](#runtime-properties).

### Agents

Cloudify agents are based on [Celery](http://www.celeryproject.org/) daemons & workers. An agent can be located remote to the Node it manipulates (by default on the Cloudify Manager VM) or collocated on the same host. Manager side agents are one (by default) or more per deployment.
Cloudify manager side agents are used typically to execute IaaS API invocation tasks (such as host creation) and other remote tasks (such as agent installation using SSH on new application hosts).

Cloudify agents perform the following:

* **Plugin Installation** - The agent gets instructions about the plugins it should use and loads them. Plugins can be added dynamically at runtime.

* **Operation Execution** - The agents get tasks from the workflow engine that are instructions for Operation (method) execution on a specific plugin. The agent assigns one of its workers to handle the task.


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

![Task Execution Example]({{ site.baseurl }}/guide/images3/architecture/cloudify_workflow_processing.png)

Fig.3 - Cloudify Workflow Processing

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
Teardown is the reversed process for the [Bootstrap](#bootstrap) process. It is executed via the CLI using the [command](reference-cfy.html#teardown) `cfy teardown`. This command also uses the help of [Providers](reference-terminology.html#provider), and is meant to clear any resources provisioned and installations made by the bootstrap process (e.g. delete networks, security groups, the manager VM, etc.).
