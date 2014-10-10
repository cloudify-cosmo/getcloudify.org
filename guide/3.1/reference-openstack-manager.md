---
layout: bt_wiki
title: Openstack Manager Reference
category: Reference
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on Openstack"
pageord: 400
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
* `manager_server_user` The name of the user that will be used to access the Cloudify manager (Default: `ubuntu`).
* `manager_server_user_home` The path to the home directory on the Cloudify manager of the user that will be used to access it (Default: `/home/ubuntu`).
* `manager_private_key_path` The path on the local machine to the private key file that will be used with the Cloudify manager. This key should match the public key that is set for the `manager_public_key_name` input (Default: `~/.ssh/cloudify-manager-kp.pem`).
* `agent_private_key_path` The path on the local machine to the private key file that will be used with Cloudify agents. This key should match the public key that is set for the `agent_public_key_name` input (Default: `~/.ssh/cloudify-agent-kp.pem`).
* `cloudify_packages` See [manager common configuration section](reference-manager-common-configuration.html#cloudifypackages).
* `cloudify` See the relevant [manager common configuration section](reference-manager-common-configuration.html#cloudify).

{%tip title=Tip%}
The first four required inputs (the keystone inputs) may be left empty when appropriate environment variables are set in place before calling the `cfy bootstrap` command. These variables (in their respective order) are:

  - *OS_USERNAME* 
  - *OS_PASSWORD*
  - *OS_TENANT_NAME*
  - *OS_AUTH_URL*

These settings are available in the Openstack Horizon dashboard (Look for API credentials).

Note that in order to enable this, these four inputs technically have an empty (`""`) default value. This, however, does not mean they're not mandatory.
{%endtip%}


# Toplogy

The blueprint builds the following topology on Openstack:
  
  - An internal network and subnet (layer 3 network), for communication between the Cloudify manager and Cloudify agent machines (that may be created later in a separate process).
  - A router which connects the internal network to the external network, for connectivity between the Cloudify manager and the outside world.
  - A floating IP for the Cloudify manager machine.
  - A server which will host the Cloudify manager.
  - Two security groups, one for the Cloudify manager machine, and another for Cloudify agent machines.


# Nodes

The "Openstack manager" blueprint contains the following nodes:

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
      - 5555 (Riemann)
      - 5672 (RabbitMQ)
      - 53229 (File server)
  - *manager_server_ip* - A floating IP which will be associated with the Cloudify manager machine.
  - *external_network* - The external network, to which the router connects for access to the outer world. The external network is expected to already exist (hence the `use_external_resource: true` setting).
  - *manager_server* - The server on which the Cloudify manager will be installed.
  - *openstack_configuration* - A node which represents configuration settings for connecting with Openstack.
  - *manager* - The node which represents the manager. You may find more information about this node in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).


# Configuration Operations

The *manager's* node *configure* lifecycle operation is mapped to a method in the configure.py module which takes the following actions:

  - It sets the public IP runtime property, so the manager's bootstrap task will be able to connect to the Cloudify manager server for installation (note that without this step, the connection attempt will be directed at the server's *private IP*, and thereby fail).
  - It sets the *provider context*, which will be used by the Openstack plugin when installing applications at later stages.
  - It creates a file on the Cloudify manager server, which holds the configuration settings for connecting with Openstack. This file will be used by the Openstack plugin when installing applications at later stages.