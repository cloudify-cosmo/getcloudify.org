---
layout: bt_wiki
title: Agents Overview
category: Agents
publish: true
abstract: General description of Cloudify Agents
pageord: 200

terminology_link: reference-terminology.html
---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

Cloudify's Agent is basically a virtualenv with a series of modules installed in it and a few configuration files attached. The agent provides a way to interact with hosts via plugins, run workflows, install other agents and deploy applications.

There are currently 3 types of agents:

* Deployment Agents
* Workflow Agents
* Host Agents

See the [Terminology page](reference-terminology.html#agent) for a more elaborate explanation on each type of agent.

# Provided Agent Packages

Cloudify comes with a set of premade agents:

* Centos/REHL with Python 2.6 (Tested on Centos 6.3+ and REHL 7.0)
* Ubuntu with Python 2.7 (Might work on debian, but not tested)
* Windows 2008+ with Python 2.7

Cloudify's agent is originally supplied with 3 additional files:

- a disable requiretty script - a script which disables the requiretty option in the shell.
- a template for celery's config file.
- a template for celery's init file.

# Creating your own agent

Please refer to the [Agent-Packager tool](agnet-packager.html) documentation.

# Agent Modules

Some modules are mandatory for the agent to funciton, others, are optional.

## Core External Modules:

These are modules not developed by Cloudify that are used by the agent.

- [Celery](http://www.celeryproject.org/) (Mandatory)

## Core Modules:

These modules are developed by Cloudify and provide core functionality for the agent - thus, the default agents provided with Cloudify come with these preinstalled.

- [Cloudify Rest Client](https://github.com/cloudify-cosmo/cloudify-rest-client) (Mandatory)
- [Cloudify Plugins Common](https://github.com/cloudify-cosmo/cloudify-plugins-common) (Mandatory)
- [Cloudify Script Plugin](https://github.com/cloudify-cosmo/cloudify-script-plugin) (Optional)
- [Cloudify Diamond Plugin](https://github.com/cloudify-cosmo/cloudify-diamond-plugin) (Optional)

## Management Modules:

Currently, these are the base management modules required for the agent:
(In the future, some of them will be optional.)

- [Cloudify Linux Agent Installer](plugin-linux-agent-installer.html) (Temporarily Mandatory)
- [Cloudify Linux Plugin Installer](plugin-installer-plugin.html) (Temporarily Mandatory)
- [Cloudify Windows Agent Installer](plugin-windows-agent-installer.html) (Temporarily Mandatory)
- [Cloudify Windows Plugin Installer](plugin-installer-plugin.html) (Temporarily Mandatory)

## Additional modules:

Additional modules are any other modules that are added to the agent during runtime or when an agent is created via the [Agent-Packager tool](agnet-packager.html) (e.g. [Cloudify's Fabric Plugin](plugin-fabric.html)).

Note that if you want to use the [ZeroMQ](https://github.com/zeromq/pyzmq) proxy in the [script plugin](plugin-script.html) you'll have to explicitly configure it in the `additional_modules` section as shown above.