---
layout: bt_wiki
title: How It Works
category: How it works
publish: false
abstract: Explains the architecture and flow of Cloudify 3.0 the DevOps Orchestrator
pageord: 200
--- 
{%summary%} {{page.abstract}}{%endsummary%}

# What is Cloudify?

Cloudify is a Cloud Application Orchestrator. It automates any process you need with your applications over any cloud. Starting with environment setup and application installation, going forward to application upgrade, infrastructure upgrade, continuous deployments, auto-heal and auto-scale

Cloudify can work on any environment: IaaS, virtualized or even non virtualized. Cloudify executes automation processes using any tool you choose from shell to chef, puppet etc. Cloudify monitors your application with any monitoring tool you choose; installing it for you if you like and interfacing with your monitoring tools to get events and metrics into Cloudify Policy Engine

# What are Cloudify use cases?

# Components and Flow

## Architecture Overview and flow

Cloudify 3.0 has a new architecture. The architecture is based on a central stateful orchestrator and executing agents. The orchestrator - agents communication is asynchoronouse, where the agents read their tasks from queues

In version 3.0 phase I, the orchestrator gets start detection events and stop detection events from the plugin code. In phase II, a monitoring and policy mechanism will be added
<!-- the below is for phase II -->
<!--The orchestration gets feedback from the runtime deployments through a policy engine that evaluates monitoring events and updates the state.-->

<!--The orchestrator works in 2 main flow:
* User / API driven flow - in this flow a bluprint is uploaded to the Cloudify manager and a workflow is invoked. Alternatively a workflow can be invoked on an existing deployment using the API
* Policy Driven - in this flow a Workflow is invoked by a policy without user intervention-->

![Cloudify Manager Architecture](images/architecture/complete_flow.png)



### Workflow Execution

