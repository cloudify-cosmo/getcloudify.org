---
layout: bt_wiki
title: Agents Overview
category: Agents
publish: true
abstract: General description of Cloudify Agents
pageord: 200

terminology_link: reference-terminology.html
agent_packager_link: agents-packager.html

---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

Cloudify Agents are entities installed on hosts that are part of your [blueprint]({{page.terminology_link}}#blueprint).

{%note title=Note%}
Some agents are actually also installed outside the scope of a specific host, but usually you wont need to bother
with these agents.
**See the [Terminology page]({{page.terminology_link}}#agent) for a more elaborate explanation on each type of agent.**

{%endnote%}


Agents are basically a piece of software used for communicating with Cloudify's Manager.

Cloudify's agents provide a way to:

* Execute general [operations]({{page.terminology_link}}#operation). ([Deployment Agents]({{page.terminology_link}}#deployment-agent))
* Execute [operations]({{page.terminology_link}}#operation) on specific hosts. ([Host Agents]({{page.terminology_link}}#host-agent))
* Execute [workflows]({{page.terminology_link}}#workflow) on [deployments]({{page.terminology_link}}#deployment) ([Workflow Agents]({{page.terminology_link}}#workflow-agent))


# Provided Agent Packages

Cloudify comes with a set of pre-made agent packages:

* Centos Agent - Centos/REHL with Python 2.6.x (Tested on Centos 6.4/5, and REHL 7.0)
* Ubuntu Precise Agent - Ubuntu 12.04 with Python 2.7.x (Might work on Debian, but untested)
* Ubuntu Trusty Agent - Ubuntu 14.04 with Python 2.7.x (Might work on Debian, but untested)
* Windows Agent - Windows 2008+ with Python 2.7.x

# What's Next

For a more elaborate and technical explanation on agents, and how to create one, please refer to the the [Agent-Packager tool]({{page.agent_packager_link}}).