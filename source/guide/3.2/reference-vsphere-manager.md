---
layout: bt_wiki
title: vSphere Manager Reference
category: Reference
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on vSphere"
pageord: 1000
---

{%summary%} This page serves as a reference to the vSphere manager blueprint, which is used for bootstrapping Cloudify on vSphere {%endsummary%}


{%note title=Note%}
This reference only explains the structure and various values in the blueprint. For better understanding of it, make yourself familiar with [Cloudify blueprints DSL](guide-blueprint.html), the [Cloudify vSphere plugin](plugin-vsphere.html), and the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).
{%endnote%}

# Inputs

## Required inputs
* `vsphere_username` Username on vSphere.
* `vsphere_password` Password on vSphere.
* `vsphere_host` vSphere host name, or IP address.
* `manager_server_template` Virtual machine template from which server will be spawned.

## Optional inputs
* `vsphere_port` port which vCenter Server system uses to monitor data transfer from SDK clients. Default is 443.
* `vsphere_datacenter_name`  Datacenter name. Default is 'Datacenter'.
* `vsphere_resource_pool_name` Resource pool name. Default is 'Resources'.
* `vsphere_auto_placement` Signifies if server is to be automatically placed on a host. Default is 'false'.
* `manager_server_name` Name of the management server. Default is 'cloudify-management-server'.
* `manager_server_cpus` Number of cpus. Default is 2.
* `manager_server_memory` Amount of RAM, in MB. Default is 4096.
* `manager_server_domain` The fully qualified domain name. Default is ''.
* `external_network_name` Network name. Default is 'DMZ'.
* `external_network_use_dhcp` Use DHCP to obtain an IP address. Default is 'true'.
* `external_network_cidr` Network CIDR (for example, 10.0.0.0/24). It will be used by the plugin only when `use_dhcp` is false. Default is ''.
* `external_network_gateway` Network gateway IP. It will be used by the plugin only when `use_dhcp` is false. Default is ''.
* `external_network_switch_distributed` Signifies if network is connected to a distributed switch. Default is 'false'.
* `management_network_name` Network name. Default is 'Management'.
* `management_network_use_dhcp` Use DHCP to obtain an IP address. Default is 'true'.
* `management_network_cidr` Network CIDR (for example, 10.0.0.0/24). It will be used by the plugin only when `use_dhcp` is false. Default is ''.
* `management_network_gateway` Network gateway IP. It will be used by the plugin only when `use_dhcp` is false. Default is ''.
* `management_network_switch_distributed` Signifies if network is connected to a distributed switch. Default is 'false'.
* `management_network_ip` Server IP address. It will be used by the plugin only when `use_dhcp` is false. Default is ''.
* `manager_server_user` User account on manager server. Default is 'ubuntu'.
* `manager_server_user_home` Path to the user home directory. Default is '/home/ubuntu'.
* `manager_private_key_path` Path to RSA key which will be used for ssh connection to manager server. Default is '~/.ssh/cloudify-manager-kp.pem'.
* `agent_private_key_path` Path to RSA key which will be used for ssh connection to manager agent. Default is '~/.ssh/cloudify-agent-kp.pem'.
* `agents_user` The default username to be used when connecting into applications' agent VMs (for agent installtion). Default is 'ubuntu'.
* *resources_prefix` Resource prefix to be attached to cloud resources names. Default is ''.

# Topology

The blueprint builds the following topology on vSphere:

  - vSphere routed network for communication between the Cloudify manager and Cloudify agent machines.
  - vSphere external network for get access to the Cloudify manager from the internet.
  - A server which will host the Cloudify manager.


# Nodes

The blueprint contains the following nodes:
- *manager_server* - The server on which the Cloudify manager will be installed.
- *connection_configuration* - A node which represents configuration settings for connecting with vSphere.
- *manager* - The node which represents the manager. You may find more information about this node in the [Types Reference](#reference-types.html#cloudifymanager-type) section as well as in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).

# Configuration Operations

The *manager's* node *configure* lifecycle operation is mapped to a method in the configure.py module. It creates a file on the Cloudify manager server, which holds the configuration settings for connecting with vSphere. This file can be used by the vSphere plugin when installing applications.
