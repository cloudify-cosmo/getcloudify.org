---
layout: bt_wiki
title: Terminology
category: Reference
publish: true
abstract: Cloudify Terms and Concepts (In a nutshell)
pageord: 100

tosca_link: https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=tosca
arch_link: overview-architecture.html
---

{% linklist h3 %}

Cloudify users will come across several concepts and terms that might have different meanings in other products or systems. For your benefit we define these below:

### **Agent**
Agents are [task](#task) executors.

They may be located on either the application VM, on the manager, or elsewhere - depending on the tools and API’s they need to interface with (see [Plugins](#plugin)).

Agents read tasks from a tasks broker and delegate them to a worker subprocess (a Plugin based Python process).

Each `deployement` has a dedicated agent on the manager known as `Deployment Agent`


### **Application**
An Application in Cloudify means a software based business service with all of its IT components at the infrastructure, middleware and business logic levels.

### **Blueprint**
A Blueprint is an orchestration plan of an [Application](#application).

Cloudify blueprints are inspired by the [OASIS TOSCA]({{page.tosca_link}}) evolving standard. Essentially it is a YAML file that describes the following:

* Application [topology](#topology) as [nodes](#node) and their relationships(#relationship) / dependencies.
* Implementation of each lifecycle event of each node (the YAML holds a mapping to plugins(#plugin) that implement the events).
* Configuration for each node.
* [Optional] [Workflows](#workflow) that describe the automation of different processes like installation, upgrade etc. By default the blueprint will use the workflows provided with the product.

### **Blueprint Resource** (Coming soon...)

### **Bootstrap**
See the definition [here]({{page.arch_link}}#bootstrap).

### **Bootstrap Context** (Coming soon...)

### **Capabilities** (Coming soon...)

### **Context Object**
The context object is an object passed to [plugin](#plugin) [operations](#operation) as an argument named `ctx` which contains the context of the operation invocation.

For example, the context contains the following information:

- Node id.
- Deployment id.
- Plugin name.
- Operation name.

and more...

In addition, the context object exposes an API for interacting with Cloudify. For example, getting a [node's](#node) [properties](#properties).

### **Execution Cancellation**

#### **Standard Cancellation** (Coming soon...)

#### **Forced Cacncellation** (Coming soon...)

### **Deployment**
A deployment is the plan and the state of a single [application](#application) environment and is a direct derivative of a [blueprint](#blueprint).

Deployments are model-representations of [node](#node) instances (which form applications) and their runtime [state](#node-instance-state).

### **Event**
An Event is a JSON representation of an occurance in Cloudify's environment.

Events are emitted from one of Cloudify's [nodes](#node) and are generated as a result of an execution of a specific [workflow](#workflow) or any other Cloudify process.

Events are generated (from [plugins](#plugin) or Cloudify's core code) by using the `ctx.logger` context object(#context-object).

### **Execution**
An Execution is a running instance of a [workflow](#workflow) and is based on a particular [deployment](#deployment).

An Execution (unlike a [deployment](#deployment) or a [blueprint](#blueprint) has logs and [events](#event) associated with it.

### **Host node**
A node in the blueprint that represents a type of host whether it's a virtual or physical server.

### **Interface**
Interfaces set the protocol between the [Topology](#topology) and the [Workflow](#workflow) that uses it.

More elaborately, An Interface is a set of hooks (dabbed **Operations**) that a [Type](#type) must map to an implementation function in a [plugin](#plugin). Cloudify Types following the aforementioned TOSCA standard, implement, at the very least, the lifecycle interfaces with the following operations:

* create
* configure
* start
* stop
* delete

### **Live node**
A node instance(#node-instance) which is not in either the `uninitialized` or `deleted` states(#node-instance-state).

### **Manager**
See the definition [here]({{page.arch_link}}#the-manager-orchestrator).

### **Node**
A Node is one type of component in a [topology](#topology).

It is an instance of a [type](#type) with particular [properties](#properties) and dependencies on other components' ([relationships](#relationship)).

For example, a node can be one type of a VM with a particular image ID, HW flavor and bound to a specific security group. Each node can be materialized to any number of runtime components, depending on the number of instances to deploy sepcified in the node settings.

### **Node Instance**
A node instance is a runtime representation of a [node](#node).

Node instances carry [runtime properties](#runtime-properties) and a [state](#node-instance-state).
The number of instances is derived from the property set in a node's configuration in the [blueprint](#blueprint).

### **Node Instance State**
Every node instance(#node-instance) can have one of the following states:

- `uninitialized` - The node instance hasn't been initialized.
- `created` - The node instance has been created.
- `started` - The node instance has been started.
- `stopped` - The node instance has been stopped.
- `deleted` - The node instance has been deleted.


### **Operation**
An operation is a [node](#node) or a [relationship](#relationship) lifecycle event that is triggered by the [workflow](#workflow).

The operation's names are defined by an [interface](#interface) and a type that implements this interface maps these operations into plugin functions with the implementation logic.

### **Plugin**
Plugins are extensions to the [agents](#agent).

Plugins interface with an API or a CLI in order to execute lifecycle events of a [node](#node). Plugins are written in Python.

### **Policy** (Coming soon...)

### **Policy Engine**
See the definition [here]({{page.arch_link}}#policy-engine).

### **Properties**
Properties are a [node](#node)'s design-time configuration details.

Properties are expressed as a YAML dictionary in the [blueprint](#blueprint).

### **Provider**
Providers are python modules that augment the Cloudify CLI and implement the [bootstrapping](#bootstrapping) process for a specific cloud environment.

### **Provider configuration file**
A YAML file with the configurations for creating a Cloudify manager on a specific Cloud.

The provider configuration file has configuration properties for the some of the following items:
* Cloud credentials and API endpoint
* Network settings
* Manager virtual machine OS and hardware
* SSH credentials for the manager VM
* Cloudify packages to use in oreder to install the manager

### **Provider Context**
Details of the [provider's](#provider) manager environment such as the name of the management network.

The provider context is available in any [plugin](#plugin) function in case the plugin code needs such information in order to perform tasks such as agent configuration or VM configuration (as Cloudify needs each VM to be connected also to the management network ifplugin it has an agent installed on it.)

### **Relationship**
Relationships are [types](#type) that describe the nature of dependency between [nodes](#node) and the logic, if required, to glue nodes together.

For example, a relationship can be of type `cloudify.types.contained_in`. That means that node `X` is hosted within node `Y` and therefore can't be created until node `Y` is created and running.

Another example is an Apache server that's connected to MySQL. In this case, Apache needs to be configured at runtime to connect to MySQL. Waiting for MySQL to be up and running won't suffice in this case. The relationship needs to map relationship [operations](#operation) to [plugin](#plugin) functions that execute the connection's configuration.

### **Relationship implementation** (Coming soon...)

### **Relationship instance**
An instance of a [relationship](#relationship) between 2 concrete [node instances](#node-instance).

### **Relationship type**
A [relationship](#relationship) [type](#type) describes the nature of dependency between 2 [nodes](#node) and the logic to materialize it (through [operations](#operation) mapping to implementation).

A relationship is always between a source node and a target node and do it can have implementation logic to run on either or both.

There are 3 basic relationship types:

* depends_on - a base type for all relationships. It means the orchestrator must wait for the target node
* contained_in - the source node is installed within the target node
* connected_to - the source node has a connection to configure to the target node

### **Runtime Data**
The data model of the [deployements](#deployment) stored in Cloudify's database.

Cloudify holds a data model per [application](#application) deployment. This data model contains the [node instances](#node-instance), with each instance storing its unique instance id as well as copy of the [blueprint's](#blueprint) original configuration for this node and [runtime properties](#runtime-properties) for this node instance.

### **Runtime Properties**
Runtime Properties are execution-time details of [node instances](#node-instance).

Runtime Properties are saved to the database so that they can be consumed by [plugins](#plugin) or by users.
Unlike [node](#node) [properties](#properties), which are explicitly specified in the [blueprint](#blueprint), runtime properties are only set during runtime by Cloudify or its plugins.

### **Task**
A Task is the execution of one [operation](#operation) in a [plugin](#plugin) with a given set of arguments.

The arguments describe the context of the execution including [node](#node) [properties](#properties) and [node instance](#node-instance) [runtime properties](#runtime-properties).

### **Task Broker**
See the definition [here]({{page.arch_link}}#task-broker).

### **Teardown**
See the definition [here]({{page.arch_link}}#teardown).

### **Topology**
A Topology is an [application](#application)'s graph of [nodes](#node) and their [relationships](#relationship).

A Topology also describes the lifecycle events or other [operations](#operation) that each node and relationship exposes for the use in [workflows](#workflows).

A Topology is denoted in YAML.

### **Type**
A Type is a class of an [application](#application)'s [node](#node).

For example a `db_server` type represents a database server.

The basic types provided with Cloudify are abstract and only serve as markers.
Derived types have their operations mapped to a particular [plugin](#plugin) that enables their materialization using some API or tool.

For example, `cloudify.types.openstack.server` is using the nova_plugin to communicate with OpenStack's Nova API (compute API) to spawn virtual machines on OpenStack clouds.

### **Type Hierarchy**
The inheritence chain of a [type](#type) or a [relationship](#relationship).

Cloudify [blueprints](#blueprint) use Object Oriented methaphore of inheritence so any concrete Type or relationship is derived from more basic type either with implementation that needs to be refined or without any operation implmentation.

### **Type Implementation** (Coming soon...)

### **Workflow**
A workflow is an automation process algorithm.

Workflows are described in Python and use dedicated API's for reading and writing a [node's](#node) state, reading a node's configuration and sending [tasks](#task) for execution. Workflows are executed via Cloudify's workflow engine.

### **Workflow Engine**
See the definition [here]({{page.arch_link}}#workflow-engine).
