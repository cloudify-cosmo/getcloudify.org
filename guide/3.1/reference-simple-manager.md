---
layout: bt_wiki
title: Simple Manager Reference
category: Reference
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on an existing machine"
pageord: 400
---

{%summary%} This page serves as a reference to the "simple" manager blueprint, which is used for bootstrapping Cloudify on an existing machine {%endsummary%}


# Inputs

## Required inputs

* `public_ip` The ip used to ssh into the VM
* `private_ip` The ip that will be used by services in the manager network to connect to its services (RabbitMQ, etc...)
* `ssh_key_filename` The path to the key file used to ssh into the VM
* `ssh_user` The username to ssh into the VM with

## Optional inputs

* `cloudify_packages` See [manager common configuration section](reference-manager-common-configuration.html#cloudifypackages).
* `cloudify` See the relevant [manager common configuration section](reference-manager-common-configuration.html#cloudify).


# Topology

The topology consists merely of a single host, on which the Cloudify manager will be installed.


# Nodes

The "simple manager" blueprint contains the following nodes:

  - *manager_host* - The machine on which the Cloudify manager will be installed.
  - *manager* - The node which represents the manager. You may find more information about this node in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).


# Configuration Operations

The *manager's* node *configure* lifecycle operation (which is mapped to a method in the configure.py module) takes a single action - It sets the runtime property for private IP address of the Cloudify manager server.