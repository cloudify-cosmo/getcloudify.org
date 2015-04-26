---
layout: bt_wiki
title: Host-Pool Plugin
category: Plugins
publish: true
abstract: "Cloudify Host-Pool plugin description and configuration"
pageord: 900
---
{%summary%}
{%endsummary%}

# Description

The [Host Pool plugin](https://github.com/cloudify-cosmo/cloudify-host-pool-plugin) allows for the use of multiple existing hosts to be allocated for a deployment.
It interacts with Cloudify's [Host-Pool Service](https://github.com/cloudify-cosmo/cloudify-host-pool-service), which performs the book-keeping as to which hosts are allocated, free, or un-reachable.

# Host-Pool Service

The Host-Pool Service is a web service designed for managing a large pool of hosts to be used by cloudify deployments.
The Host-Pool-Plugin will make calls to this service each time a new host
needs to be provisioned/terminated.

To make the installation of this service easy, we have made it available as a regular cloudify node type.

## cloudify.nodes.HostPoolService

**Derived From:** [cloudify.nodes.SoftwareComponent](reference-types.html)

**Properties:**

  * `pool` relative path to a pool configuration file. This is where you define all the hosts participating in the pool.
  * `directory` the directory to run the service from inside the host. Defaults to `/tmp/cloudify-host-pool-service`
  * `port` the port to run the service on. Defaults to `8080`
  * `source` the source code of the service. Defaults to `https://github.com/cloudify-cosmo/cloudify-host-pool-service/archive/master.zip`

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the necessary directories and installs dependencies.
  * `cloudify.interfaces.lifecycle.configure` creates the service configuration file based on information in the properties.
  * `cloudify.interfaces.lifecycle.start` starts the service.
  * `cloudify.interfaces.lifecycle.stop` stops the service.
  * `cloudify.interfaces.lifecycle.delete` deletes the service working directory.

**Attributes:**

  * `private_endpoint` the url of the service. this URL is only accessible from within the same network as the host itself.

{%info title=Information%}
Complete definition of this type can be found [Here](https://github.com/cloudify-cosmo/cloudify-host-pool-service/blob/master/host-pool-service.yaml)

You must have a running Host-Pool Service before you can start using the Plugin
{%endinfo%}


# Examples

{% togglecloak id=1 %}
Local Installation
{% endtogglecloak %}

{% gcloak 1 %}
This example will show how to install the service on you local machine using a cloudify local blueprint. it also presents an example configuration file.
The following is an excerpt from the complete blueprint located [Here](https://github.com/cloudify-cosmo/cloudify-host-pool-service/blob/master/examples/local-blueprint) 
{% highlight yaml %}

node_templates:

  host:
    type: cloudify.nodes.Compute
    properties:
      install_agent: false
      ip: localhost

  host_pool_service:
    type: cloudify.nodes.HostPoolService
    properties:
      pool: pool.yaml
    relationships:
      - type: cloudify.relationships.contained_in
        target: host

{%endhighlight%}

{% endgcloak %}

{% togglecloak id=2 %}
Pool Configuration File
{% endtogglecloak %}

{% gcloak 2 %}
This [example](https://github.com/cloudify-cosmo/cloudify-host-pool-service/blob/master/examples/local-blueprint/pool.yaml) shows how to create a pool configuration file to be supplied to the Host-Pool Service.

{% endgcloak %}


# Plugin Requirements

* Python Versions:
    * 2.7.x
    * 2.6.x

# Types

## cloudify.hostpool.nodes.Host

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` acquires a host from the Host Pool service.
    * **Inputs:**
      * `service_url` the url of the running Host Pool Service.
  * `cloudify.interfaces.lifecycle.delete` releases a host from the Host Pool service.
    * **Inputs:**
      * `service_url` the url of the running Host Pool Service.

**Attributes:**

  * `ip` the private ip of the host.
  * `user` the username of the host.
  * `port` the authentication port of this host.
  * `public_address` the public address of the host.
  * `password` the password of the host.
  * `key` the content of the keyfile used to login to the host.

{%note title=Note%}
All of the above attributes are actually the host details as passed to
 the Host-Pool Service in the pool configuration file.
{%endnote%}

  * `host_id` the id assigned to this host by the Host-Pool Service.

## cloudify.hostpool.nodes.WindowsHost

**Derived From:** cloudify.hostpool.nodes.Host

This type has the same properties and operations-mapping as the type above (as it derives from it), yet it overrides some of the agent and plugin installations operations-mapping derived from the [built-in cloudify.nodes.Compute type](reference-types.html). Use this type when working with a Windows server.

# Example

{% togglecloak id=3 %}
Example
{% endtogglecloak %}

{% gcloak 3 %}
The following is an example of using the host-pool-plugin node types.

{% highlight yaml %}

imports:
  - http://www.getcloudify.org/spec/cloudify/3.2rc1/types.yaml
  - http://www.getcloudify.org/spec/host-pool-plugin/1.2rc1/plugin.yaml

node_templates:

  host_from_pool:
    type: cloudify.hostpool.nodes.Host
    interfaces:
      cloudify.interfaces.lifecycle:
        create:
          inputs:
            service_url: http://{host-pool-service-ip}:{host-pool-service-port}              

{%endhighlight%}

{% endgcloak %}