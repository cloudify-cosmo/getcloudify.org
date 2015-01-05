---
layout: bt_wiki
title: Cloudify Agent Module
category: Agents
publish: true
abstract: Description of the `cloudify-agent` module
pageord: 220

virtualenv_link: http://virtualenv.readthedocs.org/en/latest/virtualenv.html
terminology_link: reference-terminology.html
celery_link: http://www.celeryproject.org/
rest_client_api_link: reference-rest-client-api.html
plugins_common_api_link: reference-plugins-common-api.html
diamond_plugin_link: plugin-diamond.html
script_plugin_link: plugin-script.html
linux_agent_installer_link: plugin-linux-agent-installer.html
windows_agent_installer_link: plugin-windows-agent-installer.html
plugin_installer_link: plugin-installer-plugin.html
cloudify_agent_link: agents-cloudify-agent-module.html
agent_packager_link: agents-packager.html

---
{%summary%}{{page.abstract}}{%endsummary%}

{%note title=Note%}
This is currently relevant to Linux based agents only!
{%endnote%}

# Overview

Cloudify's agent is based upon a Python module called `cloudify-agent`.

This module provides the functionality and configuration files required to run Cloudify's agent:

* A CLI tool called `cfy-agent` allowing you to run the agent with different parameters.
* The logic for installing the agent as a service on the machine you're running in.

# Agent Installation

The flow Cloudify implements for installing an agent using the [agent-installer]({{page.linux_agent_installer_link}}) is as follows:

* The agent's tarfile will be copied to the destination host.
* The agent installer will:
    * Extract the tar on the destination host.
    * Execute the `cfy-agent` CLI tool with the relevant parameters.
* The `cfy-agent` CLI tool will then install itself as a service by:
    * Generating the necessary celery configuration file.
    * Copying the required files for the relevant process manager to install itself as a service.

# Agent Configuration Files

Cloudify's agent is originally supplied with 2 additional files (as a part of the `cloudify-agent` module):

- a disable requiretty script.
- a celery init file (for init.d).

{%note title=Note%}
Additional process managers might be added in the future (e.g. Upstart, Runit, Supervisord, etc..)
{%endnote%}

{%note title=Note%}
These files will not necessarily work on all distributions/releases and you might provide your own when creating an agent using our [agent-packager]({{page.agent_packager_link}}).
{%endnote%}