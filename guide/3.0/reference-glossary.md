---
layout: bt_wiki
title: Terminology
category: Reference
publish: true
abstract: Cloudify Terms and Concepts (In a nutshell)
pageord: 11
---

Cloudify users will come across several concepts and terms that might have different meanings in other products or systems. For your benefit we define these below:

### **Agent**
Agents are command executors that may be located on the application VM or on the manager (or elsewhere) depending on the tools and API’s they need to interface with (see plugins). The Agents are responsible for reading commands (tasks) from the task broker and delegating them to a worker subprocess as well as for reporting logs and events back to the manager.

### **Application**
Coming soon...

### **Blueprint**
The blueprint is the orchestration plan of an application. Cloudify blueprints are inspired by the OASIS TOSCA evolving standard. Essentially it is a YAML file that describes the following:

* Application topology as components and their relationships / dependencies
* Implementation of each lifecycle event of each component (the YAML holds mapping to plugins that implement the events)
* Configuration for each of the component
* [Optional] Workflows that describe the automation of different processes like installation, upgrade etc. By default the blueprint will use the workflows provided with the product

### **Bootstrapping**
Bootstrapping is the process of installing and starting a Cloudify manager on a certain cloud provider. The bootstrapping process is initiated from the Cloudify CLI client. Typically, it uses the cloud provider's IaaS APIs to create VM’s, networks, and any other infrastructure resources that are required for the Cloudify manager to operate properly. It then installs the various packages and starts the services that form the Cloudify manager.

### **Deployment**
A deployment is the plan and the state of a single application environment and is a direct derivative of a Blueprint. The deployment has a data representation for component instances of the application and their runtime state.

### **Event**
Coming soon...

### **Execution**
An execution is a running instance of a workflow on a particular deployment. The execution has logs and events associated with it.

### **Interface**
Interfaces set the protocol between the Topology and the Workflow that uses it. An Interface is a set of hooks (dabbed **Operations**) that a Type (see below) must map to an implemnetation function in a plugin. Cloudify Typs following TOSCA implement at least the lifecycel interface with the operations: create, configure, start, stop and delete

### **Node**
A Node is one type of component in a topology. It is an instance of a Type (see below) with particular configuration (properties) and dependencies on other components (relationships). For example, a node can be one type of VM with a particular image ID, HW flavor and bound to a specific security group. Each node can be materialized to any number of runtime components, depending on the number of instances to depoly sepcified in the node settings.

### **Plugin**
Plugins are extensions to the agents that interface with an API or a CLI in order to execute lifecycle events of a component. Plugins are written in Python

### **Properties**
Properties are Node design-time configuration details. They are expressed as YAML dictionary

### **Provider**
Providers are python modules that augment the Cloudify CLI and implement the bootstrapping process for a specific cloud environment.

### **Runtime Properties**
Runtime Properties are execution-time details of components saved to the database so they can be consumed by plugins or by users

### **Topology**
Coming soon...

### **Type**
A Type is a class of application components. For example a db_server type represents a database server. The basic types are abstract and only serve as markers. Derived types have their operations mapped to a particular plugin that allows their materialization using some API or tool. For example cloudify.types.openstack.server is using the nova_plugin to communicate with OpenStack Nova API (compute API) to spawn virtual machines on OpenStack clouds.

### **Workflow**
A workflow is an automation process algorithm (described in Python) using dedicated APIs for setting state, reading configuration and state of the components and sending commands for execution. Workflows are executed on the Cloudify workflow engine.