Workflow execution requires the Workflow itslef and a [Topology](#topology)
The Workflow engine runs the worflow algorithm and in each step process the selected Nodes. For each node it creates a task that typically implements a hook in the node set of lifecycle hooks, using the concrete implementation  ([see plugins](#plugins) ) 

![Task Execution Example](images/architecture/task_processing_example.png)

## <a name="REST API">REST API & Web GUI</a>

Cloudify is controlled via REST API. The REST API covers all the Cloud Orchestration and Management functionality. See [Cloudify REST API Documentation](http://www.cloudifysource.org/cosmo-rest-docs/).
You can use the REST API through Cloudify Non-interactive CLI or write your own REST client.

Cloudify Web GUI works vs. the REST API but adds additional value and visibility.

The GUI has the following screens:
* Blueprints screen
* Blueprint Topology Screen
* Deployments screen
* Deployment Topology screen
* Deployment Network Topology screen
* Deployment Events screen
* Deployment Performance Metrics screen


## <a name="Workflow Engine">Workflow Engine</a>

Cloudify uses a Workflow engine to allow for any automation process through built-in and custom workflows.
The Workflow engine is responsible for timing and orchestrating tasks for creating / manipulating the application components. To achieve that the worflow engine interacts with the Blueprint and runtime data to get the properties and plugin information and writes tasks to the task broker.
Cloudify wroflow engine uses workflows written in a mini language called [Radial](http://ruote.rubyforge.org/definitions.html#radial)

## <a name="Runtime Model">Runtime Model</a>

Cloudify uses [Elastic Search](http://http://www.elasticsearch.org/) as its data store for deployment state. The deployment model and runtime data are stored as JSON documents. The runtime model includes the following information:


<!-- ## <a name="Metrics Database">Metrics Database</a> -->

<!-- CLoudify uses [Graphite](http://graphite.readthedocs.org/en/latest/overview.html) to persist and aggregate the application availability and performance metrics.

Cloudify users don't need to access Graphite API directly in order to consume the persisted data. Cloudify exposes all the metreics data through REST API and Web GUI.

Typically, the Graphite server is installed on a dedicated host. [You can configure the location of your graphite server during bootstrap](#) -->

<!--
## <a name="Policy Engine">Policy Engine</a> -->

<!-- Cloudify offers a policy engine that runs custom policies in order to make runtime decisions about availability, SLA, etc. For example, during installation, the policy engine consumes streams of events coming from monitoring probes or tools. The policy engine analyze these stream to decide if a specific node is up and running and provides the required functionality. The results of such "stasrt detection" policy are fed into the runtime model.

Cloudify uses [Riemann.IO CEP](http://riemann.io/) as the core of the policy engine component. Cloudify user doesn't need to acces or config Riemann directly. The Policies are registered, activated, deactivated and deleted by the Workflow Engine as part of the orchestration process.

The policies are written in [Clojure](http://clojure.org/). Riemann offers many [built it functions for analyazing monitoring information](http://riemann.io/api.html).
Cloudify offers policy examples for the common use cases. -->

## <a name="Tasks Broker">Tasks Broker</a>

Cloudify uses [Celery](http://www.celeryproject.org/) with [RabbitMQ](http://www.rabbitmq.com/) message bus to manager task distribution and execution.
Cloudify tasks contain the blueprint information and the runtime information (if applicable) of the relevant node, the plugin (name and URL) that will execute the task and the operation name this plugin need to execute.

Cloudify agents that are based on Celery workers listen to the RabbitMQ queues to obtain tasks they need to execute (see more information below). Once a message arrive, they invoke the task and report back.

## <a name="Tasks">Tasks</a>
Task is a bit overloaded term - it is a step in the Workflow and for Celery it means an extension to execute
In this documentation we refer to the former as a task and to the later as a plugin (at least as the plugin python facade)

## <a name="Agents">Agents</a>

Cloudify agents are based on celery daemons & workers. an agent can be located remote to the Node it manipulates (by default on the Cloudify Manager VM) or collocated on the same host. Manager side agents are one (by default) or more per deployment.
Cloudify manager side agents are used typically to execute IaaS API invocation tasks (such as host creation) and other remote tasks (such as agent installation using SSH on new application hosts).

Cloudify agents perform the following functionality:
* **Plugin Installation** - The agent gets instructions about the plugins it should use and load them. Plugins can be added dynamically at runtime
* **Operation Execution** - The agents get tasks from the workflow that are instruction for Operation (method) execution on a specific plugin. The agent assigns one of its workers to handle the task


## <a name="Plugins">Plugins</a>
Plugins are python facades for any third party tool you want to use with any Cloudify workflow execution. Notable examples are plugins for IaaS APIs, plugins for Configuration Management tools and even plugins for installation of monitoring agents

The plugin has methods that correspondes to Node Interface Operations. These methods are decorated with `@operation` decorator and get the `context` argument that holds handlers to node runtime properties, the plugin logger, and in case of a relationship task to the other Node in the relationship. 
## Logs and Events
Cloudify offers logs & events as the maintroubleshooting and tracing tools:
* **Events** - Cloudify report user facing events for any step in workflow and task execution. The events are in JSON format and have all the relevant context included.
* **Logs** - Cloudify has a logger that enriches log entries with all relevant context information.
### Log & Event gathering mechanism
Cloudify has built-in mechanism for log & events gathering, indexing and persisiting.
This mechanism is currently used for Cloudify logs but will be extended to support application logs later. The mechanis is composed of [RabbitMQ](http://www.rabbitmq.com) as the main transport and queueing component. [Logstash](http://http://logstash.net/), as the means to format and enrich logs (so we can format and pipe them in various formats for different integrations) and [Elastic Search](http://http://www.elasticsearch.org/) as the log and events indexing mechanism

To enjoy the benefits of this mechanism, the REST API exposes some methods to run queries on Elastic Search and other methods for getting events and logs for a particular workflow execution.

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
<td>Chef client</td>
</tr>
<tr>
<td>Puppet</td>
<td>Puppet Master &amp; Agent mode</td>
</tr>
<tr>
<td>Fabric</td>
<td> -- </td>
</tr>
</table>
