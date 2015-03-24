---
layout: bt_wiki
title: Host Pool Plugin
category: Plugins
publish: true
abstract: Cloudify Host Pool plugin description and configuration
pageord: 600
---
{%summary%}
{%endsummary%}


# Description

The [Host Pool plugin](https://github.com/cloudify-cosmo/cloudify-host-pool-plugin) interacts with the [Host Pool service](https://github.com/cloudify-cosmo/cloudify-host-pool-service).

Host Pool Service allows to use existing machines for deploying services and applications.


# Plugin Requirements

* Python Versions:
    * 2.7.x


# Types

## cloudify.hostpool.nodes.Host

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Mapped Operations:**

* `cloudify.interfaces.lifecycle.start` acquires a host from the Host Pool service.

    Inputs:
    * `service_url` - the url of the running Host Pool Service

* `cloudify.interfaces.lifecycle.delete` releases a host from the Host Pool service.

    Inputs:
    * `service_url` - the url of the running Host Pool Service

Runtime property `cloudify_agent` set in `cloudify.interfaces.lifecycle.start` operation is provided as an input to the following agent worker installer operations:

Inputs:
 
* `cloudify_agent`:
     * `user` the administrator username.
     * `key` the keyfile for the administrator user.
     * `password` the password for the administrator user. 
     * `port` port of the available connection.

Each of the above keys inside `cloudify_agent` has its default value (and is optional).

Operations:

* `cloudify.interfaces.worker_installer.install` installs agent worker on the agent machine.
* `cloudify.interfaces.worker_installer.start` starts the agent worker.
* `cloudify.interfaces.worker_installer.stop` stops the agent worker.
* `cloudify.interfaces.worker_installer.uninstall` uninstalls the agent worker.
* `cloudify.interfaces.worker_installer.restart` restarts the agent worker.

## cloudify.hostpool.nodes.WindowsHost

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

Windows host type has the same mapped operations as `cloudify.hostpool.nodes.Host` but uses windows agent worker installer. Use this type when working with a Windows node.


## Runtime Properties

Node instances of all types defined in this plugin are provided with the following runtime properties during the `cloudify.interfaces.lifecycle.start` operation:

* `ip` the private IP (ip on the internal network) of the server.
* `cloudify_agent` node's authentication information, as retrieved from the Host Pool service:
    * `user` the administrator username.
    * `key` the keyfile for the administrator user.
    * `password` the password for the administrator user. 
    * `port` port of the available connection.

# Example

This example will show how to use most of the types in this plugin.

{% togglecloak id=1 %}
Example
{% endtogglecloak %}

{% gcloak 1 %}

{% highlight yaml %}
inputs:
  hostpool_service_url:
    type: string
    description: >
      The url of the host pool service to acquire and release nodes.

node_templates:

  example_host:
    type: cloudify.hostpool.nodes.Host
    interfaces:
      cloudify.interfaces.lifecycle:
          start:
            inputs:
              service_url: { get_input: hostpool_service_url }
          delete:
            inputs:
              service_url: { get_input: hostpool_service_url }

  example_node:
    type: cloudify.nodes.Root
    interfaces:
      cloudify.interfaces.lifecycle:
        configure: script/start.sh
    relationships:
      - type: cloudify.relationships.contained_in
        target: example_host
{% endhighlight %}

Node by node explanation:

1. Creates an `example_host` of type `cloudify.hostpool.nodes.Host`. This allows automatic allocation of the nodes using host acquisition mechanism of Host Pool plugin. Do not override neither `start` nor `delete` `cloudify.interfaces.lifecycle` operations.

2. Creates an `example_node` contained in the `example_host` node. In this node you can override all `cloudify.interfaces.lifecycle` operations.

{% endgcloak %}
