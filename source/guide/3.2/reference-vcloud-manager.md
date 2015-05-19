---
layout: bt_wiki
title: vCloud Manager Reference
category: Reference
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on vCloud"
pageord: 1000
---

{%summary%} This page serves as a reference to the vCloud manager blueprint, which is used for bootstrapping Cloudify on vCloud {%endsummary%}


{%note title=Note%}
This reference only explains the structure and various values in the blueprint. For better understanding of it, make yourself familiar with [Cloudify blueprints DSL](guide-blueprint.html), the [Cloudify vCloud plugin](plugin-vcloud.html), and the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).
{%endnote%}

# Inputs

## Required inputs

* `vcloud_username` Username on vCloud.
* `vcloud_password` Password on vCloud.
* `vcloud_url` vCloud URL.
* `vcloud_service` vCloud service name
* `vcloud_org` vCloud organization name
* `vcloud_vdc` vCloud Virtual Datacenter name
* `manager_server_name` Manager name
* `manager_server_catalog` VApp templates catalog
* `manager_server_template` VApp template from which server will be spawned
* `management_network_name` management network name
* `edge_gateway` Edge Gateway name
* `manager_public_key` manager public ssh key
* `agent_public_key` agent public ssh key

## Optional inputs
* `vcloud_service_type` vCloud service type. Default is 'subscription'.
* `vcloud_region` OnDemand region name.
* `vcloud_org_url` Only required if using token based login on a private vcloud director. This can be obtained by following the vcloud API example docs.
* `manager_server_cpus` manager VM cpu count. Default is 2.
* `manager_server_memory` manager VM memory size. Default is 4096.
* `management_network_use_existing` Default is false.
* `management_port_ip_allocation_mode` IP allocation mode for manager Port (Default: `dhcp`).
* `management_port_ip_address` If IP allocation mode was set to `manual` this will be used as Port ip address (Default: `''`).
* `management_network_public_ip` Management network public ip to allow internet access from the network. If empty string is specified, then public will be allocated from a pool of free public ips (Default: `''`).
* `management_network_public_nat_use_existing` Default is false.
* `floating_ip_public_ip` Manager public ip. If empty string is specified, then public will be allocated from a pool of free public ips (Default: `''`).
* `manager_server_user` The name of the user that will be used to access the Cloudify manager (Default: `ubuntu`).
* `manager_private_key_path` The path on the local machine to the private key file that will be used with the Cloudify manager (Default: `~/.ssh/cloudify-manager-kp.pem`).
* `agent_private_key_path` The path on the local machine to the private key file that will be used with Cloudify agents (Default: `~/.ssh/cloudify-agent-kp.pem`).
* `agents_user` The default username to be used when connecting into applications' agent VMs (for agent installtion).
* `resources_prefix` Resource prefix to be attached to cloud resources' names.


# Topology

The blueprint builds the following topology on vCloud:
  
  - vCloud routed network for communication between the Cloudify manager and Cloudify agent machines.
  - A floating IP for the Cloudify manager machine.
  - A port to connect Cloudify Manager to management network.
  - A server which will host the Cloudify manager.


# Nodes

The blueprint contains the following nodes:

  - *management_network* - A vCloud routed network for communication between the Cloudify manager and agent machines.
  - *management_network_internet_access* - SNAT rule to enable internet access from management network.
  - *management_port* - connection between Manager Server and Management Network.
  - *manager_floating_ip* - A floating IP which will be associated with the Cloudify manager machine.
  - *manager_server* - The server on which the Cloudify manager will be installed.
  - *vcloud_configuration* - A node which represents configuration settings for connecting with vCloud.
  - *manager* - The node which represents the manager. You may find more information about this node in the [Types Reference](#reference-types.html#cloudifymanager-type) section as well as in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).


# Configuration Operations

The *manager's* node *configure* lifecycle operation is mapped to a method in the configure.py module. It creates a file on the Cloudify manager server, which holds the configuration settings for connecting with vCloud. This file can be used by the vCloud plugin when installing applications.