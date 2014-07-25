---
layout: bt_wiki
title: Terminology
category: Reference
publish: true
abstract: Cloudify Terms and Concepts (In a nutshell)
pageord: 11

tosca_link: https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=tosca
---

Cloudify users will come across several concepts and terms that might have different meanings in other products or systems. For your benefit we define these below:

### **Agent**
Agents are [task](#task) executors.

They may be located on either the application VM, on the manager, or elsewhere - depending on the tools and API’s they need to interface with (see [Plugins](#plugin)).

The Agents read tasks from a tasks broker and delegate them to a worker subprocess (a Plugin based Python process).

### **Application**
An Application in Cloudify means a software based business service with all of its IT components at the infrastructure, middleware and business logic levels.

### **Blueprint**
The blueprint is the orchestration plan of an [Application](#application). Cloudify blueprints are inspired by the [OASIS TOSCA]({{page.tosca_link}}) evolving standard. Essentially it is a YAML file that describes the following:

* Application topology as components and their relationships / dependencies.
* Implementation of each lifecycle event of each component (the YAML holds a mapping to plugins that implement the events).
* Configuration for each component.
* [Optional] [Workflows](#workflow) that describe the automation of different processes like installation, upgrade etc. By default the blueprint will use the workflows provided with the product.

### **Bootstrapping**
Bootstrapping is the process of installing and starting a Cloudify manager on a certain cloud provider. The bootstrapping process is initiated from the Cloudify CLI client. Typically, it uses the cloud provider's IaaS APIs to create VM’s, networks, and any other infrastructure resources that are required for the Cloudify manager to operate properly. It then installs the various packages and starts the services that form the manager.

### **Deployment**
A deployment is the plan and the state of a single [application](#application) environment and is a direct derivative of a [blueprint](#blueprint). The deployment is a model-representation of the component instances which from the application and their runtime state.

### **Event**
An Event is a broad data representation of an occurance emitted from one of Cloudify's components.
Events are generated as a result of an execution of a specific [workflow](#workflow) or any other Cloudify process.

### **Execution**
An execution is a running instance of a [workflow](#workflow) based on a particular [deployment](#deployment).
The execution has logs and [events](#event) associated with it.

### **Interface**
Interfaces set the protocol between the [Topology](#topology) and the [Workflow](#workflow) that uses it.

An Interface is a set of hooks (dabbed **Operations**) that a [Type](#type) must map to an implementation function in a plugin. Cloudify Types following the aforementioned TOSCA standard, implement, at the very least, the lifecycle interface with the following operations:

* create
* configure
* start
* stop
* delete

### **Node**
A Node is one type of component in a [topology](#topology). It is an instance of a [type](#type) with particular [properties](#properties) and dependencies on other components ([relationships](#relationship)).

For example, a node can be one type of VM with a particular image ID, HW flavor and bound to a specific security group. Each node can be materialized to any number of runtime components, depending on the number of instances to depoly sepcified in the node settings.

### **Plugin**
Plugins are extensions to the [agents](#agent) that interface with an API or a CLI in order to execute lifecycle events of a component. Plugins are written in Python.

### **Properties**
Properties are a [Node](#node)'s design-time configuration details.

Properties are expressed as a YAML dictionary in the [blueprint](#blueprint).

### **Provider**
Providers are python modules that augment the Cloudify CLI and implement the [bootstrapping](#bootstrapping) process for a specific cloud environment.

### **Relationship**
Coming soon...

### **Runtime Properties**
Runtime Properties are execution-time details of components.

Runtime Properties are saved to the database so that they can be consumed by plugins or by users.

### **Task**
Coming soon...

### **Topology**
A Topology is an [application](#application)'s graph of components and their [relationships](#relationship).

A Topology also describes the lifecycle events or other operations that each component and relationship exposes for the use in [Workflows](#workflows).

A Topology is denoted in YAML.

### **Type**
A Type is a class of an [application](#application)'s component.

For example a db_server type represents a database server.

The basic types provided with Cloudify are abstract and only serve as markers.
Derived types have their operations mapped to a particular [plugin](#plugin) that enables their materialization using some API or tool.

For example cloudify.types.openstack.server is using the nova_plugin to communicate with OpenStack's Nova API (compute API) to spawn virtual machines on OpenStack clouds.

### **Workflow**
A workflow is an automation process algorithm.

Workflows are described in Python and use dedicated API's for reading and writing a component's state, reading a component's configuration and sending [tasks](#task) for execution. Workflows are executed via Cloudify's workflow engine.
