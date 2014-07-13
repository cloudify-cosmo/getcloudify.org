---
layout: bt_wiki
title: Cloudify 3.0 Architecture
category: Product Overview 
publish: true
abstract: Explains the architecture and flow of Cloudify 3.0 the DevOps Orchestrator
pageord: 100
---
{%summary%} {{page.abstract}}{%endsummary%}

# What is Cloudify?

Cloudify is a Cloud Application Orchestrator. It automates any process you need to perform with regard to your applications over any cloud. Starting with environment setup and application installation, going forward to application upgrade, infrastructure upgrade, continuous deployments, auto-healing and auto-scaling.

Cloudify can work on any environment: IaaS, virtualized or even non-virtualized. Cloudify executes automation processes using any tool you choose. From shell to chef, puppet, etc. Cloudify monitors your application with any monitoring tool you choose; installing it for you if you like and interfacing with your monitoring tools to get events and metrics into Cloudify's Policy Engine

# Architecture
Cloudify 3.0 has a new architecture and a new code base. Cloudify 3.0 is composed of the following main parts:

* **CLI client**
* **Manager (Orchestrator)**
* **Agents**

## The CLI client

The CLI client is an executable (written in Python and packaged with python and any relevant dependencies in an executable).
The CLI can run on Windows, Linux and Mac OS. The CLI provides 2 main functions:

* **Manager Bootstrapping**  - The CLI has components named "Providers" that are responsible for using a particular IaaS API in order to setup the networking, security and VM environment required for Cloudify's manager and installing the manager (using the manager packages). This is of course an optional functionality as you may install the manager with your preferred tool.

* **Managing Applications** - The CLI serves as a REST client versus the Cloudify manager REST interface. It provides the user with the full set of functions for deploying & managing applications including log/event browsing.

## The Manager (Orchestrator)
The Cloudify Manager is a stateful orchestrator that deploys and manages applications decribed in orchestration plans called `blueprints`. The manager's main responsibility is to run automation processes described in workflow scripts and issue execution commands to the agents. The manager's flows and components are discussed in detail below.

## The Agents
The Cloudify Agents are responsible for managing the manager's command execution using a set of plugins.
There is a manager side agent per application deployment and optional agent on each application VM.

