---
layout: bt_wiki
title: Linux Agent Installer Plugin
category: Plugins
publish: true
abstract: "Cloudify Linux Agent Installer description and configuration"
pageord: 500

celery_link: http://www.celeryproject.org/
autoscale_link: http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling
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
          user:                     # no default value (globally configurable in bootstrap configuration)
          key:                      # no default value (globally configurable in bootstrap configuration)
          port: 22                  # default value (from bootstrap configuration)
          min_workers: 2            # default value (from bootstrap configuration)
          max_workers: 5            # default value (from bootstrap configuration)
          wait_started_timeout: 15  # default value
          wait_started_interval: 1  # default value
          disable_requiretty: true  # default value
          distro:                   # no default value (automatically resolved in run time)
{%endhighlight%}

* `user` SSH username
* `key`  Path to SSH key file on the management machine
* `port` SSH port (default: `22`)
* `min_workers` Minimum number of agent workers (default: `2`. See [Auto Scaling]({{page.autoscale_link}}))
* `max_workers` Maximum number of agent workers (default: `5`. See [Auto Scaling]({{page.autoscale_link}}))
* `wait_started_timeout` How many seconds should be waited for the agent to be started after installation before raising an error (default: `15`)
* `wait_started_interval` How many seconds to wait between each probe of the current agent status (default: `1`. used in conjunction with `wait_started timeout`)
* `disable_requiretty` Disables the `requiretty` setting in the sudoers file (default: `true`)
* `distro` The linux distribution the agent is intended to be installed on. By default this parameter is automatically set in run time but it is possible to specify one of the following values: "Ubuntu", "debian", "centos".


# Bundled Plugins & Libraries

The following plugins and libraries are bundled within every Cloudify linux agent:

## Libraries

* cloudify-plugins-common (required by every plugin)
* cloudify-rest-client

## Plugins

* cloudify-agent-installer-plugin
* cloudify-plugin-installer-plugin
* cloudify-windows-agent-installer-plugin
