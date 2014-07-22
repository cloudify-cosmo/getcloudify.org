---
layout: bt_wiki
title: Glossary
category: Reference
publish: true
abstract: Cloudify Terms and Concepts (In a nutshell)
pageord: 11
---
{%summary%}{{page.abstract}}{%endsummary%}

Cloudify users will come across several concepts and terms that might have different meanings in other products or systems. For your benefit we define these below:

# **Agents**
Agents are command executors that may be located on the application VM or on the manager (or elsewhere) depending on the tools and API’s they need to interface with (see plugins). The Agents are responsible for reading commands (tasks) from the task broker and delegating them to a worker subprocess as well as for reporting logs and events back to the manager.

# **Blueprints**
The blueprint is the orchestration plan of an application. Cloudify blueprints are inspired by the OASIS TOSCA evolving standard. Essentially it is a YAML file that describes the following:

* Application topology as components and their relationships / dependencies
* Implementation of each lifecycle event of each component (the YAML holds mapping to plugins that implement the events)
* Configuration for each of the component
* [Optional] Workflows that describe the automation of different processes like installation, upgrade etc. By default the blueprint will use the workflows provided with the product

# **Bootstrapping**
Bootstrapping is the process of installing and starting a Cloudify manager on a certain cloud provider. The bootstrapping process is initiated from the Cloudify CLI client. Typically, it uses the cloud provider's IaaS APIs to create VM’s, networks, and any other infrastructure resources that are required for the Cloudify manager to operate properly. It then installs the various packages and starts the services that form the Cloudify manager.

# **Deployments**
A deployment is the plan and the state of a single application environment and is a direct derivative of a Blueprint. The deployment has a data representation for component instances of the application and their runtime state.

# **Executions**
An execution is a running instance of a workflow on a particular deployment. The execution has logs and events associated with it.

# **Plugins**
Plugins are extensions to the agents that interface with an API or a CLI in order to execute lifecycle events of a component.

# **Providers**
Providers are python modules that augment the Cloudify CLI and implement the bootstrapping process for a specific cloud environment.

# **Workflows**
A workflow is an automation process algorithm (described in Python) using dedicated APIs for setting state, reading configuration and state of the components and sending commands for execution. Workflows are executed on the Cloudify workflow engine.
