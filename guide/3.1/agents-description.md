---
layout: bt_wiki
title: Agents Overview
category: Agents
publish: true
abstract: General description of Cloudify Agents
pageord: 200

terminology_link: reference-terminology.html
agent_packager_link: agents-packager.html
celery_link: http://www.celeryproject.org/
rest_client_api_link: reference-rest-client-api.html
plugins_common_api_link: reference-plugins-common-api.html
diamond_plugin_link: plugin-diamond.html
script_plugin_link: plugin-script.html
linux_agent_installer_link: plugin-linux-agent-installer.html
windows_agent_installer_link: plugin-windows-agent-installer.html
plugin_installer_link: plugin-installer-plugin.html
---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

Cloudify's agent provides a way to:

* Interact with [hosts]({{page.terminology_link}}#host) via [plugins]({{page.terminology_link}}#plugin)
* Execute [workflows]({{page.terminology_link}}#workflow) on [deployments]({{page.terminology_link}}#deployment)
* Install other agents

There are currently 3 types of agents:

* Deployment Agents
* Workflow Agents
* Host Agents

See the [Terminology page]({{page.terminology_link}}#agent) for a more elaborate explanation on each type of agent.

# Provided Agent Packages

Cloudify comes with a set of premade agent packages:

* Centos Agent - Centos/REHL with Python 2.6.x (Tested on Centos 6.4/5, and REHL 7.0)
* Ubuntu Precise Agent - Ubuntu 12.04 with Python 2.7.x (Might work on Debian, but untested)
* Ubuntu Trusty Agent - Ubuntu 14.04 with Python 2.7.x (Might work on Debian, but untested)
* Windows Agent - Windows 2008+ with Python 2.7.x

# Creating your own agent

Please refer to the Agent-Packager tool [documentation]({{page.agent_packager_link}}).

# Agent Modules

Some modules are mandatory for the agent to function, others, are optional.

## Core External Modules:

These are modules not developed by Cloudify that are used by the agent.

- [Celery]({{page.celery_link}}) (Mandatory)

## Core Modules:

These modules are developed by Cloudify and provide core functionality for the agent - thus, the default agents provided with Cloudify come with these preinstalled.

- [Cloudify Rest Client]({{page.rest_client_api_link}}) (Mandatory)
- [Cloudify Plugins Common]({{page.plugins_common_api_link}}) (Mandatory)
- [Cloudify Script Plugin]({{page.script_plugin_link}}) (Optional)
- [Cloudify Diamond Plugin]({{page.diamond_plugin_link}}) (Optional)

## Management Modules:

Currently, these are the base management modules required for the agent:
(In the future, some of them will be optional.)

- [Cloudify Linux Agent Installer]({{page.linux_agent_installer_link}}) (Temporarily Mandatory)
- [Cloudify Linux Plugin Installer]({{page.plugin_installer_link}}) (Temporarily Mandatory)
- [Cloudify Windows Agent Installer]({{page.windows_agent_installer_link}}) (Temporarily Mandatory)
- [Cloudify Windows Plugin Installer]({{page.plugin_installer_link}}) (Temporarily Mandatory)

## Additional modules:

Additional modules are any other modules that are added to the agent during runtime or when an agent is created via the [Agent-Packager tool]({{page.agent_packager_link}}) (e.g. [Cloudify's Fabric Plugin](plugin-fabric.html)).

Note that if you want to use the [ZeroMQ](https://github.com/zeromq/pyzmq) proxy in the [script plugin]({{page.script_plugin_link}}) you'll have to explicitly configure it in the `additional_modules` section as shown above.