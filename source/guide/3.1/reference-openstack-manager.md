---
layout: bt_wiki
title: Openstack Manager Reference
category: Reference
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
* `agents_user` The default username to be used when connecting into applications' agent VMs (for agent installation).
* `nova_url` Explicit URL for Openstack Nova (compute) service endpoint.
* `neutron_url` Explicit URL for Openstack Neutron (networking) service endpoint.
* `resources_prefix` Resource prefix to be attached to cloud resources' names.
* `use_external_resource` If true, it will be used theexternal network to which the router connects for access to the outer world
* `management_network_name` The name of the management network.
* `management_subnet_name` The subnet name.
* `management_router` The router name.
* `manager_security_group_name` The name for your management security group.
* `agents_security_group_name` The name for your agents security group.

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
  - *manager* - The node which represents the manager. You may find more information about this node in the [Types Reference](#reference-types.html#cloudifymanager-type) section as well as in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).


# Configuration Operations

The *manager's* node *configure* lifecycle operation is mapped to a method in the configure.py module which takes the following actions:

  - It sets the *provider context*, which will be used by the Openstack plugin when installing applications at later stages.
  - It creates a file on the Cloudify manager server, which holds the configuration settings for connecting with Openstack. This file will be used by the Openstack plugin when installing applications at later stages.
