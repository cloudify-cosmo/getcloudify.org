---
layout: bt_wiki
title: Agent Packager
category: Agents
publish: true
abstract: Using the agent packager to create an agent for your distribution
pageord: 220

virtualenv_link: http://virtualenv.readthedocs.org/en/latest/
terminology_link: reference-terminology.html
celery_link: http://www.celeryproject.org/
rest_client_api_link: apis-rest-service.html
plugins_common_api_link: apis-plugins-common.html
diamond_plugin_link: plugin-diamond.html
script_plugin_link: plugin-script.html
linux_agent_installer_link: plugin-linux-agent-installer.html
windows_agent_installer_link: plugin-windows-agent-installer.html
plugin_installer_link: plugin-installer-plugin.html

---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

Cloudify's Agent is basically a [virtualenv]({{page.virtualenv_link}}) with a series of modules installed in it and a few configuration files attached.

To use Cloudify with distributions other than the [officially supported ones](agents-general.html#provided-agent-packages), we're providing an [Agent-Packager tool](https://github.com/cloudify-cosmo/cloudify-agent-packager) that will assist you in creating an agent for your distribution.

This tool aims to:

- Solve the problem of compiling module requirements on different distributions, thus bridging the gap of user compiled images, unfamiliar/minor distros and so on.
- Allow users to create their own, personalized Cloudify agents with custom plugins of their choosing.
- Make the agent creation process seamless. One config file. One liner cmd.
- Allow users to override the `agent-installer` and `plugin-installer` modules so that they can implement their own.
- Allow users to decide whether they want to have the `diamond-plugin` built into the agent (which is included in our distributed agents).

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
* Installs the required modules into the virtualenv.
* Creates a tar file from the virtualenv.

{%note title=Note%}
The tool will create a tar file to be used with Cloudify's [agent installer plugin](plugin-linux-agent-installer.html). For other agent installer implementations, a different type of agent might be required.
{%endnote%}

## Agent Configuration Files

Cloudify's agent is originally supplied with 3 additional files:

- a disable requiretty script.
- a template for celery's config file.
- a template for celery's init file.

This tool does not provide these files - as different distributions might require different init files or require a different method for disabling requiretty.

More info below.


# Installation

NOTE: soon, you'll be able to install this via pypi like this:

{% highlight bash %}
pip install cloudify-agent-packager
{%endhighlight%}

Until then, use this:

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
    cfy-ap [--config=<path> --force -v]
    cfy-ap --version

Options:
    -h --help                   Show this screen
    -c --config=<path>          Path to config yaml (defaults to config.yaml)
    -f --force                  Forces deletion and creation of venv and tar file.
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

cfyap.create(config=config, config_file=None, force=False, verbose=True)
{%endhighlight%}

{%note title=Note%}
Using the tool from python allows you to pass the configuration dictionary directly to the creation method which allows for automating the agent creation process.
{%endnote%}

## The Agent Configuration Files

You can obtain the [files](#agent-configuration-files) from [here](https://github.com/cloudify-cosmo/cloudify-packager/tree/master/package-configuration/ubuntu-commercial-agent).

{%note title=Note%}
These files will not necessarily work on all distributions/releases and you might provide your own.
{%endnote%}

You must change the names of the files to match the distribution you're using as the distribution is automatically identified upon installation.

Alternatively, you can specify the distro in your blueprint under `cloudify_agent` in the `distro` property.

{%warning title=Note%}
Stating the `distro` variable affects the way the agent is identified, not only the configuration files.
For more information on how configuration files and agent tar files are identified, see the agent-installer's [documentation]({{page.linux_agent_installer_link#configuration#identifying-the-distribution-and-release-of-the-hosting-os}}).
{%endwarning%}

## Using your agent

After creating the agent and obtaining the files, you can do one of the following to use your newly created agent:

### Using your agent on a per-node basis

You can define the paths to the agent tar file and the 3 configuration files in the blueprint on a per-node basis.
See the agent-installer [documentation]({{page.linux_agent_installer_link#configuration}}) for more information.

### Uploading your agent to the manager

You can use the CLI's `dev` command and the supplied `upload_agent_to_manager` fabric task to upload the agent and its configuration files to the manager.

You can read about running the task [here](https://github.com/cloudify-cosmo/cloudify-cli-fabric-tasks).

### Install agents in the manager during bootstrap

You can create a deb file containing the tar and configuration files and deploy it in the manager during bootstrap.

{%note title=Note%}
If you'd like to create deb files from your agents which include the files and are installable via a manager blueprint, you can use [packman](https://github.com/cloudify-cosmo/packman) to create the deb ([THAT'S WHAT WE CURRENTLY DO](https://github.com/cloudify-cosmo/cloudify-packager/tree/master/vagrant) :))
{%endnote%}


# Configuring the Tool

## The YAML config file

Here's an example configuration file.

{% highlight yaml %}
distribution: Ubuntu
release: trusty
venv: cloudify/Ubuntu-trusty-agent/env
python_path: /usr/bin/python
base_modules:
    plugins_common: https://github.com/cloudify-cosmo/cloudify-plugins-common/archive/3.1m4.tar.gz
    rest_client: https://github.com/cloudify-cosmo/cloudify-rest-client/archive/3.1m4.tar.gz
    script_plugin: https://github.com/cloudify-cosmo/cloudify-script-plugin/archive/1.1m4.tar.gz
    diamond_plugin: https://github.com/cloudify-cosmo/cloudify-diamond-plugin/archive/1.1m4.tar.gz
management_modules_version: 3.1m4
management_modules:
    agent-installer: https://github.com/someone/cloudify-agent-installer/archive/1.0.tar.gz
additional_modules:
    - pyzmq==14.3.1
    - https://github.com/cloudify-cosmo/cloudify-fabric-plugin/archive/1.1m4.tar.gz
output_tar: /home/nir0s/Ubuntu-trusty-agent.tar.gz
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
- `base_modules` - a `dict` of base modules to install into the package. (All modules default to `master`). See below for a list of current base modules. If `none` is set (per module), it will not be installed. Set `none` with extra care!
- `management_modules_version` - States which version of the `cloudify-manager` code to download from which the management_modules will be installed. This is required only if not all management modules are explicitly specified in `management_modules`. (Defaults to `master`).
- `management_modules` - a `dict` of management modules to install into the package. If omitted, the original cloudify-manager code will be downloaded and all management modules will be installed from there. See below for a list of current management modules. If `none` is set (per module), it will not be installed. Set `none` with extra care!
- `additional_modules` - a `list` of additional modules to install into the package. This is where you can add your plugins.
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

## Management Plugins:

The Cloudify Manager actually also runs an instance of an agent, this is called the `cloudify_management_agent`.
This agent is responsible for starting all other agents, and thus requires all of the following plugins.

(In the future, some of them will be optional.)

- [Cloudify Linux Agent Installer]({{page.linux_agent_installer_link}}) (Temporarily Mandatory)
- [Cloudify Linux Plugin Installer]({{page.plugin_installer_link}}) (Temporarily Mandatory)
- [Cloudify Windows Agent Installer]({{page.windows_agent_installer_link}}) (Temporarily Mandatory)
- [Cloudify Windows Plugin Installer]({{page.plugin_installer_link}}) (Temporarily Mandatory)

{%note title=Note%}
Note that if you want to use the [ZeroMQ](https://github.com/zeromq/pyzmq) proxy in
the [script plugin]({{page.script_plugin_link}}) you'll have to explicitly configure it in the `additional_modules`
section as shown above.
{%endnote%}
