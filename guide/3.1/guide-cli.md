---
layout: bt_wiki
title: CLI Guide (WIP)
category: Guides
publish: false
abstract: "Guide for Cloudify CLI"
pageord: 900

cli_reference_link: reference-cfy.html
cli_fabric_tasks_repo: git@github.com:cloudify-cosmo/cloudify-cli-fabric-tasks.git
cli_installation_link: installation-cli.html
---
{%summary%}{{page.abstract}}{%endsummary%}

{%warning title=Note%}This guide is a work in progress. In the menawhile, you can refer to the [cli reference]({{page.cli_reference_link}}) for more information.{%endwarning%}

# Overview

The Cloudify CLI can be used both for managing applications, bootstrapping a manager machine and displaying the status of a running manager.


Managing applications is done via REST calls to the management server. The CLI supports all Cloudify flows, such as creating deployments, executing workflows, retrieving events, etc.


Bootstrapping a manager machine is done with the help of components called *Providers*, which are extensions of the CLI that are used to interact with specific IaaS providers.

The flow when bootstrapping is the same for all providers:

  * First, one has to run the `cfy init -p <provide>` command, which will initialize Cloudify for the specific Provider on the current directory. This will create a file named `.cloudify` (where context data is stored) as well as Provider-specific configuration files in the current directory.
  * Editing the configuation file
  * Running the command `cfy bootstrap`


Alternatively, it's possible to work with an existing management server, by issuing the command `cfy use -t <management_ip>`.


{%note title=Note%}It's highly recommended to initialize and work with the CLI from a designated folder{%endnote%}

A complete command reference page is available [here](reference-cfy.html).



# Installation

See the [cli installation manual]({{ page.cli_installation_link }})


# Configuration

The CLI's `cfy bootstrap` command uses certain parameters. For the time being, those parameters are defined in the provider-specific configuration file (by convention, *cloudify-config.yaml*).

The configuration is (again, by convention), separated into 2 parts. Provider-specific configuration and Cloudify-specific configuration.
Information on each individual configuration parameter is provided below:

* `cloudify`
	* `resources_prefix` An optional prefix to be added to all resources (and private key files) names. It is recommended for the prefix to end with an underscore or a dash. If not provided, no prefix will be added

	* `server`
	  * `packages`
	    * `components_package_url` The URL for the Cloudify components package. Defaults to the URL for the version which matches the CLI's version.
	    * `core_package_url` The URL for the Cloudify core package. Defaults to the URL for the version which matches the CLI's version.
	    * `ui_package_url` The URL for the Cloudify UI package. If provided with an empty string, the UI won't be installed. Defaults to the URL for the version which matches the CLI's version.
	  * `agents`
	    * `packages`
	      * `ubuntu_agent_url` The URL for the Ubuntu agent package. If provided with an empty string, no package will be downloaded. Defaults to the URL for the version which matches the CLI's version.
	      * `centos_agent_url`: The URL for the CentOS agent package. If provided with an empty string, no package will be downloaded. Defaults to the URL for the version which matches the CLI's version.
	      * `windows_agent_url` The URL for the Windows agent package. If provided with an empty string, no package will be downloaded. Defaults to the URL for the version which matches the CLI's version.
	    * `config`
	      * `min_workers` Celery autoscale parameter - the minimum number of workers on an agent machine. See [Autoscaling](http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling) (Default: `2`).
	      * `max_workers` Celery autoscale parameter - The maximum number of workers on an agent machine. See [Autoscaling](http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling) (Default: `5`).
	      * `remote_execution_port` The default port that will be used to run commands on agents (Default: `22`).
	      * `user` The default user that will be used to connect with agent machines. If not provided, then this will have to be specified in the blueprints in the agent node or type properties.
	  * `workflows`
	    * `task_retries` Number of retries for a failing workflow task. -1 means infinite retries (Default: `-1`).
	    * `retry_interval` Minimum wait time (in seconds) in between workflow task retries (Default: `30`).
	  * `bootstrap`
	    * `ssh`
	      * `initial_connectivity_retries` Number of retries for the initial connectivity check with the management server (Default: `25`).
	      * `initial_connectivity_retries_interval` Wait time (in seconds) in between the initial connectivity retries (Default: `5`).
	      * `command_retries` Number of retries for bootstrap commands run via SSH (Default: `3`).
	      * `retries_interval` Wait time (in seconds) in between the command retries (Default: `3`).
	      * `connection_attempts` Number of SSH connection attempts (in a single retry) (Default: `1`).
	      * `socket_timeout` timeout (in seconds) for an SSH connection (Default: `10`).

# Running Remote Tasks

Cloudify's CLI provides an interface to running premade [fabric](http://www.fabfile.org/) tasks on the management server.

This supplies an easy way to run personalized, complex ssh scripts on the manager without having to manually connect to it.

{%note title=Note%}
The tasks must run in the context of the `cfy` command (That is, under the virtualenv Cloudify's CLI is installed) and in the directory .cloudify is in.
{%endnote%}

{%note title=Note%}
The tasks don't have to be decorated with the `@task` decorator as they're directly called from the cli's code just like any other python function. Also, as fabric is one of the cli's dependencies, you don't have to install it separately unless you're using the cli as a binary in which case you'll have to install fabric yourself.
{%endnote%}

## Usage

```shell
cfy dev --tasks-file my_tasks.py -v my_task --arg1=something --arg2=otherthing ...
cfy dev -v my_task arg1_value arg2_value ...
```

`--tasks-file my_tasks.py` can be omitted if a `tasks.py` file exists in your current working directory.

So for instance, if you want to echo `something` in your currently running manager, all you have to do is supply a tasks.py file with the following:

```python
from fabric.api import run

def echo(text):
    run('echo {0}'.format(text))
```

and then run:
```shell
cfy dev echo something!
```

Note that the `dev` command doesn't appear in cfy by default when running `cfy -h`.
You can run `cfy dev -h` for a command reference.

Cloudify provides a tasks [repo]({{ page.cli_fabric_tasks_repo }}) from which users can obtain tasks and to which developers should contribute for the benefit of all.

