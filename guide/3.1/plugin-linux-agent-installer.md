---
layout: bt_wiki
title: Linux Agent Installer Plugin
category: Plugins
publish: true
abstract: "Cloudify Linux Agent Installer description and configuration"
pageord: 500

celery_link: http://www.celeryproject.org/
autoscale_link: http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling
celery_config_link: https://github.com/cloudify-cosmo/cloudify-packager/blob/master/package-configuration/ubuntu-agent/Ubuntu-celeryd-cloudify.conf.template
celery_init_link: https://github.com/cloudify-cosmo/cloudify-packager/blob/master/package-configuration/ubuntu-agent/Ubuntu-celeryd-cloudify.init.template
disable_requiretty_link: https://github.com/cloudify-cosmo/cloudify-packager/blob/master/package-configuration/ubuntu-agent/Ubuntu-agent-disable-requiretty.sh
---

{%summary%} The Cloudify Linux Agent Installer plugin is used to install agents on host nodes.
The installation process is done using SSH from the management machine into the agent machine.
{%endsummary%}

# Description

The agent installation process includes installing [Celery]({{page.celery_link}})
on the agent machine, installing plugins required on this host and starting a celery worker.


# Configuration

The agent configuration is located under the `cloudify_agent` property of a host node.

{% highlight yaml %}
blueprint:
  name: example
  nodes:
    - name: example_host
      type: cloudify.types.host
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
          distro:                           # no default value (automatically resolved in run time)
          celery_config_path:               # a resource provided with the manager by default
          celery_init_path:                 # a resource provided with the manager by default
          disable_requiretty_script_path:   # a resource provided with the manager by default
          agent_package_path:               # a resource provided with the manager by default
{%endhighlight%}

Agent Configuration:

* `user` - SSH username
* `key`  - Path to SSH key file on the management machine
* `port` - SSH port (default: `22`)
* `min_workers` - Minimum number of agent workers (default: `2`. See [Auto Scaling]({{page.autoscale_link}}))
* `max_workers` - Maximum number of agent workers (default: `5`. See [Auto Scaling]({{page.autoscale_link}}))
* `wait_started_timeout` - How many seconds should be waited for the agent to be started after installation before raising an error (default: `15`)
* `wait_started_interval` - How many seconds to wait between each probe of the current agent status (default: `1`. used in conjunction with `wait_started timeout`)
* `disable_requiretty` - Disables the `requiretty` setting in the sudoers file (default: `true`)
* `distro` - The linux distribution the agent is intended to be installed on. By default this parameter is automatically set in run time but it is possible to override it to set any other distribution. Note that when creating an agent for your distribution, for the agent installer to be able to install it, it must be called `YOUR_DISTRIBUTION_NAME-agent.tar.gz` (e.g. Ubuntu-agent.tar.gz).

Agent Resources:

The following are resources that are primarily provided with Cloudify's agents by default. Overriding these, will allow you to provide different implementations for handling how agents are installed, configured and ran and to provide a different agent package, potentially containing different plugins or based on different python environments.

* `celery_config_path` - A path relative to the blueprint that contains the celery configuration file. see [reference]({{page.celery_config_link}}).
* `celery_init_path` - A path relative to the blueprint that contains the celery init file. see [reference]({{page.celery_init_link}}).
* `disable_requiretty_script_path` - A path relative to the blueprint that contains the script that disables `requiretty`. see [reference]({{page.disable_requiretty_link}}).
* `agent_package_path` - A path relative to the blueprint that contains the agent package (tar.gz file). This allows you to override the agent you're using on a per node basis.