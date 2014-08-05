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
---
{%summary%}{{page.abstract}}{%endsummary%}

Cloudify can be installed by using different methods.

Since it is based on a set of premade packages, it can be deployed using shell scripts, configuration management tools, cloud specific orchestration tools (CloudFormation, Heat, etc..) or Cloudify's CLI tool which provides a smooth experience for getting a fully working, cli manageable Cloudify Management server.

# Prerequisites

## Manager Environment

### Host Machine
A Cloudify manager requires at the very least 2GB of RAM, 1 CPU and 5GB of free space.

{%note title=Note%}
these are the very basic requirements. You will have to provision larger machines for larger deployments.
{%endnote%}

### Network
The Manager must be available in the following ports:

* Inbound - port 80 - For CLI and REST access.
* Inbound - port 22 - If [Bootstrapping]({{page.terminology_link}}#bootstrapping) is done via the CLI.
* Inbound - port 5672 - [Agent]({{page.terminology_link}}#agent) to Manager communication.
* Outbound - port 22 - If running Linux based host machines and remote [agent]({{page.terminology_link}}#agent) installation is required.
* Outbound - port 5985 - If running Windows based host machines and remote [agent]({{page.terminology_link}}#agent) installation is required.

## OS Distributions

### Server
Cloudify's management server currently runs on Ubuntu 12.04 Precise. We're working on newer versions of Ubuntu and Centos.
It might be able to run on Ubuntu 13.04 or 14.04, but they weren't tested. We'll appreciate feedback if you tried any other distribution.

### Agents
Cloudify's agent packages can be installed on Ubuntu 12.04+, Centos 6.3+ and Windows 2008 Server+.

## Packages
Cloudify comes as a set of packages containing (almost) all dependencies within them.

### The Components Package (Mandatory)
Contains all 3rd party components Cloudify uses.
This is the largest package and should rarely change from version to version.
You might want to host it in a local repository and only update it if something changes.

### Core Package (Mandatory)
Contains Cloudify's code.
This is what makes everything tick.

### UI Package (Optional)
Contains Cloudify's Web UI.
This is optional since Cloudify can be managed using the CLI.

### Agent Packages (At least one is mandatory)
Contains Cloudify's agent code and is OS distribution specific.
Cloudify supplies agent packages for both Linux (several distros) and Windows.
You must at least have an agent that corresponds with your Manager's distribution.

## Python (Obviously)
Cloudify does require that you have Python 2.7 and above to run.

{%note title=Note%}
Centos comes with Python 2.6.6 by default. If you want to use Centos with Cloudify, you'll have to provide an image with Python 2.7.
{%endnote%}

# What's Next

Next, you should [install the Cloudify CLI](installation-cli.html). Once you've installed it, you will be able to boostrap a Cloudify manager on the environment of your choice.
