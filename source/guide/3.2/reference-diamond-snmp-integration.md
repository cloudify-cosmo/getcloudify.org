---
layout: bt_wiki
title: Diamond SNMP integration
category: Reference
publish: true
abstract: "Reference on how to use diamond monitoring with SNMP device"
pageord: 1020
---

{%summary%}
An extension to the diamond plugin that adds support for monitoring SNMP enabled devices.
The example usage and necessary types are located in [cloudify-diamond-snmp-extension](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension).
{%endsummary%}

{%note title=Note%}
See [Diamond plugin](plugin-diamond.html) for general Diamond plugin usage.
{%endnote%}

# Implementation
All node types you will need are defined in [snmp-types.yaml](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/master/snmp-types.yaml).  SNMP proxy is a node responsible for gathering the requested metrics from SNMP devices and sending them to RabbitMQ on behalf of those devices as if they were reporting those metrics by themselves (the proxy should be transparent).


## cloudify.relationships.monitors
A relationship that establishes device monitoring performed by the SNMP proxy. In preconfigure operation it updates SNMPProxyCollector's configuration so it will monitor the device.

In this operation's inputs you need to specify the following properties:

* `port` (default: 161)
* `community` (default: public)
* `oids` list of OIDs that you wish to poll.


## SNMPProxy and SNMPManagerProxy
Node types that poll the SNMP devices.
SNMPProxy is located on a separate compute node and SNMPManagerProxy on the Cloudify Manager.

To setup SNMP polling, create a cloudify.relationships.monitors relationship for each device you want to poll.

## Collector changes

[snmpproxy.py](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/master/collectors/snmpproxy.py)


SNMPProxyCollector that inherits from SNMPRawCollector. The only difference is the path used to publish metrics. In our implementation, it is designed to be compatible with [cloudify-diamond-plugin](https://github.com/cloudify-cosmo/cloudify-diamond-plugin).

# Examples
Our examples utilizes OpenStack, please see [openstack-snmp-types.yaml](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/master/openstack-snmp-types.yaml) for reference. It contains a security group allowing UDP communication on port 161 (default for SNMP).

## snmp_security_group
 Security group that contains OpenStack rules allowing SNMP proxy to access SNMP devices.

## snmp_monitored_host
snmp_monitored_host exists in the sample blueprints only as a simulation of a monitored device. We assume that the device runs some SNMP agent (snmpd in our examples) and that the SNMP proxy can access it. In our examples the snmp_monitored_host is a virtual machine with Ubuntu installed on it. The snmpd_configuring_node (see blueprints) installs the SNMP daemon (snmpd) and modifies its configuration so that it can be polled for metrics from anywhere.

## SNMP Proxy on Manager
[An example blueprint](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/master/proxy_on_manager.yaml)


Create a node of the SNMPManagerProxy type. Next add relationships as described in [SNMPProxy and SNMPManagerProxy paragraph](reference-diamond-snmp-integration.html#snmpproxy-and-snmpmanagerproxy).

## SNMP Proxy on seperate VM
[An example blueprint](https://github.com/cloudify-cosmo/cloudify-diamond-snmp-extension/blob/master/separate_proxy.yaml)

To use a separate node you will need a Compute node with Diamond as a monitoring agent. In our example, it is the ProxyServer.
Next, create a ProxyNode contained in ProxyServer. It should be of the SNMPProxy type. Finally, add relationships as described in [SNMPProxy and SNMPManagerProxy paragraph](reference-diamond-snmp-integration.html#snmpproxy-and-snmpmanagerproxy).
