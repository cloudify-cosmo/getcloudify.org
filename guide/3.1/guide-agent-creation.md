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
cli_fabric_tasks_repo: git@github.com:cloudify-cosmo/cloudify-cli-fabric-tasks.git
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

Cloudify is currently supplied with a set of default agents for CentOS, Ubuntu and Windows. These agents are all based on Python2.7.

In the near future, we will supply a wider set of agents supporting the common major distributions running on their default python versions.
Alongside those agents, we will supply a tool to create agents for different distributions.

This guide proposes a generic way to create an agent for your **linux** distribution as a workaround until more agents and the tool are supplied.

# Requirements

- You will have to create the agent on the distribution you're going to use the agent in (e.g. if your hosts are running CentOS)
- sudo permissions
- Python 2.7 - currently, we only support Python 2.7. In the near future, you will be able to create agents on different versions of python.
- [pip]({{ page.pip_link }})
- [virtualenv]({{ page.virtualenv_link }})

# Step by Step Tutorial

## Step 1

Create a virtualenv using python 2.7 and cd into it.

{% highlight sh %}
sudo virtualenv /centos-agent/env && cd /centos-agent/env
{%endhighlight%}

{% highlight Note %}
Currently, Cloudify will not allow you to install its agent on distributions other than Ubuntu, debian or CentOS.

Since the "Ubuntu-agent" is also used in your manager, as a workaround, until this is solved, we will refer to your agent as a "centos-agent" and provide the names to correspond with that.
{%endhighlight%}

{% highlight Warning %}
This procedure will NOT work in an environment containing hosts with both centos hosts AND hosts comprising of another distribution other than Ubuntu.
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

{% highlight Note %}
You can install any other plugins into the virtualenv by "pip installing" them before packaging.
{%endhighlight%}

## Step 4

Create a tar.gz in a destination directory.

{% highlight sh %}
sudo mkdir -p /cloudify-agent
cd /cloudify-agent && sudo tar -czvf centos-agent.tar.gz /centos-agent/env
{%endhighlight%}

## Step 5

Download the celery configuration files:

{% highlight sh %}
sudo wget https://github.com/cloudify-cosmo/cloudify-packager-centos/blob/master/package-configuration/centos-agent/centos-celeryd-cloudify.conf.template -P /cloudify-agent
sudo wget https://github.com/cloudify-cosmo/cloudify-packager-centos/blob/master/package-configuration/centos-agent/centos-celeryd-cloudify.init.template -P /cloudify-agent
sudo wget https://github.com/cloudify-cosmo/cloudify-packager-centos/blob/master/package-configuration/centos-agent/centos-agent-disable-requiretty.sh -P /cloudify-agent
{%endhighlight%}

{% highlight Note %}
The centos-celeryd-cloudify.init.template file is an init.d template that is deployed by cloudify when an agent is installed unto a linux environment.

Currently, this is the only implementation for running the agent as a service (which is also why "sudo" is required). In the future, a different implementation will be supplied which will not require sudo by default.
{%endhighlight%}

## Step 6

Run a fabric task that deploys the agent in the bootstrapped manager.
The task must run in the context of the `cfy` command (That is, under the virtual environment Cloudify's CLI is installed).

Clone the cloudify-cli-fabric-tasks [repo]({{ page.cli_fabric_tasks_repo }}).

{% highlight sh %}
git clone {{ cli_fabric_tasks_repo }}
cfy dev --tasks-file cloudify-cli-fabric-tasks/tasks/tasks.py upload_agent_to_manager
{%endhighlight%}