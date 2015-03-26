---
layout: bt_wiki
title: Openstack Docker Manager Reference
category: Reference
publish: true
abstract: "Reference on how to bootstrap a Cloudify DOcker manager on Openstack"
pageord: 1000
---

{%summary%} This page serves as a reference to the Openstack Docker manager blueprint,
which is used for bootstrapping the Cloudify Manager docker container on Openstack
{%endsummary%}


{%note title=Note%}
This way of bootstrapping is very similar to the regular non docker way, described [Here](reference-openstack-manager.html).
Therefore, only the differences between the two will be detailed.
{%endnote%}

# Inputs

## Optional inputs

Two additional optional inputs are defined:

* `manager_port_name` The name of the port to be associated with the manager server.
* `manager_volume_name` The name of the volume to the attached to the manager server.

# Topology

Two additional resources will be created as part of the topology:

  - A **Neutron** port which connects the manager server to the appropriate network and security group.
  - A **Cinder** volume which will store all docker related files.

# Nodes

The "Openstack Docker manager" blueprint adds the following nodes:

  - *manager_port* - This is a node of type `cloudify.openstack.nodes.Port`, which will serve as the manager server's entry point to network configuration.
  it defines 3 relationships, to various network related nodes.
    - `cloudify.relationships.contained_in` --> *management_network*
    - `cloudify.relationships.depends_on` --> *management_subnet*
    - `cloudify.openstack.port_connected_to_security_group` --> *management_security_group*

  Its purpose is to acquire a fixed private ip inside the *management_subnet*,
  this will enable the assignment of the same private ip to a different host, in case the manager server fails.

  - *volume* - This is a node of type `cloudify.openstack.nodes.Volume`, which will serve as the manager server's persistent storage device.
  Its purpose is to store all docker related files, in order to be able to recover from a machine failure.

  - *manager_data* - This is a node of type `cloudify.nodes.FileSystem`, it will create a mount point on the manager server, that is mounted on the volume node.
  To achieve this, it defines 2 relationships:
    - `cloudify.relationships.file_system_depends_on_volume` --> *volume*
    - `cloudify.relationships.file_system_contained_in_compute` --> *manager_server*

  Its purpose is to mount the */var/lib/docker* directory on the manager server to a cinder volume. By doing so, all the information docker will write to this directory,
  will be persisted even if the server is terminated or is inaccessible.

{%note title=Note%}
Some additional changes were made to the manager node's lifecycle operation mappings.
You can see a detailed explanation on the manager node [Here](guide-authoring-manager-blueprints.html)
{%endnote%}

# Recovery

This manager blueprint provides support for recovering from manager failures.

## What do we mean?

Well, think of a scenario where you have already uploaded some blueprints
and created deployment using this manager. If at a certain point, for some
reason, the VM hosting the manager crashes, of maybe even the docker
container inside the VM is no longer available, it would be nice to have the
ability to spin up another VM and use it as our management server.

## How is this possible?

This is where some of the cloud awesomeness comes in to play. This manager
blueprint defines 3 crucial types for making this happen:

- `cloudify.openstack.nodes.FloatingIP` - Provides a way to have a fixed,
detachable public ip for VM's.

- `cloudify.openstack.nodes.Port` - Provides a way to have a fixed,
detachable private ip for VM's.

- `cloudify.openstack.nodes.Volume` - Provides a way to have a persistent,
detachable block storage device for VM's.

Having all of these types available makes recovery a rather straightforward
process:

1. Detach floating ip, port and volume from server.
2. Terminate the server.
3. Spin up a new server.
4. Attach floating ip, port and volume to new server.

If you think about it, this flow exactly describes a *heal* workflow, where
the failing node instance is the management server.
In fact, what we do under the hood is simply call the *heal* workflow in
this manner.

{%tip title=Tip%}
The *heal* workflow is a generic workflow that allows for the recovery from
any node instance failure. To learn more see [Heal Workflow](reference-builtin-workflows.html#heal)
{%endtip%}

## Usage

To use this ability we have added a new command in our [CLI](reference-cfy
.html) called *cfy recover*.

You can use this command from any machine, not necessarily the machine you
used to bootstrap your manager. To run it from a different
machine, like all other cloudify commands, you must first execute the *cfy
use* command.
For example, if we have a manager on ip 192.168.11.66:

{% highlight bash %}
cfy use -t 192.168.11.66
{% endhighlight %}

From this point onwards, you can execute the *recover* command if the
manager is
malfunctioning.

{%note title=Note%}
This command is somewhat destructive, since it will stop and delete
resources, for this reason, using it will require passing the *force* flag.
{%endnote%}

Like we already mentioned, eventually, running the *recover*
will trigger the *heal* workflow, so the output will look something like this:

{% highlight bash %}
cfy recover -f
Recovering manager deployment
2015-02-17 16:21:21 CFY <manager> Starting 'heal' workflow execution
2015-02-17 16:21:21 LOG <manager> INFO: Starting 'heal' workflow on manager_15314, Diagnosis: Not provided
2015-02-17 16:21:22 CFY <manager> [manager_15314] Stopping node
...
...
2015-02-17 16:22:02 CFY <manager> [manager_server_1eed2->manager_server_ip_3978e|unlink] Task started 'nova_plugin.server.disconnect_floatingip'
2015-02-17 16:22:12 CFY <manager> [manager_server_1eed2->manager_port_ceb8e|unlink] Sending task 'neutron_plugin.port.detach' [attempt 2/6]
2015-02-17 16:22:30 CFY <manager> [manager_server_1eed2->manager_server_ip_3978e|unlink] Task succeeded 'nova_plugin.server.disconnect_floatingip'
2015-02-17 16:22:30 CFY <manager> [manager_server_1eed2->manager_port_ceb8e|unlink] Task started 'neutron_plugin.port.detach' [attempt 2/6]
2015-02-17 16:22:36 LOG <manager> [manager_server_1eed2->manager_port_ceb8e|unlink] INFO: Detaching port 226704ce-fae5-4c2b-aa82-234515ef9e13...
2015-02-17 16:22:37 LOG <manager> [manager_server_1eed2->manager_port_ceb8e|unlink] INFO: Successfully detached port 226704ce-fae5-4c2b-aa82-234515ef9e13
2015-02-17 16:22:37 CFY <manager> [manager_server_1eed2->manager_port_ceb8e|unlink] Task succeeded 'neutron_plugin.port.detach' [attempt 2/6]
...
...
2015-02-17 16:26:42 LOG <manager> [manager_15314.start] INFO: waiting for cloudify management services to restart
2015-02-17 16:27:35 LOG <manager> [manager_15314.start] INFO: Recovering deployments...
...
...
2015-02-17 16:27:42 CFY <manager> 'heal' workflow execution succeeded
Successfully recovered manager deployment
{% endhighlight %}


{%warning title=Limitations%}
<br>
There are a few scenarios where the recovery workflow will not function
properly and is not supported:

* In case the management server VM was terminated using the Openstack API, the associated port will also be deleted. This means we wont have any way of ensuring the new server will have the same private ip as before, which is necessary for agents to communicate with the manager.
* In case the *cfy* container was explicitly removed from the manager VM by executing *docker rm -f cfy*. This command will cause the docker daemon to remove this container from its internal state, and thus wont be started on the new VM.
{%endwarning%}


