---
layout: bt_wiki
title: Creating a Cloudify Agent
category: Guides
publish: true
abstract: How to build your very own Cloudify Agent on different Linux distributions
pageord: 900

pip_link: http://pip.readthedocs.org/en/latest/
virtualenv_link: http://virtualenv.readthedocs.org/en/1.11.X/
manager_repo_tar: https://github.com/cloudify-cosmo/cloudify-manager/archive/3.0.tar.gz
rest_client_repo_tar: https://github.com/cloudify-cosmo/cloudify-rest-client/archive/3.0.tar.gz
plugins_common_repo_tar: https://github.com/cloudify-cosmo/cloudify-plugins-common/archive/3.0.tar.gz
cli_guide_link: guide-cli.html
---
{%summary%} {{page.abstract}}{%endsummary%}

{%warning title=Note%}
Currently, Cloudify will not allow you to install its agent on distributions other than Ubuntu, debian or CentOS.

Since the "Ubuntu-agent" is also used in your manager, as a workaround, until this is solved, we will create a replacement "centos" agent.
{%endwarning%}

{%warning title=Note%}
This procedure will NOT work in an environment containing hosts with both centos hosts AND hosts comprising of another distribution other than Ubuntu.
{%endwarning%}

# Overview

Cloudify is currently supplied with a set of default agents for CentOS, Ubuntu and Windows. These agents are all based on Python2.7.

In the near future, we will supply a wider set of agents supporting the common major distributions running on their default python versions.
Alongside those agents, we will supply a tool to create agents for different distributions.

This guide proposes a generic way to create an agent for your **linux** distribution as a workaround until more agents and the tool are supplied.

# Requirements

- You will have to create the agent on the distribution you're going to use the agent in (e.g. if your hosts are running CentOS)
- sudo permissions
- Python 2.7 - currently, we only support Python 2.7. In the near future, you will be able to create agents on different versions of python.
- [pip]({{ page.pip_link }}) > 1.5 (it might work on other versions, but they haven't been tested)
- [virtualenv]({{ page.virtualenv_link }}) > 1.11.4 (it might work on other versions, but they haven't been tested)

# Step by Step Tutorial

## Step 1

Create a virtualenv using python 2.7 and cd into it.

{% highlight sh %}
sudo virtualenv /centos-agent/env && cd /centos-agent/env
{%endhighlight%}

## Step 2

Download the manager repository and extract it. Then, delete the file.

{% highlight sh %}
sudo wget {{ page.manager_repo_tar }} -O tmp.tar.gz
sudo tar -xzvf tmp.tar.gz && sudo rm tmp.tar.gz
{%endhighlight%}

## Step 3

Install the relevant modules in the virtualenv and delete tmp data.

{% highlight sh %}
sudo /centos-agent/env/bin/pip install {{ page.plugins_common_repo_tar }}
sudo /centos-agent/env/bin/pip install {{ page.rest_client_repo_tar }}
sudo /centos-agent/env/bin/pip install cloudify-manager-3.0/plugins/plugin-installer/
sudo rm -rf cloudify-manager-3.0
{%endhighlight%}

{%note title=Note%}
You can install any other plugins into the virtualenv by "pip installing" them before packaging.
{%endnote%}

## Step 4

Create a tar.gz in a destination directory.

{% highlight sh %}
sudo mkdir -p /cloudify-agent
cd /cloudify-agent && sudo tar -czvf centos-agent.tar.gz /centos-agent/env
{%endhighlight%}

## Step 5

Download the celery configuration files:

{% highlight sh %}
sudo wget https://github.com/cloudify-cosmo/cloudify-packager-centos/raw/master/package-configuration/centos-agent/centos-celeryd-cloudify.conf.template -P /cloudify-agent/centos-celeryd-cloudify.conf.template
sudo wget https://github.com/cloudify-cosmo/cloudify-packager-centos/raw/master/package-configuration/centos-agent/centos-celeryd-cloudify.init.template -P /cloudify-agent/centos-celeryd-cloudify.init.template
sudo wget https://github.com/cloudify-cosmo/cloudify-packager-centos/raw/master/package-configuration/centos-agent/centos-agent-disable-requiretty.sh -P /cloudify-agent/centos-agent-disable-requiretty.sh
{%endhighlight%}

{%note title=Note%}
The centos-celeryd-cloudify.init.template file is an init.d template that is deployed by cloudify when an agent is installed unto a linux environment.

Currently, this is the only implementation for running the agent as a service (which is also why "sudo" is required). In the future, a different implementation will be supplied which will not require sudo by default.
{%endnote%}

## Step 6

{%note title=Note%}
Please read [cli-fabric-tasks]({{ page.cli_guide_link}}#running-remote-tasks }}) before proceeding.
{%endnote%}

Run a fabric task that deploys the agent in the bootstrapped manager.
The task can be found in the cloudify-cli-fabric-tasks repo which you should clone.

{% highlight sh %}
cfy dev --tasks-file cloudify-cli-fabric-tasks/tasks/tasks.py upload_agent_to_manager
{%endhighlight%}

## Step 7

Configure the blueprint to install your agent on a "centos" distribution

In your blueprint, under your vm node's configuration, under agent_config, add a key called `distro` and supply it with the `custom` value.