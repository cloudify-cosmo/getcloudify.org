---
layout: bt_wiki
title: Agent Packager
category: Agents
publish: true
abstract: Using the agent packager to create an agent for your distribution
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

---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

Cloudify's Agent is basically a [virtualenv]({{page.virtualenv_link}}) with a series of modules installed in it and (optionally) a few configuration files attached.

To use Cloudify with distributions other than the [officially supported ones](agents-description.html#provided-agent-packages), we're providing an [Agent-Packager tool](https://github.com/cloudify-cosmo/cloudify-agent-packager) that will assist you in creating an agent for your distribution.

{%note title=Note%}
As this is the first time we're releasing this tool, you may (and probably will) stumble upon some bugs. Please let us know so that we can improve it and provide a convenient way for you to easily create agents.
{%endnote%}

This tool aims to:

- Solve the problem of compiling module requirements on different distributions, thus bridging the gap of user compiled images, unfamiliar/minor distros and so on.
- Allow users to create their own, personalized Cloudify agents with custom plugins of their choosing.
- Make the agent creation process seamless. One config file. One liner cmd.
- Allow users to override any existing mandatory (or else) modules and provide their own.

You can use Cloudify's agent-packager to create an agent on the distribution you're running so that modules that require compilation will use your distribution and compilers to do so.

{%warning title=Note%}
As Cloudify's code currently only supports Python 2.7.x or Python 2.6.x, you will have to run one of those to create an agent.
{%endwarning%}

{%warning title=Note%}
Currently, not all of Cloudify's Plugins can run on Python 2.6.x. Only basic modules and plugins are currently fitted to run on Python 2.6.x. To see whether a plugin supports your Python version, please see the documentation for the plugin you're looking to use.
{%endwarning%}

# Creation Process

During the creation process, the agent-packager performs the following:

* Creates a virtualenv using the python binary of your choice.
* Installs mandatory external modules into the virtualenv.
* Installs mandatory and optional Cloudify Plugins and modules into the virtualenv.
* Installs the `cloudify-agent` module into the virtualenv.
* Installs any additional user chosen Cloudify Plugins or python modules into the virtualenv.
* Validates that all specified modules were installed.
* Creates a tar file containing the virtualenv.

{%note title=Note%}
The tool will create a tar file to be used with Cloudify's [agent installer plugin](plugin-linux-agent-installer.html). For other agent installer implementations, a different type of agent might be required.
{%endnote%}


# Installation

{% highlight bash %}
pip install cloudify-agent-packager
{%endhighlight%}

For development purposes:

{% highlight bash %}
pip install https://github.com/cloudify-cosmo/cloudify-agent-packager/archive/master.tar.gz
{%endhighlight%}


# Usage

IMPORTANT NOTES:

- You must use this tool on the specific version of the distribution you're intending for your agent to run in as it might require compilation.
- You must have the desired version of python installed on your chosen image.
- You must have the `tar` binary in your distribution (just run `which tar` to verify that you have tar installed).

## Using from the CLI

{% highlight bash %}
cfy-ap -h

Script to run Cloudify's Agent Packager via command line

Usage:
    cfy-ap [--config=<path> --force --dryrun --no-validation -v]
    cfy-ap --version

Options:
    -h --help                   Show this screen
    -c --config=<path>          Path to config yaml (defaults to config.yaml)
    -f --force                  Forces deletion and creation of venv and tar file.
    -d --dryrun                 Prints out the modules to be installed without actually installing them.
    -n --no-validation          Does not validate that all modules were installed correctly.
    -v --verbose                verbose level logging
    --version                   Display current version
{%endhighlight%}

example:

{% highlight bash %}
cfy-ap -f -c my_config.yaml -v
{%endhighlight%}

## Using from python

To use this from python, do the following:

{% highlight python %}
import agent_packager.packager as cfyap

config = {}  # dict containing the configuration as given in the yaml file.

cfyap.create(config=config, config_file=None, force=False, dry=False, no_validate=False, verbose=True)
{%endhighlight%}

{%note title=Note%}
Using the tool from python allows you to pass the configuration dictionary directly to the creation method which allows for automating the agent creation process.
{%endnote%}

## The `cloudify-agent` module

See [here]({{page.cloudify_agent_link}}).

## Using your agent

After creating the agent you can do one of the following to use your newly created agent:

### Using your agent on a per-node basis

You can define the paths to the agent tar file and the 3 configuration files in the blueprint on a per-node basis.
See the agent-installer [documentation]({{page.linux_agent_installer_link#configuration}}) for more information.

### Uploading your agent to the manager

You can use the CLI's `dev` command and the supplied `upload_agent_to_manager` fabric task to upload the agent and its configuration files to the manager.

You can read about running the task [here](https://github.com/cloudify-cosmo/cloudify-cli-fabric-tasks).

### Install agents in the manager during bootstrap

You can provide urls for agents you'd like to provide during manager bootstrap.


# Configuring the Tool

## The YAML config file

Here's an example configuration file.

{% highlight yaml %}
distribution: Ubuntu
release: trusty
venv: 'cloudify/agent/env'
python_path: '/usr/bin/python'
cloudify_agent_version: master
cloudify_agent_module: http://github.com/cloudify-cosmo/cloudify-agent/archive/master.tar.gz
core_modules:
    cloudify_plugins_common: http://github.com/cloudify-cosmo/cloudify-plugins-common/archive/master.tar.gz
    cloudify_rest_client: http://github.com/cloudify-cosmo/cloudify-rest-client/archive/master.tar.gz
    cloudify_script_plugin: http://github.com/cloudify-cosmo/cloudify-script-plugin/archive/master.tar.gz
    cloudify_diamond_plugin: http://github.com/cloudify-cosmo/cloudify-diamond-plugin/archive/master.tar.gz
    cloudify_agent_installer_plugin: http://github.com/cloudify-cosmo/cloudify-agent-installer-plugin/archive/master.tar.gz
    cloudify_plugin_installer_plugin: http://github.com/cloudify-cosmo/cloudify-plugin-installer-plugin/archive/master.tar.gz
    cloudify_windows_agent_installer_plugin: http://github.com/cloudify-cosmo/cloudify-windows-agent-installer-plugin/archive/master.tar.gz
    cloudify_windows_plugin_installer_plugin: http://github.com/cloudify-cosmo/cloudify-windows-plugin-installer-plugin/archive/master.tar.gz
additional_modules:
    - pyyaml==3.10
output_tar: Ubuntu-trusty-agent.tar.gz
keep_venv: true
{%endhighlight%}

### Config YAML Explained

{%note title=Note%}
The `distribution` and `release` variables are case sensitive and must correspond with the output generated when running:

{% highlight bash %}
python -c "import platform; print platform.dist()"
# e.g. ('Ubuntu', '14.04', 'trusty')
{%endhighlight%}

Beginning with Cloudify 3.2, they will not be case sensitive.
{%endnote%}

- `distribution` - Which distribution is the agent intended for. If this is omitted, the tool will try to retrieve the distribution by itself. The distribution is then used to name the virtualenv (if not explicitly specified in `venv`) and to name the output file (if not explicitly specified in `output_tar`).
- `release` - Which release (e.g. precise, trusty) of the `distribution` is the agent intended for. If this is omitted, the tool will try to retrieve the release by itself. The release is then used to name the virtualenv (if not explicitly specified in `venv`) and to name the output file (if not explicitly specified in `output_tar').
- `venv` - Path to the virtualenv you'd like to create. Cloudify's built-in agent-installer requires that the format will be "/FOLDER/FOLDER/env/" where FOLDER can be any folder. The tar should include 2 parent folders and an `env` folder within them (If omitted, defaults to /cloudify/DISTRO-VERSION-agent/env).
- `python_path` - Allows you to set the python binary to be used when creating `venv`. (Defaults to `/usr/bin/python`).
- `cloudify_agent_version` - States which version of the `cloudify-agent` module to install (Is not required if `cloudify_agent_module` is specified). Note that this can be used to create an agent for a specific Cloudify version.
- `cloudify_agent_module` - States the url from which the `cloudify-agent` module should be installed. (Will ignore `cloudify_agent_version` if specified).
- `core_modules` - a `dict` of core modules to install into the virtualenv. (If omitted or with a value of `false`, the module will be installed as a part of the `cloudify-agent` dependencies.) See below for a list of current core modules. If `exclude` is set (per module), it will not be installed. Set `exclude` with extra care!
- `additional_modules` - a `list` of additional modules to install into the virtualenv. This is where you can add your plugins.
- `output_tar` - Path to the tar file you'd like to create.
- `keep_venv` - Whether to keep the virtualenv after creating the tar file or not. Defaults to false.


# Agent Modules

Each agent contains a set of modules, which are just python packages.
These modules can be either simple python libraries or they can be [plugins]({{page.terminology_link}}#plugin).

## Core External Modules:

These are modules not developed by Cloudify that are used by the agent.

- [Celery]({{page.celery_link}}) (Mandatory)

## Core Modules:

These modules are developed by Cloudify and provide core functionality for the agent - thus, the default agents provided with Cloudify come with these pre-installed.

- [Cloudify Rest Client]({{page.rest_client_api_link}}) (Mandatory)
- [Cloudify Plugins Common]({{page.plugins_common_api_link}}) (Mandatory)

## Core Plugins:

These plugins are developed by Cloudify and provide core functionality for the agent - thus, the default agents provided with Cloudify come with these pre-installed.

- [Cloudify Script Plugin]({{page.script_plugin_link}}) (Optional)
- [Cloudify Diamond Plugin]({{page.diamond_plugin_link}}) (Optional)
- [Cloudify Linux Agent Installer]({{page.linux_agent_installer_link}}) (Temporarily Mandatory)
- [Cloudify Linux Plugin Installer]({{page.plugin_installer_link}}) (Temporarily Mandatory)
- [Cloudify Windows Agent Installer]({{page.windows_agent_installer_link}}) (Temporarily Mandatory)
- [Cloudify Windows Plugin Installer]({{page.plugin_installer_link}}) (Temporarily Mandatory)

The Cloudify Manager actually also runs an instance of an agent, this is called the `cloudify_management_agent`.
This agent is responsible for starting all other agents, and thus requires all `installer` plugins.

(In the future, some of them will be optional.)


{%note title=Note%}
Note that if you want to use the [ZeroMQ](https://github.com/zeromq/pyzmq) proxy in
the [script plugin]({{page.script_plugin_link}}) you'll have to explicitly configure it in the `additional_modules`
section as shown above.
{%endnote%}
