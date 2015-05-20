---
layout: bt_wiki
title: AWS Manager Reference
category: Reference
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on AWS EC2"
pageord: 1000
---

{%summary%} This page serves as a reference to the AWS EC2 blueprint, which is used for bootstrapping the Cloudify Manager.
{%endsummary%}


# Inputs

## Required inputs

* `aws_access_key_id` Your aws_access_key_id, which can be found in your AWS account manager.
* `aws_secret_access_key` Your aws_secret_access_key, which can be found in your AWS account manager.
* `image_id` The id of the image to be used for the Cloudify manager host (Ensure compatibility with the [Prerequisites section](installation-general.html#prerequisites)).
* `instance_type` The instance type to be used for the Cloudify manager host (Ensure compatibility with the [Prerequisites section](installation-general.html#prerequisites)).
* `manager_keypair_name` The name on AWS of the keypair that will be used with the Cloudify manager.
* `agent_keypair_name` The name on AWS of the keypair that will be used with Cloudify agents.

## Optional inputs
* `use_existing_manager_keypair` A boolean flag for using an existing manager keypair (should exist both on AWS with `manager_keypair_name` as its name, and locally at `manager_private_key_path`).
* `use_existing_agent_keypair` A flag for using an existing agent keypair (should exist both on AWS with `agent_keypair_name` as its name, and locally at `manager_key_pair_file_path`).
* `manager_server_name` The name for the manager server in Cloudify.
* `manager_server_user` The name of the user that will be used to access the Cloudify manager (Default: `ubuntu`).
* `manager_key_pair_file_path` The path on the local machine to the private key file that will be used with the Cloudify manager. This key should match the public key that is set for the `manager_keypair_name` input (Default: `~/.ssh/cloudify-manager-kp.pem`).
* `agent_key_pair_file_path` The path on the local machine to the private key file that will be used with Cloudify agents. This key should match the public key that is set for the `agent_keypair_name` input (Default: `~/.ssh/cloudify-agent-kp.pem`).
* `agents_user` The default username to be used when connecting into applications' agent VMs (for agent installtion).
* `management_network_name` The name of the management network.
* `management_subnet_name` The subnet name.
* `management_router` The router name.
* `manager_security_group_name` The name for your management security group.
* `agent_security_group_name` The name for your agents security group.

# Topology

The blueprint builds the following topology on AWS:
  
  - A floating IP for the Cloudify manager machine.
  - A server which will host the Cloudify manager.
  - Two security groups, one for the Cloudify manager machine and another for Cloudify agent machines.
  - Two keypairs, one for the Cloudify manager machine and another for Cloudify agent machines.


# Nodes

The "AWS EC2 manager" blueprint contains the following nodes:

  - *management_keypair* - A keypair for connecting to the Cloudify Manager machine.
  - *agent_keypair* - A keypair for connecting to Cloudify agent machines.
  - *agents_security_group* - A security group that will be enforced on any Cloudify agents machines.
    - This security group has the following ports open for incoming connections from anywhere:
      - 22 (SSH)
      - 5985 (WinRM)
  - *management_security_group* - A security group that will be enforced on the Cloudify manager machine.
    - This security group has the following ports open for incoming connections from anywhere:
      - 22 (SSH)
      - 80 (HTTP)
    - This security group also opens these ports for incoming connections from the agents security group:
      - 5672 (RabbitMQ)
      - 53229 (File server)
  - *manager_server_ip* - A floating IP which will be associated with the Cloudify manager machine.
  - *manager_server* - The server on which the Cloudify manager will be installed.
  - *aws_configuration* - A node which represents configuration settings for connecting with AWS.
  - *manager* - The node which represents the manager. You may find more information about this node in the [Types Reference](#reference-types.html#cloudifymanager-type) section as well as in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).


# Configuration Operations

The *manager's* node *configure* lifecycle operation is mapped to a method in the configure.py module which takes the following actions:

  - It sets the *provider context*, which will be used by the AWS plugin when installing applications at later stages.
  - It creates a file on the Cloudify manager server, which holds the configuration settings for connecting with AWS. This file will be used by the AWS plugin when installing applications at later stages.
