---
layout: bt_wiki
title: Linux Agent Installer Plugin
category: Official Plugins
publish: true
abstract: "Cloudify Linux Agent Installer description and configuration"
pageord: 500

celery_link: http://www.celeryproject.org/
autoscale_link: http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling
celery_config_link: https://github.com/cloudify-cosmo/cloudify-packager/blob/b46fb8a84d3246612c9a6b437422144340ea8172/package-configuration/ubuntu-commercial-agent/Ubuntu-celeryd-cloudify.conf.template
celery_init_link: https://github.com/cloudify-cosmo/cloudify-packager/blob/b46fb8a84d3246612c9a6b437422144340ea8172/package-configuration/ubuntu-commercial-agent/Ubuntu-celeryd-cloudify.init.template
disable_requiretty_link: https://github.com/cloudify-cosmo/cloudify-packager/blob/master/package-configuration/ubuntu-commercial-agent/Ubuntu-agent-disable-requiretty.sh
---
{%summary%}
{%endsummary%}


# Description

The Cloudify Linux Agent Installer plugin is used to install agents on host nodes.
The installation process is done using SSH from the management machine into the agent machine.

The agent installation process includes installing [Celery]({{page.celery_link}})
on the agent machine, installing plugins required on this host and starting a celery worker.


# Plugin Requirements:

* Python Versions:
  * 2.7.x


# Configuration

The agent configuration is located under the `cloudify_agent` property of a host node.

{% highlight yaml %}
node_templates:
  example_host:
    type: cloudify.nodes.Compute
    properties:
      cloudify_agent:
        user:                             # no default value (globally configurable in bootstrap configuration)
        key:                              # no default value (globally configurable in bootstrap configuration)
        port: 22                          # default value (from bootstrap configuration)
        min_workers: 2                    # default value (from bootstrap configuration)
        max_workers: 5                    # default value (from bootstrap configuration)
        wait_started_timeout: 15          # default value
        wait_started_interval: 1          # default value
        disable_requiretty: true          # default value
        distro:                           # no default value (automatically resolved at runtime)
        distro_codename:                  # no default value (automatically resolved at runtime)
        celery_config_path:               # a resource provided with the manager by default
        celery_init_path:                 # a resource provided with the manager by default
        disable_requiretty_script_path:   # a resource provided with the manager by default
        agent_package_path:               # a resource provided with the manager by default
{%endhighlight%}

## Agent Configuration

* `user` - SSH username
* `key`  - Path to SSH key file on the management machine
* `port` - SSH port (default: `22`)
* `min_workers` - Minimum number of agent workers (default: `2`. See [Auto Scaling]({{page.autoscale_link}}))
* `max_workers` - Maximum number of agent workers (default: `5`. See [Auto Scaling]({{page.autoscale_link}}))
* `wait_started_timeout` - How many seconds should be waited for the agent to be started after installation before raising an error (default: `15`)
* `wait_started_interval` - How many seconds to wait between each probe of the current agent status (default: `1`. used in conjunction with `wait_started timeout`)
* `disable_requiretty` - Disables the `requiretty` setting in the sudoers file (default: `true`)
* `distro` - The linux distribution the agent is intended to be installed on. By default this parameter is automatically set in runtime but it is possible to override it to set any other distribution. Note that when creating an agent for your distribution, for the agent installer to be able to install it, it must be called `DISTRIBUTION-RELEASE-agent.tar.gz` (e.g. Ubuntu-trusty-agent.tar.gz) unless `distro` and `release` are explicitly provided in the blueprint.
* `release` - The linux distribution's release the agent is intended to be installed on. This is retrieved the same way `distribution` is retrieved.

## Agent Resources

The following are resources that are primarily provided with Cloudify's agents by default. Overriding these, will allow you to provide different implementations for handling how agents are installed, configured and ran and to provide a different agent package, potentially containing different plugins or based on different python environments.

* `celery_config_path` - A path relative to the blueprint that contains the celery configuration file. see [reference]({{page.celery_config_link}}).
* `celery_init_path` - A path relative to the blueprint that contains the celery init file. see [reference]({{page.celery_init_link}}).
* `disable_requiretty_script_path` - A path relative to the blueprint that contains the script that disables `requiretty`. see [reference]({{page.disable_requiretty_link}}).
* `agent_package_path` - A path relative to the blueprint that contains the agent package (tar.gz file). This allows you to override the agent you're using on a per node basis.

## Identifying the distribution and release of the hosting OS

The plugin will try to identify the distribution and its release and deploy the correct type of agent for them.
The identification process is based on a remote fabric run where `python -c` is executed and returns the `platform.dist()` output.

To overcome a problem where additional output is added to each execution of a command (e.g. something is added in .bashrc), the process will append a prefix and suffix to the execution so that it can identify only the relevant output.

For instance, if the execution outputs the following to stdout:

```sh
This is my shell
OUTPUT_OF_EXECUTED_COMMAND
Bye Bye
```

The output of the distro identification will be as follows:

```sh
This is my shell
DISTROOPEN('Ubuntu', '14.04', 'trusty')DISTROCLOSE
Bye Bye
```

Then, the identification will be based on the returned string between the prefix and suffix.

* The `distro` variable will be set to the first index in the tuple (e.g. Ubuntu).
* The `release` variable will be set to the 3rd index in the typle (e.g. trusty).
* The `celery_config_path`, `celery_init_path` and `disable_requiretty_script_path` variables will be affected by the `distro` variable. For instance, a celery_init_path value could be "Ubuntu-celeryd-cloudify..." if not specified explicitly in the blueprint.
* The `agent_package_path` is affected by both the distro and the release variables. For instance an agent_package_path value could be "Ubuntu-trusty-agent.tar.gz" if not specified explicitly in the blueprint.

Example:

{% highlight yaml %}
node_templates:
  vm:
    type: cloudify.nodes.Server
    properties:
        cloudify_agent:
            distro: Centos
            celery_config_path: templates/celery-config.conf.template
            celery_init_path: templates/celery-init.conf.template
            ...
{%endhighlight%}

In the above example:

* The celery configuration files are explicitly looked up in the corresponding paths relative to the blueprint's root directory.
* The disable-requiretty script file will be looked up in the default directory where Cloudify script files reside. Since `distro` is set, the file name looked for will be "Centos-agent-disable-requiretty.sh"
* The agent package isn't specified so it will be looked up in the default directory where Cloudify agents reside. Since `distro` is specified and `release` isn't, the agent name looked up will be "Centos-Final-agent.tar.gz". (Since Centos always outputs "Final" as its release name).
