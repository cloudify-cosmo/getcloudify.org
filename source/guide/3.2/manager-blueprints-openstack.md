---
layout: bt_wiki
title: Openstack Manager Blueprint Reference
category: Manager Blueprints
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on Openstack"
pageord: 1000
---

{%summary%} This page serves as a reference to the Openstack manager blueprint, which is used for bootstrapping Cloudify on Openstack {%endsummary%}


{%note title=Note%}
This reference only explains the structure and various values in the blueprint. For better understanding of it, make yourself familiar with [Cloudify blueprints DSL](guide-blueprint.html), the [Cloudify Openstack plugin](plugin-openstack.html), and the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).
{%endnote%}

# Inputs

## Required inputs

* `keystone_username` Username on Openstack.
* `keystone_password` Password on Openstack.
* `keystone_tenant_name` Tenant name on Openstack.
* `keystone_url` Authorization endpoint (AKA *Keystone*) URL.
* `region` Region on Openstack (e.g. "region-b.geo-1").
* `manager_public_key_name` The name on Openstack of the keypair that will be used with the Cloudify manager.
* `agent_public_key_name` The name on Openstack of the keypair that will be used with Cloudify agents.
* `image_id` The id of the image to be used for the Cloudify manager host (Ensure compatibility with the [Prerequisites section](installation-general.html#prerequisites)).
* `flavor_id` The id of the flavor to be used for the Cloudify manager host (Ensure compatibility with the [Prerequisites section](installation-general.html#prerequisites)).
* `external_network_name` The name of the external network on Openstack.

## Optional inputs
* `use_existing_manager_keypair` A flag for using an existing manager keypair (should exist both on Openstack with `manager_public_key_name` as its name, and locally at `manager_private_key_path`).
* `use_existing_agent_keypair` A flag for using an existing agent keypair (should exist both on Openstack with `agent_public_key_name` as its name, and locally at `agent_private_key_path`).
* `manager_server_name` The name for the manager server on Openstack.
* `manager_server_user` The name of the user that will be used to access the Cloudify manager (Default: `ubuntu`).
* `manager_server_user_home` The path to the home directory on the Cloudify manager of the user that will be used to access it (Default: `/home/ubuntu`).
* `manager_private_key_path` The path on the local machine to the private key file that will be used with the Cloudify manager. This key should match the public key that is set for the `manager_public_key_name` input (Default: `~/.ssh/cloudify-manager-kp.pem`).
* `agent_private_key_path` The path on the local machine to the private key file that will be used with Cloudify agents. This key should match the public key that is set for the `agent_public_key_name` input (Default: `~/.ssh/cloudify-agent-kp.pem`).
* `agents_user` The default username to be used when connecting into applications' agent VMs (for agent installtion).
* `nova_url` Explicit URL for Openstack Nova (compute) service endpoint.
* `neutron_url` Explicit URL for Openstack Neutron (networking) service endpoint.
* `resources_prefix` Resource prefix to be attached to cloud resources' names.
* `use_external_resource` If true, it will be used theexternal network to which the router connects for access to the outer world
* `management_network_name` The name of the management network.
* `management_subnet_name` The subnet name.
* `management_router` The router name.
* `manager_security_group_name` The name for your management security group.
* `agents_security_group_name` The name for your agents security group.
* `manager_port_name` The name of the port to be associated with the manager server.
* `manager_volume_name` The name of the volume to the attached to the manager server.

{%tip title=Tip%}
Some of the required inputs may actually be left empty when appropriate, standard Openstack environment variables are set in place before calling the `cfy bootstrap` command. These variables are:

  - *OS_USERNAME* (sets `keystone_username`)
  - *OS_PASSWORD* (sets `keystone_password`)
  - *OS_TENANT_NAME* (sets `keystone_tenant_name`)
  - *OS_AUTH_URL* (sets `keystone_url`)
  - *OS_REGION_NAME* (sets `region`)

These settings are available in the Openstack Horizon dashboard (Look for API credentials).

Note that in order to enable this, these inputs technically have an empty (`""`) default value. This, however, does not mean they're not mandatory.

Additionally, the following optional inputs may also be set by using standard Openstack environment variables:

  - *NOVACLIENT_BYPASS_URL* (sets `nova_url`)
  - *OS_URL* (sets `neutron_url`)

{%endtip%}


# Topology

The blueprint builds the following topology on Openstack:

  - An internal network and subnet (layer 3 network), for communication between the Cloudify manager and Cloudify agent machines (that may be created later in a separate process).
  - A router which connects the internal network to the external network, for connectivity between the Cloudify manager and the outside world.
  - A floating IP for the Cloudify manager machine.
  - A server which will host the Cloudify manager.
  - Two security groups, one for the Cloudify manager machine and another for Cloudify agent machines.
  - Two keypairs, one for the Cloudify manager machine and another for Cloudify agent machines.
  - A **Neutron** port which connects the manager server to the appropriate network and security group.
  - A **Cinder** volume which will store all docker related files.


# Nodes

The "Openstack manager" blueprint contains the following nodes:

  - *management_keypair* - A keypair for connecting to the Cloudify Manager machine.
  - *agent_keypair* - A keypair for connecting to Cloudify agent machines.
  - *management_network* - An internal network for communication between the Cloudify manager and agent machines.
  - *management_subnet* - A subnet (layer 3 network) for the management network.
    - The `cidr` is arbitarily set to be `10.67.79.0/24`.
  - *router* - A router which connects the internal network to the external network.
  - *agents_security_group* - A security group that will be enforced on any Cloudify agents machines.
    - This security group has the following ports open for incoming connections from the internal network:
      - 22 (SSH)
      - 5985 (WinRM)
  - *management_security_group* - A security group that will be enforced on the Cloudify manager machine.
    - This security group has the following ports open for incoming connections from anywhere:
      - 22 (SSH)
      - 80 (HTTP)
    - This security group also opens these ports for incoming connections from the internal network:
      - 5672 (RabbitMQ)
      - 53229 (File server)
  - *manager_server_ip* - A floating IP which will be associated with the Cloudify manager machine.
  - *external_network* - The external network, to which the router connects for access to the outer world. The external network is expected to already exist (hence the `use_external_resource: true` setting).
  - *manager_server* - The server on which the Cloudify manager will be installed.
  - *openstack_configuration* - A node which represents configuration settings for connecting with Openstack.
  - *manager_port* - This is a node of type `cloudify.openstack.nodes.Port`, which will serve as the manager server's entry point to network configuration. Its purpose is to acquire a fixed private ip inside the *management_subnet*, this will enable the assignment of the same private ip to a different host, in case the manager server fails. It defines 3 relationships, to various network related nodes.
    - `cloudify.relationships.contained_in` --> *management_network*
    - `cloudify.relationships.depends_on` --> *management_subnet*
    - `cloudify.openstack.port_connected_to_security_group` --> *management_security_group*
  - *volume* - This is a node of type `cloudify.openstack.nodes.Volume`, which will serve as the manager server's persistent storage device. Its purpose is to store all docker related files, in order to be able to recover from a machine failure.
  - *manager_data* - This is a node of type `cloudify.nodes.FileSystem`, it will create a mount point on the manager server, that is mounted on the volume node. Its purpose is to mount the */var/lib/docker* directory on the manager server to a cinder volume. By doing so, all the information docker will write to this directory, will be persisted even if the server is terminated or is inaccessible. To achieve this, it defines 2 relationships:
    - `cloudify.relationships.file_system_depends_on_volume` --> *volume*
    - `cloudify.relationships.file_system_contained_in_compute` --> *manager_server*
  - *manager* - The node which represents the manager. You may find more information about this node in the [Types Reference](#reference-types.html#cloudifymanager-type) section as well as in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).


# Configuration Operations

The *manager's* node *configure* lifecycle operation is mapped to a method in the configure.py module which takes the following actions:

  - It sets the *provider context*, which will be used by the Openstack plugin when installing applications at later stages.
  - It creates a file on the Cloudify manager server, which holds the configuration settings for connecting with Openstack. This file will be used by the Openstack plugin when installing applications at later stages.
<<<<<<< HEAD
=======

# Recovery

This manager blueprint provides support for recovering from manager failures.

## What do we mean?

Well, think of a scenario where you have already uploaded some blueprints
and created deployment using this manager. If at a certain point, for some
reason, the VM hosting the manager crashes, or maybe even the docker
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

From this point onwards, you can execute the *recover* command if the manager
is malfunctioning.

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
>>>>>>> master
