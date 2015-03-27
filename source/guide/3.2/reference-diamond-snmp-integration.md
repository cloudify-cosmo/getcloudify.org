---
layout: bt_wiki
title: Diamond SNMP integration
category: Reference
publish: true
abstract: "Reference on how to use diamond monitoring with SNMP device"
pageord: 1020
---

{%summary%}
An extension to the diamond plugin that adds support for monitoring SNMP metrics on remote machines.
The examples usage and necessary types are in [cloudify-diamond-snmp-extension](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension)
{%endsummary%}

{%note title=Note%}
Here you can find [Diamond plugin guide](plugin-diamond.html)
{%endnote%}

# SNMP types
All node types you will need are defined in [snmp-types.yaml](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/CFY-2305-snmp_diamond_integration/snmp-types.yaml). The security group necessary for OpenStack is defined in [openstack-snmp-types.yaml](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/CFY-2305-snmp_diamond_integration/openstack-snmp-types.yaml). SNMP proxy is a node responsible for gathering the requested metrics from SNMP devices and sending them to RabbitMQ on behalf of those devices as if they were reporting those metrics by themselves (the proxy should be transparent).

## snmp_monitored_host
snmp_monitored_host exists in the blueprints only as a simulation of a monitored device. We assume that SNMP works on the device and that the SNMP proxy can access it. In our example the snmp_monitored_host is a virtual machine with Ubuntu. The snmpd_configuring_node installs SNMP daemon and changes its configuration so it can be polled from anywhere.

## snmp_proxy and snmp_manager_proxy
The nodes that poll the SNMP devices.
snmp_proxy is located  on a separate compute node and snmp_manager_proxy on the Manager.

To define the SNMP polling create a relationship for each device you want to poll. You need to add a preconfigure operation that will change the SNMPProxyCollectors configuration. In the inputs you need to specify:

* `port` (default: 161)
* `community` (default: public)
* `oids` list of OIDs that you wish to poll.

## snmp_security_group
 Security group that contains OpenStack rules allowing SNMP proxy to access SNMP devices.

# SNMP Proxy on Manager
[An example blueprint](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/CFY-2305-snmp_diamond_integration/proxy_on_manager.yaml)


Create a node of snmp_manager_proxy type. Next add relationships as described in [snmp_proxy and snmp_manager_proxy paragraph](reference-diamond-snmp-integration.html#snmpproxy-and-snmpmanagerproxy).

# SNMP Proxy on seperate VMs
[An example blueprint](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/CFY-2305-snmp_diamond_integration/separate_proxy.yaml)

To use a separate node you will need a Compute node with Diamond as a monitoring agent. In our example, it is the ProxyServer.
Next, create a ProxyNode contained in ProxyServer. It should be of the snmp_proxy type. Finally, add relationships as described in [snmp_proxy and snmp_manager_proxy paragraph](reference-diamond-snmp-integration.html#snmpproxy-and-snmpmanagerproxy).

# Collector changes

[snmpproxy.py](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/CFY-2305-snmp_diamond_integration/collectors/snmpproxy.py)


SNMPProxyCollector that inherits from SNMPRawCollector. The only difference is the path used to publish metric. In our implementation, it is adjusted to [cloudify-diamond-plugin](https://github.com/cloudify-cosmo/cloudify-diamond-plugin).
