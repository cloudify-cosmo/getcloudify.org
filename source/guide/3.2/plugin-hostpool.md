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

The Host Pool plugin is an interface to [Host Pool service](https://github.com/cloudify-cosmo/cloudify-host-pool-service).

Host Pool Service allows to use an existing environment infrastructure for deploying services and applications.


# Plugin Requirements

* Python Versions:
    * 2.7.x


# Types

## cloudify.hostpool.nodes.Host

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.start` acquires the host from the Host Pool service and sets runtime properties.
  * `cloudify.interfaces.lifecycle.delete` releases the host from the Host Pool service.

Runtime properties set in `cloudify.interfaces.lifecycle.start` operation are provided as inputs to the following agent worker installer operations:
  * `cloudify.interfaces.worker_installer.install` installs agent worker on the agent machine using runtime parameters.
  * `cloudify.interfaces.worker_installer.start` starts the agent worker.
  * `cloudify.interfaces.worker_installer.stop` stops the agent worker.
  * `cloudify.interfaces.worker_installer.uninstall` uninstalls the agent worker.
  * `cloudify.interfaces.worker_installer.restart` restarts the agent worker.

## cloudify.hostpool.nodes.WindowsHost

**Derived From:** [cloudify.openstack.nodes.Compute](#cloudifyopenstackserver)

Windows host type has the same mapped operations as default one but uses windows agent worker installer. Use this type when working with a Windows node.


## Runtime Properties

Node instances of any of the types defined in this plugin get set with the following runtime properties during the `cloudify.interfaces.lifecycle.start` operation:

  * `ip` the private IP (ip on the internal network) of the server.
  * `cloudify_agent` node's authentication information, as retrieved from the Host Pool service:
    * `user` the administrator username.
    * `key` the keyfile for the administrator user.
    * `password` the password for the administrator user. 
    * `port` port of the available connection.

# Example

This example will show how to use most of the types in this plugin on the [Node Cellar example](https://github.com/cloudify-cosmo/cloudify-nodecellar-example).

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

  mongod_host:
    type: cloudify.hostpool.nodes.Host
    interfaces:
      cloudify.interfaces.lifecycle:
          start:
            inputs:
              service_url: { get_input: hostpool_service_url }
          delete:
            inputs:
              service_url: { get_input: hostpool_service_url }

  mongod:
    type: nodecellar.nodes.MongoDatabase
    properties:
      port: 27017
    interfaces:
      cloudify.interfaces.lifecycle:
        configure: scripts/mongo/install-pymongo.sh
    relationships:
      - type: cloudify.relationships.contained_in
        target: mongod_host

  nodejs_host:
    type: cloudify.hostpool.nodes.Host
    interfaces:
      cloudify.interfaces.lifecycle:
          start:
            inputs:
              service_url: { get_input: hostpool_service_url }
          delete:
            inputs:
              service_url: { get_input: hostpool_service_url }

  nodejs:
    type: nodecellar.nodes.NodeJSServer
    relationships:
      - type: cloudify.relationships.contained_in
        target: nodejs_host

  nodecellar:
    type: nodecellar.nodes.NodecellarApplicationModule
    properties:
      port: 8080
    relationships:
      - type: node_connected_to_mongo
        target: mongod
      - type: node_contained_in_nodejs
        target: nodejs
{%endhighlight%}

Node by node explanation:

1. Creates a mongod_host node that is `cloudify.hostpool.nodes.Host` type.

2. Creates a mongod - database that has `cloudify.relationships.contained_in` relationship to the mongod_host. This allows automatic allocation of the nodes using host acquisition mechanism of Host Pool plugin.

3. Creates a nodejs_host node that is `cloudify.hostpool.nodes.Host` type. 

4. Creates a nodejs server that has `cloudify.relationships.contained_in` relationship to the nodejs_host. This allows automatic allocation of the nodes using host acquisition mechanism of Host Pool plugin.

5. Creates a nodecellar node that has `node_contained_in_nodejs` relationship to the nodejs server and `node_connected_to_mongo` to the mongo database.
{% endgcloak %}
