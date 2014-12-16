---
layout: bt_wiki
title: Cloudstack Manager Reference
category: Reference
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on Cloudstack with networking"
pageord: 1000
---

{%summary%} This page serves as a reference to the Cloudstack manager blueprint, which is used for bootstrapping Cloudify on Cloudstack {%endsummary%}

{%warning title=Disclaimer%}The CloudStack manager blueprint and plugin are not yet part of the Cloudify integration testing system, so they're not considred fully tested artifacts yet.{%endwarning%}


{%note title=Note%}
This reference only explains the structure and various values in the blueprint. For better understanding of it, make yourself familiar with [Cloudify blueprints DSL](guide-blueprint.html), the [Cloudify Cloudstack plugin](http://github.com/cloudify-cosmo/cloudify-cloudstack-plugin), and the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).
{%endnote%}

# Inputs

## Required inputs
* 'cloudstack_api_url' Cloudstack API endpoint URL.
* `cloudstack_key` Cloudstack API key.
* `cloudstack_secret` Cloudstack secret key.
* `zone` Zone name on Cloudstack.
* `manager_public_key_name` The name on Cloudstack of the keypair that will be used with the Cloudify manager.
* `agent_public_key_name` The name on Cloudstack of the keypair that will be used with Cloudify agents.
* `image_id` The id of the image to be used for the Cloudify manager host (Ensure compatibility with the [Prerequisites section](installation-general.html#prerequisites)).
* `service_offering` Compute offering to be used by the Cloudify manager.
* `network_offering` Network offering to be used by the Cloudify manager.
* `manager_private_key_path` Local path to the private key that will used with the Cloudify management machines.
* `agent_private_key_path` Local path to the private key that will used with agent machines.
* `management_network_fw_cidr` The ip address of the machine from which you're bootstrapping.

## Optional inputs
* `use_existing_manager_keypair` A flag for using an existing manager keypair (should exist both on Cloudstack with `manager_public_key_name` as its name, and locally at `manager_private_key_path`).
* `use_existing_agent_keypair` A flag for using an existing agent keypair (should exist both on Cloudstack with `agent_public_key_name` as its name, and locally at `agent_private_key_path`).
* `manager_server_user` The name of the user that will be used to access the Cloudify manager (Default: `root`).
* `manager_server_user_home` The path to the home directory on the Cloudify manager of the user that will be used to access it (Default: `/home/root`).
* `manager_private_key_path` The path on the local machine to the private key file that will be used with the Cloudify manager. This key should match the public key that is set for the `manager_public_key_name` input (Default: `~/.ssh/cloudify-manager-kp.pem`).
* `agent_private_key_path` The path on the local machine to the private key file that will be used with Cloudify agents. This key should match the public key that is set for the `agent_public_key_name` input (Default: `~/.ssh/cloudify-agent-kp.pem`).
* `agents_user` The default username to be used when connecting into applications' agent VMs (for agent installtion).
* `resources_prefix` Resource prefix to be attached to cloud resources' names.

{%tip title=Tip%}
Some of the required inputs may actually be left empty when appropriate, standard Cloudstack environment variables are set in place before calling the `cfy bootstrap` command. These variables are:

  - *CS_API_KEY* (sets `cloudstack_key`)
  - *CS_API_SECRET* (sets `cloudstack_secret`)
  - *CS_API_URL* (sets `keystone_tenant_name`)

These settings are available through the Cloudstack web-console (Look for API credentials).

Note that in order to enable this, these inputs technically have an empty (`""`) default value. This, however, does not mean they're not mandatory.

Additionally, the following optional inputs may also be set by using standard Cloudstack environment variables:
{%endtip%}


# Toplogy

The blueprint builds the following topology on Cloudstack:
  
  - An internal network, for communication between the Cloudify manager and Cloudify agent machines (that may be created later when installing blueprints).
  - A floating IP for the Cloudify manager machine.
  - A server which will host the Cloudify manager.
  - Two keypairs, one for the Cloudify manager machine and another for Cloudify agent machines.

# Nodes

The "Cloudstack manager" blueprint contains the following nodes:

  - *management_keypair* - A keypair for connecting to the Cloudify Manager machine.
  - *agent_keypair* - A keypair for connecting to Cloudify agent machines.
  - *management_network* - An internal network for communication between the Cloudify manager and agent machines.
    - A firewall/security group is defined in the network node enabling the following ports:
      - 22 (SSH)
      - 5555(riemann)
      - 5672(rabbitMQ)
      - 53229 (File server)
      - 8100 (rest-service)
      - 80 (web-ui)
  - *manager_server_ip* - A floating IP which will be associated with the Cloudify manager machine.
  - *manager_server* - The server on which the Cloudify manager will be installed.
  - *cloudstack_configuration* - A node which represents configuration settings for connecting with Cloudstack.
  - *manager* - The node which represents the manager. You may find more information about this node in the [Types Reference](#reference-types.html#cloudifymanager-type) section as well as in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).

# Configuration Operations

The *manager's* node *configure* lifecycle operation is mapped to a method in the configure.py module which takes the following actions:

  - It sets the *provider context*, which will be used by the Cloudstack plugin when installing applications at later stages.
  - It creates a file on the Cloudify manager server, which holds the configuration settings for connecting with Cloudstack. This file will be used by the Cloudstack plugin when installing applications at later stages.
  