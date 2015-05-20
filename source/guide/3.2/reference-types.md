---
layout: bt_wiki
title: Types Reference
category: Reference
publish: true
abstract: "Reference for Cloudify built in types"
pageord: 300

terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Abstract Types
The following [types]({{page.terminology_link}}#type) are basic types from which concrete types with specific plugin implementations are derived.

* `cloudify.nodes.Root` - The base type for all built-in types. declares the following interfaces:

  - `cloudify.interfaces.lifecycle`: An interface for standard life cycle operations (e.g. create, start, stop, etc.). Operations of this interface are called from the [built-in](guide-workflows.html#built-in-workflows) [*install*](reference-builtin-workflows.html#install) and [*uninstall*](reference-builtin-workflows.html#uninstall) workflows.
  - `cloudify.interfaces.validation`: An interface for pre-creation and pre-deletion validation operations. These may be called by using the [*execute_operation*](reference-builtin-workflows.html#execute-operation) built-in workflow or by a [custom workflow](guide-workflows.html#writing-a-custom-workflow). The Cloudify CLI calls these operations before the bootstrap and teardown of the Cloudify manager.
  - `cloudify.interfaces.monitoring_agent`: An interface for monitoring agent. Operations of this interface are called from the [built-in](guide-workflows.html#built-in-workflows) [*install*](reference-builtin-workflows.html#install) and [*uninstall*](reference-builtin-workflows.html#uninstall) workflows.
  - `cloudify.interfaces.monitoring`: An interface for monitoring configuration. Operations of this interface are called from the [built-in](guide-workflows.html#built-in-workflows) [*install*](reference-builtin-workflows.html#install) and [*uninstall*](reference-builtin-workflows.html#uninstall) workflows.

* `cloudify.nodes.Tier` - A marker for a future scale group

* `cloudify.nodes.Compute` - A compute resource either a virtual or a physical host


* `cloudify.nodes.Container` - A logical partition in a host such as [linux container](http://en.wikipedia.org/wiki/LXC) or [docker](https://www.docker.io/)

* `cloudify.nodes.Network` - A virtual network

* `clouydify.nodes.Subnet` - A virtual segment of IP addresses in a network

* `cloudify.nodes.Router` - A virtual layer 3 router

* `cloudify.nodes.Port` - An entry in a virtual subnet. Can be used in some clouds to secure a static private IP

* `cloudify.nodes.VirtualIP` - A virtual IP implemented as [NAT](http://en.wikipedia.org/wiki/Network_address_translation) or in another manner

* `cloudify.nodes.SecurityGroup` - A cloud security group (VM network access rules)

* `cloudify.nodes.LoadBalancer` - A virtualized Load Balancer

* `cloudify.nodes.Volume` - A persistent block storage volume

* `cloudify.nodes.FileSystem` - A Writable File System. This type must be used in conjunction with a `cloudify.nodes.Volume` type and a `cloudify.nodes.Compute` type.
    * relationships: The conjunction stated above is expressed by specifying two mandatory relationships for the file system.
        * `cloudify.relationships.file_system_depends_on_volume` - Used to format and partition the file system on top of the volume. It creates a single partition occupying the entire capacity of the volume.
        * `cloudify.relationships.file_system_contained_in_compute` - Used to mount and unmount the file system from the server.
    * properties:
        * `use_external_resource` - Enables the use of already formatted volumes. In this case, the formatting part will be skipped, and just a mount point will be created. Defaults to False. (Boolean)
        * `partition_type` - The partition type. Defaults to 83 which is a Linux Native Partition. (Integer)
        * `fs_type` - The type of the File System. Supported types are [ext2, ext3, ext4, fat, ntfs, swap]
        * `fs_mount_path` - The path of the mount point.
    * Example Usage:

          volume_fs:
            type: cloudify.nodes.FileSystem
            properties:
              fs_type: ext4
              fs_mount_path: /mount-path
            relationships:
              - type: cloudify.relationships.file_system_depends_on_volume
                target: volume
              - type: cloudify.relationships.file_system_contained_in_compute
                target: vm

* `cloudify.nodes.ObjectStorage` - A BLOB storage segment

* `cloudify.nodes.SoftwareComponent` - A base type for all middleware level types

* `cloudify.nodes.WebServer` - A web server
    * properties:
        * `port` - the webserver port

* `cloudify.nodes.ApplicationServer` - An application server

* `cloudify.nodes.DBMS` - a Database

* `cloudify.nodes.MessageBugServer` - a message bus server

* `cloudify.nodes.ApplicationModule` - a base type for any application module or artifact



# CloudifyManager Type

`cloudify.nodes.CloudifyManager` is a type for a Cloudify Manager, meant for use in [manager blueprints](reference-terminology.html#manager-blueprints).

It currently has two configuration properties: `cloudify` and `cloudify_packages`:

## cloudify

### description
Configuration for Cloudify Manager

### schema
{% highlight yaml %}
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
    plugins:
        my_plugin1:
            source {plugin_source}
            install_args: {install_args}
        my_plugin2:
            ...
{%endhighlight%}

### parameters details
* `resources_prefix` An optional prefix to be added to all resources' names. It is recommended for the prefix to end with an underscore or a dash. If omitted, no prefix will be added (Default: `""`)
* cloudify_agent
  * `min_workers` Celery autoscale parameter - the minimum number of workers on an agent machine. See [Autoscaling](http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling) (Default: `2`).
  * `max_workers` Celery autoscale parameter - the maximum number of workers on an agent machine. See [Autoscaling](http://docs.celeryproject.org/en/latest/userguide/workers.html#autoscaling) (Default: `5`).
  * `remote_execution_port` The default port that will be used to run commands on agents (Default: `22`).
  * `user` The default user that will be used to connect with agent machines. If omitted, then this will have to be specified in the blueprints in the agent node or type properties (Default: `ubuntu`)
* workflows
  * `task_retries` Number of retries for a failing workflow task. -1 means infinite retries (Default: `-1`).
  * `task_retry_interval` Minimum wait time (in seconds) in between workflow task retries (Default: `30`).
* policy_engine
  * `start_timeout` Timeout (in seconds) for waiting for the policy engine to come up (Default: `30`).
* plugins: a dict of python packages to install on the management server.
  * `source` URL of package archive or path to package directory relative to the manager blueprint root directory.
  * `install_args` Optional arguments that should be passed to the `pip install` command used to install the package.

## cloudify_packages

### description
Links to Cloudify packages to be installed on the manager

### schema
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

### parameters details

* server
  * `components_package_url` The URL for the Cloudify components package (Default: a URL of the relevant package).
  * `core_package_url` The URL for the Cloudify core package (Default: a URL of the relevant package).
  * `ui_package_url` The URL for the Cloudify UI package. If provided with an empty string, the UI won’t be installed (Default: a URL of the relevant package).
* agents
  * `ubuntu_agent_url` The URL for the Ubuntu agent package. If provided with an empty string, no package will be downloaded (Default: a URL of the relevant package).
  * `centos_agent_url` The URL for the CentOS agent package. If provided with an empty string, no package will be downloaded (Default: a URL of the relevant package).
  * `windows_agent_url` The URL for the Windows agent package. If provided with an empty string, no package will be downloaded (Default: a URL of the relevant package).
