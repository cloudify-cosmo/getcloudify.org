---
layout: bt_wiki
title: Windows Agent Installer Plugin
category: Plugins
publish: true
abstract: "Cloudify Windows Agent Installer description and configuration"
pageord: 800

celery_link: http://www.celeryproject.org/
autoscale_link: http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling
python_link: https://www.python.org/ftp/python/2.7.6/python-2.7.6.msi
winrm_link: http://msdn.microsoft.com/en-us/library/aa384426(v=vs.85).aspx
---

{%summary%} The Cloudify Windows Agent Installer plugin is used to install agents on Windows host nodes.
The installation process is done using [WinRM]({{page.winrm_link}}) over HTTP from the management machine on the agent machine.
The Agent is installed as a Windows Service under the name 'CloudifyAgent'.
{%endsummary%}

# Pre-requisites

This plugin can only install agents on an image that meets the following set of requirements:

* WinRM enabled

To enable WinRM on the machine execute these commands:
{% highlight bash %}
winrm quickconfig
winrm s winrm/config/service @{AllowUnencrypted="true";MaxConcurrentOperationsPerUser="4294967295"}
winrm s winrm/config/service/auth @{Basic="true"}
winrm s winrm/config/winrs @{MaxShellsPerUser="2147483647"}
{%endhighlight%}

{%note title=Note%}
These settings provide unencrypted WinRM access to the machine. We're working on adding Kerberos support.
From MSDN: AllowUnencrypted - Allows the client computer to request unencrypted traffic.
{%endnote%}

* Python

   Python 2.7.6 32Bit Must be installed on the machine under 'C:\Python27' - [(Get Python)]({{page.python_link}})

* A Windows image with a preconfigured, known user and password (to allow WinRM access).


# Description

The agent installation process includes installing [Celery]({{page.celery_link}})
on the agent machine, installing plugins required on this host and starting a celery worker.


# Configuration

The agent configuration is located under the `cloudify_agent` property of a host node.

{% highlight yaml %}
blueprint:
  name: example
  nodes:
    - name: example_windows_host
      type: cloudify.openstack.windows_server
      properties:
        cloudify_agent:
          user:                     # no default value (globally configurable in bootstrap configuration)
          password:                 # no default value
          port: 5985                # default value (from bootstrap configuration)
          min_workers: 2            # default value (from bootstrap configuration)
          max_workers: 5            # default value (from bootstrap configuration)
          service:
              start_timeout: 30
              stop_timeout: 30
              status_transition_sleep_interval: 5
              successful_consecutive_status_queries_count: 3
              failure_reset_timeout: 60
              failure_restart_delay: 5000
{%endhighlight%}

* `user` username for establishing a WinRM connection
* `password` password for establishing a WinRM connection
* `port` WinRM port (default: `5985`)
* `min_workers` Minimum number of agent workers (default: `2`. See [Auto Scaling]({{page.autoscale_link}}))
* `max_workers` Maximum number of agent workers (default: `5`. See [Auto Scaling]({{page.autoscale_link}}))
* `service.start_timeout` Time to wait for the service to reach 'Running' status (default: `30` unit: seconds)
* `service.stop_timeout` Time to wait for the service to reach 'Stopped' status (default: `30` unit: seconds)
* `service.status_transition_sleep_interval` Sleep interval between status checks (default: `5` unit: seconds)
* `service.successful_consecutive_status_queries_count` Number of status checks after which the status is considered stable (default: `3`)
* `service.failure_reset_timeout` The period of time with no failures after which the failure count should be reset to 0 (default: `60` unit: seconds)
* `service.failure_restart_delay` Time to wait before starting the service again after a failure (default: `5000` unit: milliseconds)

# Bundled Plugins & Libraries

The following plugins and libraries are bundled within every Cloudify windows agent:

## Libraries

* cloudify-plugins-common (required by every plugin)
* cloudify-rest-client

## Plugins

* cloudify-windows-plugin-installer-plugin
