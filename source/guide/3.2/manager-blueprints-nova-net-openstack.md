---
layout: bt_wiki
title: Nova-net Openstack Manager Blueprint Reference
category: Manager Blueprints
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on Nova-net Openstack"
pageord: 1010
---

{%summary%} This page serves as a reference to the Nova-net Openstack manager blueprint, which is used for bootstrapping Cloudify on Nova-net Openstack (without Neutron support) {%endsummary%}

# Close similarities with Openstack Manager

The Nova-net Openstack manager has much in common with the Openstack manager, whose reference may be found [here](reference-openstack-manager.html).

Therefore, this reference only contains the differences between the two, while the main bulk of reference information is available there.


# Inputs

While most of the inputs are the same, there are a few differences:

* the required `external_network_name` and optional `neutron_url` inputs don't appear as they aren't applicable in Nova-net Openstack.

* there's an additional required input named `internal_cidr` - it should be assigned with the CIDR (in standard CIDR format, e.g. `192.168.1.0/24`) of the Openstack's "internal network", i.e. the one on which new servers automatically get an IP on. This parameter is then used to specify some of the rules for the security groups, where certain ports are to be opened only between the Cloudify Manager and Cloudify agents. If the internal network's CIDR isn't known, the value `0.0.0.0/0` may be used, allowing for anyone to access these ports.


# Toplogy

The topology in the case of the Nova-net Openstack Manager is a simplified version of the one for Openstack Manager, as there are no networks, subnets and routers. Therefore the relevant nodes (two in the case of Network, as both the internal and external networks are no longer applicable) don't appear in the blueprint.

The topology therefore only consists of the rest of the nodes, i.e. the two keypairs, two security groups, floating IP and the Manager's server.
