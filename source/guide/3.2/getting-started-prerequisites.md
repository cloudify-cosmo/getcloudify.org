---
layout: bt_wiki
title: Prerequisites for Bootstrapping
category: Getting Started
publish: true
abstract: How do you go about installing Cloudify?
pageord: 150

manual_install_link: installation-manual.html
terminology_link: reference-terminology.html
cli_install_link: installation-cli.html
simple_install_link: installation-simple-provider.html
agent_packager_link: agents-packager.html
---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

Cloudify can be installed using different methods.

Since it is based on a set of premade Docker images, it can be deployed using shell scripts, configuration management tools, cloud specific orchestration tools (CloudFormation, Heat, etc..) or Cloudify's CLI tool which provides a smooth experience for getting a fully working, CLI-manageable Cloudify Management Environment.

Cloudify has a set of prerequisites, from both an infrastructure and an OS point of view.

Not to worry though, Cloudify's CLI along with Cloudify's [manager-blueprints](https://github.com/cloudify-cosmo/cloudify-manager-blueprints) will create the environment for you on your chosen cloud while allowing you to configure it as you see fit.


# Prerequisites

## Manager Environment

### Host Machine

#### Minimal Requirements

A Cloudify manager must run on a 64-bit machine and requires at the very least 2GB of RAM, 1 CPU and 5GB of free space.

{%note title=Note%}
These are the minimal requirements for Cloudify to run. You will have to provision larger machines to actually utilize Cloudify.
We do not recommend running Cloudify with even one application on a minimally provisioned machine.
{%endnote%}

#### Recommended Requirements

The recommended requirements can vary based on the following:

* Number of [deployments]({{page.terminology_link}}#deployment) you're going to run.
* Amount of concurrent logs and events you're going to send from your [hosts]({{page.terminology_link}}#host).
* Amount of concurrent metrics you're going to send from your hosts.

As a general recommendation for the average system, Cloudify would require at least 8GB of RAM and 4 CPU Cores. Disk space requirements varies according to the amount of logs, events and metrics sent as Cloudify doesn't currently clean or rotate them.

### Network

The Manager must be accessible via the following ports:

* Inbound - port 80 - For REST API and UI access.
* Inbound - port 443 - For REST API and UI access (when using SSL).
* Inbound - port 22 - If [Bootstrapping]({{page.terminology_link}}#bootstrapping) is done via the CLI.
* Inbound - port 5672 - [Agent]({{page.terminology_link}}#agent) to Manager communication.
* Inbound - port 53229 - For fileserver access.
* Outbound - port 22 - If running Linux based host machines and remote agent installation is required.
* Outbound - port 5985 - If running Windows based host machines and remote agent installation is required.

## OS Distributions

### Management Server

Cloudify's Docker implementation was tested on Ubuntu 14.04 and Centos 7.0 and is based on the [phusion/baseimage](https://github.com/phusion/baseimage-docker) Docker Image (Ubuntu 14.04).

{%note title=Note%}
If the host machine Docker is running on is based on Ubuntu 14.04, we will attempt to install Docker for you (if it isn't already installed. This requires an internet connection). For any other distribution (and release), you'll have to verify that Docker is installed prior to bootstrapping.
{%endnote%}

### Hosts

Please see [here](agents-general.html#provided-agent-packages) for the supported distributions.

Agents are provided for these OS distributions, but using the [Cloudify Agent Packager]({{page.agent_packager_link}}), you can create you own agents for your distribution.

## Docker

As Cloudify's management environment runs above Docker containers, Docker 1.3+ is required.


# What's Next

Next, you should [bootstrap](getting-started-bootstrapping.html) a Cloudify management environment on the cloud provider of your choice.
