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
