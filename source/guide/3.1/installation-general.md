---
layout: bt_wiki
title: Prerequisites
category: Installation
publish: true
abstract: How do you go about installing Cloudify?
pageord: 100

manual_install_link: installation-manual.html
terminology_link: reference-terminology.html
cli_install_link: installation-cli.html
simple_install_link: installation-simple-provider.html
agent_packager_link: agents-packager.html
---
{%summary%}{{page.abstract}}{%endsummary%}

Cloudify can be installed by using different methods.

Since it is based on a set of premade packages, it can be deployed using shell scripts, configuration management tools, cloud specific orchestration tools (CloudFormation, Heat, etc..) or Cloudify's CLI tool which provides a smooth experience for getting a fully working, CLI manageable Cloudify Management server.

# Prerequisites

## Manager Environment

### Host Machine

#### Minimal Requirements
A Cloudify manager must run on a 64-bit machine and requires at the very least 2GB of RAM, 1 CPU and 5GB of free space.

{%note title=Note%}
These are the minimal requirements for Cloudify to run. You will have to provision larger machines to actually utilize Cloudify.
{%endnote%}

#### Recommended Requirements
The recommended requirements can vary based on the following:

* Number of [deployments]({{page.terminology_link}}#deployment) you're going to run.
* Amount of concurrent logs and events you're going to send from your [hosts]({{page.terminology_link}}#host).
* Amount of concurrent metrics you're going to send from your hosts.

As a general recommendation for the average system, Cloudify would require at least 4GB of RAM and 4 CPU Cores. Disk space requirement vary according to the amount of logs, events and metrics sent as Cloudify doesn't currently clean them.

### Network
The Manager must be available in the following ports:

* Inbound - port 80 - For CLI and REST access.
* Inbound - port 22 - If [Bootstrapping]({{page.terminology_link}}#bootstrapping) is done via the CLI.
* Inbound - port 5672 - [Agent]({{page.terminology_link}}#agent) to Manager communication.
* Outbound - port 22 - If running Linux based host machines and remote agent installation is required.
* Outbound - port 5985 - If running Windows based host machines and remote agent installation is required.

## OS Distributions

### Management Server

#### If bootstrapping using packages
Cloudify's management server currently runs on Ubuntu 12.04 Precise. To install on Centos or other distributions, you must use the [Docker](https://www.docker.com/) [implementation](installation-bootstrapping.html#bootstrapping-using-docker).

#### If bootstrapping using Docker Image
Cloudify's Docker implementation was tested on Ubuntu 14.04 and Centos 6.5 and is based on the [phusion/baseimage](https://github.com/phusion/baseimage-docker) Docker Image (Ubuntu 14.04).

{%note title=Note%}
If the host machine Docker is running on is based on Ubuntu 14.04, we will attempt to install Docker for you, if it wasn't previously installed.(Requires an internet connection). For any other distribution (and release), you'll have to verify that Docker is installed prior to bootstrapping.
{%endnote%}

### Hosts
Please see [here](agents-description.html#provided-agent-packages) for the supported distributions.

Agents are provided for these OS distributions, but using the [Cloudify Agent Packager]({{page.agent_packager_link}}), you can create your own agents for your distribution.

## Docker
If you bootstrap using the Docker images, you must have Docker 1.3+ installed.

Cloudify will attempt to install Docker on Ubuntu 14.04 (Trusty) ONLY as other images may require kernel upgrades and additional package installations.


# What's Next

Next, you should [install the Cloudify CLI](installation-cli.html). Once you've installed it, you will be able to boostrap a Cloudify manager on the environment of your choice.