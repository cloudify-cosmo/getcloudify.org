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

* Application topology as components and their relationships / dependencies.
* Implementation of each lifecycle event of each component (the YAML holds a mapping to plugins that implement the events).
* Configuration for each component.
* [Optional] [Workflows](#workflow) that describe the automation of different processes like installation, upgrade etc. By default the blueprint will use the workflows provided with the product.

### **Blueprint Resource**
Coming soon...

### **Bootstrapping**
Bootstrapping is the process of installing and starting a Cloudify manager on a certain cloud provider.

The bootstrapping process is initiated from Cloudify's CLI client. Typically, it uses the cloud provider's IaaS API's to create VM’s, networks, and any other infrastructure resources that are required for the Cloudify manager to operate properly. It then installs the various packages and starts the services that form the manager. The bootstrap process is initiated by the CLI which uses [providers](#provider) to bootstrap on a specific cloud.

### **Bootstrap Context** (Coming soon...)

### **Capabilities**  (Coming soon...)

### **Context Object** (Coming soon...)

### **Execution Cancellation**

#### **Standard Cancellation** (Coming soon...)

#### **Forced Cacncellation** (Coming soon...)

### **Deployment**
A deployment is the plan and the state of a single [application](#application) environment and is a direct derivative of a [blueprint](#blueprint).

Deployments are model-representations of component instances (which form applications) and their runtime state.

### **Event**
An Event is a JSON representation of an occurance in Cloudify's environment.

Events are emitted from one of Cloudify's components and are generated as a result of an execution of a specific [workflow](#workflow) or any other Cloudify process.

### **Execution**
An Execution is a running instance of a [workflow](#workflow) and is based on a particular [deployment](#deployment).

An Execution has logs and [events](#event) associated with it.

### **Host node** (Coming soon...)

### **Interface**
Interfaces set the protocol between the [Topology](#topology) and the [Workflow](#workflow) that uses it.

More elaborately, An Interface is a set of hooks (dabbed **Operations**) that a [Type](#type) must map to an implementation function in a [plugin](#plugin). Cloudify Types following the aforementioned TOSCA standard, implement, at the very least, the lifecycle interfaces with the following operations:

* create
* configure
* start
* stop
* delete

### **Manager**
See the definition [here]({{page.arch_link}}#manager).

### **Node**
A Node is one type of component in a [topology](#topology).

It is an instance of a [type](#type) with particular [properties](#properties) and dependencies on other components ([relationships](#relationship)).

For example, a node can be one type of VM with a particular image ID, HW flavor and bound to a specific security group. Each node can be materialized to any number of runtime components, depending on the number of instances to depoly sepcified in the node settings.

### **Node Instance**
A node instance is a runtime presentation of a [node](#node).

Node instances carry [runtime properties](#runtime-properties) and a [state](#node-instance-state).
The number of instances is derived from the property set in a node's configuration in the [blueprint](#blueprint).

### **Node Instance State** (Coming soon...)

### **Operation** (Coming soon...)

### **Plugin**
Plugins are extensions to the [agents](#agent).

Plugins interface with an API or a CLI in order to execute lifecycle events of a component. Plugins are written in Python.

### **Policy** (Coming soon...)

### **Policy Engine**
See the definition [here]({{page.arch_link}}#policy-engine).

### **Properties**
Properties are a [Node](#node)'s design-time configuration details.

Properties are expressed as a YAML dictionary in the [blueprint](#blueprint).

### **Provider**
Providers are python modules that augment the Cloudify CLI and implement the [bootstrapping](#bootstrapping) process for a specific cloud environment.

### **Provider configuration file** (Coming soon...)

### **Provider Context** (Coming soon...)

### **Relationship**
Relationships are types that describe the nature of dependency between components and the logic, if required, to glue components together.

For example, a relationship can be of [type](#type) `cloudify.types.contained_in`. That means that component `X` is hosted within component `Y` and therefore can't be created until component `Y` is created and running.

Another example is an Apache server that's connected to MySQL. In this case, Apache needs to be configured at runtime to connect to MySQL. Waiting for MySQL to be up and running won't suffice in this case. The relationship needs to map relationship operations to [plugin](#plugin) functions that execute the connection's configuration.

### **Relationship implmenetation** (Coming soon...)

### **Relationship instance** (Coming soon...)

### **Relationship types** (Coming soon...)

### **Runtime Data** (Coming soon...)

### **Runtime Properties**
Runtime Properties are execution-time details of [node instances](#node-instance).

Runtime Properties are saved to the database so that they can be consumed by [plugins](#plugin) or by users.
Unlike [node](#node)'s [properties](#properties), which are explicitly specified in the [blueprint](#blueprint), runtime properties are only set during runtime by Cloudify or its plugins.

### **Task**
A Task is the execution of one function in a [plugin](#plugin) with a given set of arguments.

The arguments describe the context of the execution including [node](#node) [properties](#properties) and [node instance](#node-instance) [runtime properties](#runtime-properties).

### **Task Broker**
See the definition [here]({{page.arch_link}}#task-broker).

### **Topology**
A Topology is an [application](#application)'s graph of components and their [relationships](#relationship).

A Topology also describes the lifecycle events or other operations that each component and relationship exposes for the use in [Workflows](#workflows).

A Topology is denoted in YAML.

### **Type**
A Type is a class of an [application](#application)'s component.

For example a `db_server` type represents a database server.

The basic types provided with Cloudify are abstract and only serve as markers.
Derived types have their operations mapped to a particular [plugin](#plugin) that enables their materialization using some API or tool.

For example, `cloudify.types.openstack.server` is using the nova_plugin to communicate with OpenStack's Nova API (compute API) to spawn virtual machines on OpenStack clouds.

### **Type Hierarchy** (Coming soon...)

### **Type Implementation** (Coming soon...)

### **Workflow**
A workflow is an automation process algorithm.

Workflows are described in Python and use dedicated API's for reading and writing a component's state, reading a component's configuration and sending [tasks](#task) for execution. Workflows are executed via Cloudify's workflow engine.

### **Workflow Engine**
See the definition [here]({{page.arch_link}}#workflow-engine).
