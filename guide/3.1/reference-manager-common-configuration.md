---
layout: bt_wiki
title: Common Manager Configuration Reference
category: Reference
publish: true
abstract: "Reference on common Cloudify manager configuration"
pageord: 400
---

{%summary%} This page serves as a reference to common Cloudify manager configuration parameters, which are available in the various manager blueprints {%endsummary%}


# cloudify_packages

## description
This parameter is used to choose the packages with which the Cloudify manager and agents are created.

## schema
{% highlight yaml %}
cloudify_packages:
    server:
        compnonets_package_url: {url}
        core_package_url: {url}
        ui_package_url: {url}
    agents:
        ubuntu_agent_url: {url}
        centos_agent_url: {url}
        windows_agent_url: {url}
{%endhighlight%}

## parameters details

* server
  * `components_package_url` The URL for the Cloudify components package (Default: a URL of the relevant package).
  * `core_package_url` The URL for the Cloudify core package (Default: a URL of the relevant package).
  * `ui_package_url` The URL for the Cloudify UI package. If provided with an empty string, the UI won’t be installed (Default: a URL of the relevant package).
* agents
  * `ubuntu_agent_url` The URL for the Ubuntu agent package. If provided with an empty string, no package will be downloaded (Default: a URL of the relevant package).
  * `centos_agent_url` The URL for the CentOS agent package. If provided with an empty string, no package will be downloaded (Default: a URL of the relevant package).
  * `windows_agent_url` The URL for the Windows agent package. If provided with an empty string, no package will be downloaded (Default: a URL of the relevant package).


# cloudify

## description
This parameter is used to set various configuration parameters on the Cloudify manager.

## schema
cloudify:
    resources_prefix: {prefix}
    cloudify_agent:
        min_workers: {min_workers}
        max_workers: {max_workers}
        remote_execution_port: {remote_execution_port}
        user: {user}
    workflows:
        task_retries: {task_retries}
        task_retry_interval: {task_retry_interval}
    policy_engine:
        start_timeout: {start_timeout}

## parameters details
* `resources_prefix` An optional prefix to be added to all resources (and private key files) names. It is recommended for the prefix to end with an underscore or a dash. If not provided, no prefix will be added (Default: `""`)
* cloudify_agent
  * `min_workers` Celery autoscale parameter - the minimum number of workers on an agent machine. See [Autoscaling](http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling) (Default: `2`).
  * `max_workers` Celery autoscale parameter - the maximum number of workers on an agent machine. See [Autoscaling](http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling) (Default: `5`).
  * `remote_execution_port` The default port that will be used to run commands on agents (Default: `22`).
  * `user` The default user that will be used to connect with agent machines. If not provided, then this will have to be specified in the blueprints in the agent node or type properties (Default: `ubuntu`)
* workflows
  * `task_retries` Number of retries for a failing workflow task. -1 means infinite retries (Default: `-1`).
  * `task_retry_interval` Minimum wait time (in seconds) in between workflow task retries (Default: `30`).
* policy_engine
  * `start_timeout` Timeout (in seconds) for waiting for the policy engine to come up (Default: `30`).