**The manager side agents** handle IaaS related tasks (e.g. creating a VM or a Network, binding a floating IP to a VM). Manager side agents can also be used with other tools such as [Fabric](http://www.fabfile.org/) or REST to remotely execute tasks.

**The application side agents** are optionally located on application VM's. The user can state in the `blueprint` which VM's will have an agent installed on them. The application side agents are installed by the manager side agent as part of the VM creation task. Once running, the application side agent can install plugins and execute tasks locally. Typical tasks will be middleware installaton and configuration and application modules deployment.

![Cloudify Manager Architecture](images/architecture/complete_flow.png)

## Cloudify Manager Components


![Cloudify Manager Architecture](images/architecture/manager_components.png)

### Proxy and File Server

Cloudify uses [Ngnix](http://nginx.org/) as its frontend reverse proxy and file server (In later versions in will also be used for security related features.)

### REST API

Cloudify is controlled via a REST API. The REST API covers all the Cloud Orchestration and Management functions. See [Cloudify REST API Documentation](http://www.cloudifysource.org/cosmo-rest-docs/).
You can use the REST API through Cloudify's Non-interactive CLI or write your own REST client.

Cloudify REST controllers are written in python using the [flask framework](http://flask.pocoo.org/) and run behind a [GUnicorn container](http://gunicorn.org/)



### Web GUI
Cloudify's Web GUI works vs. the REST API but adds additional value and visibility.

The GUI has the following screens:

* Blueprints screen - a catalog of all uploaded blueprints
* Blueprint Specific Screen - a set of views for a particular blueprint including:
    * Blueprint Topology
    * Blueprint Network Topology
    * Blueprint Node list
    * Blueprint Source
* Deployments screen
* Deployment Topology screen
* Deployment Network Topology screen
* Deployment Events screen
* Deployment Performance Metrics screen


### Workflow Engine

Cloudify uses a Workflow engine to allow for any automation process through built-in and custom workflows.
The Workflow engine is responsible for timing and orchestrating tasks for creating / manipulating the application components. To achieve that the worflow engine interacts with the Blueprint and runtime data to get the properties and plugin information and writes tasks to the task broker.
Cloudify's workflow engine is build on top of [Celery tasks broker](http://www.celeryproject.org/). The user can write the custom workflow in Python using API's that provide access to the topology components and allow for steps execution and state reporting.

### Runtime Model

Cloudify uses [Elasticsearch](http://http://www.elasticsearch.org/) as its data store for deployment state. The deployment model and runtime data are stored as JSON documents. The runtime model includes the following information:


<!-- ## <a name="Metrics Database">Metrics Database</a> -->

<!--
Cloudify uses [InfluxDB](http://influxdb.com/) as the monitoring metrics repository. Influx provides flexible schema for metrics and metrics metadata as well as a query language. Cloudify stores every metric reported by a monitoring tool into influxdb and define time based aggregations as well as statistic calculations.

-->


## Policy Engine

Cloudify offers a policy engine that runs custom policies in order to make runtime decisions about availability, SLA, etc. For example, during installation, the policy engine consumes streams of events coming from monitoring probes or tools. The policy engine analyzes these stream to decide if a specific node is up and running and provides the required functionality. The results of such "start detection" policies are fed into the runtime model.

Cloudify uses [Riemann.IO CEP](http://riemann.io/) as the core of the policy engine component. A Cloudify user doesn't need to access or config Riemann directly. The Policies are registered, activated, deactivated and deleted by the Workflow Engine as part of the orchestration process.



<!--The policies are written in [Clojure](http://clojure.org/). Riemann offers many [built it functions for analyazing monitoring information](http://riemann.io/api.html).
Cloudify offers policy examples for the common use cases.-->


### Task Broker

Cloudify uses [Celery](http://www.celeryproject.org/) with [RabbitMQ](http://www.rabbitmq.com/) message bus to manage task distribution and execution.
Cloudify tasks contain the blueprint and runtime information (if applicable) of the relevant node, the plugin (name and URL) that will execute the task and the operation name the plugin needs to execute.

Cloudify agents that are based on Celery workers listen to the RabbitMQ queues to obtain tasks they need to execute (see more information below). Once a message arrives, they invoke the task and report back.


### Tasks
A Task is a bit of an overloaded term - it is a step in the Workflow and for Celery it means an extension to execute
In this documentation we refer to the former as a task and to the latter as a plugin (at least as the plugin python facade).

### Agents

Cloudify agents are based on [Celery](http://www.celeryproject.org/) daemons & workers. an agent can be located remote to the Node it manipulates (by default on the Cloudify Manager VM) or collocated on the same host. Manager side agents are one (by default) or more per deployment.
Cloudify manager side agents are used typically to execute IaaS API invocation tasks (such as host creation) and other remote tasks (such as agent installation using SSH on new application hosts).

Cloudify agents perform the following:

* **Plugin Installation** - The agent gets instructions about the plugins it should use and loads them. Plugins can be added dynamically at runtime.

* **Operation Execution** - The agents get tasks from the workflow engine that are instructions for Operation (method) execution on a specific plugin. The agent assigns one of its workers to handle the task.


### Plugins
Plugins are python facades for any third party tool you want to use with any Cloudify workflow. Notable examples are plugins for IaaS API's, plugins for Configuration Management tools and even plugins for installation and configuration of monitoring agents.

The plugin has methods that correspond to Node Interface Operations. These methods are decorated with the `@operation` decorator and get the `context` argument that holds handlers to node runtime properties, the plugin logger, and in case of a relationship task, to the other Node in the relationship.

![Task Execution Example](images/architecture/task_processing_example.png)

### Logs and Events
Cloudify offers logs & events as the main troubleshooting and tracing tools:

* **Events** - Cloudify reports user facing events for any step in the workflow and task execution. The events are in JSON format and have all the relevant context included.

* **Logs** - Cloudify has a logger that enriches log entries with all relevant context information.

These can later be used to perform manual and automated past and predictive analysis of system states and outages.

### Log & Event gathering mechanism
Cloudify has a built-in mechanism for log & events shipping, indexing and storage.
This mechanism is currently only used for Cloudify's logs and events but will be extended to support application related information later on. The mechanism is composed of [RabbitMQ](http://www.rabbitmq.com) as the main transport and queueing component. [Logstash](http://http://logstash.net/), as the means to format and enrich logs (so we can format and pipe them in various formats for different integrations) and [Elasticsearch](http://http://www.elasticsearch.org/) as the indexing and storage mechanism.

To enjoy the benefits of this mechanism, the REST API exposes some methods to run queries on Elasticsearch and other methods for getting events and logs for a particular workflow execution.

# Cloudify Technical Scenarios

Cloudify's architecture supports the following main technical flows:

## Bootstrap
Bootstrapping is when a user chooses to install the manager using the CLI. In this process the CLI sets up the environment needed for the manager (network, security groups and key-pairs and the manager VM). Once the manager VM is ready, the CLI uses the manager packages to install the manager components inside the manager VM.

## Blueprint Upload
The first step the user must take to install an application is to have the application orchestration plan (aka `blueprint`) uploaded to the manager and saved in its `file server`. This is done by using the GUI or the `cfy blueprints upload` command. The CLI then packs the blueprint YAML file folder to a `tar` file and uploads it through the Cloudify manager REST server. It is then stored in the Cloudify manager file server (hosted by [ngnix](ngnix.org)).

## Deploymeny Creation
In order to deploy and manage an application you need to create a runtime data model in the manager. This is where the manager keeps the state of the application. To do so simply use the GUI or the CLI command: `cfy deployments create`.

## Workflow Execution
Any automation process from initial setup to auto-scaling is performed by running a workflow script.
In order to execute a workflow use the GUI or the CLI command `add here`

Workflow execution requires the Workflow itself and a [Topology](#topology)
The Workflow engine runs the workflow algorithm and in each step processes the selected Nodes. For each node it creates a task for an agent to execute. The task has the implementation information for the agent:

* Which pluign to use and how to get it (URL).
* Which method in the plugin to invoke.
* A dictionary of the `node properties` taken from the `blueprint`.
* Runtime information about nodes on which the current node is dependent so relationships can be configured.

The designated agent (Manager Side or Application VM side depending on the task) gets the task from the queue and starts executing it. It will usually install a plugin or use an installed plugin. It will execute the task by invoking the plugin method specified in the task.



# Supported Clouds & Tools

## Clouds and Virtualization

<table>
<tr>
<th>Cloud</th>
<th>Supported APIs</th>
</tr>
<tr>
<td>OpenStack</td>
<td>
<ul>
<li>Nova</li>
<li>Neutron</li>
<li>Cinder</li>
</ul>
</td>
</tr>
<tr>
<td>Vagrant</td>
<td>Virtual Box</td>
</tr>
</table>

## DevOps Tools

<table>
<tr>
<th>Tool</th>
<th>Coverage</th>
</tr>
<tr>
<td>Chef</td>
<td>Chef client and solo</td>
</tr>
<tr>
<td>Puppet</td>
<td>Puppet Master &amp; Agent mode and stand alone mode</td>
</tr>
<tr>
<td>Bash</td>
<td>Executing bash scripts</td>
</tr>
<tr>
<td>Fabric</td>
<td> -- </td>
</tr>
</table>

