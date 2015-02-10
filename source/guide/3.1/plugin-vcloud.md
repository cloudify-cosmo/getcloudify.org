---
layout: bt_wiki
title: vCloud Plugin (WIP)
category: Plugins
publish: true
abstract: Cloudify vCloud plugin description and configuration
pageord: 600

---
{%summary%}
{%endsummary%}


{%warning title=Disclaimer%}This plugin is under development.{%endwarning%}


# Description

The vCloud plugin allows users to use a vCloud based infrastructure for deploying services and applications.


# Plugin Requirements:

* Python Versions:
  * 2.7.x


# Types

{%tip title=Tip%}
Each type has property `vcloud_config`. It can be used to pass parameters for authenticating. Overriding of this property is not required, and by default the authentication will take place with the same credentials that were used for the Cloudify bootstrap process.
{%endtip%}


## cloudify.vcloud.nodes.Server

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Properties:**

* `server` key-value server configuration.
    * `name` server name.
    * `template` VApp template from which server will be spawned. For more information, see the [Misc section - VApp template](#vapp-template).
    * `catalog` VApp templates catalog.
* `management_network` management network name
* `vcloud_config` see the [vCloud Configuration](#vcloud-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the VApp.
  * `cloudify.interfaces.lifecycle.start` starts the VApp, if it's not already started.
  * `cloudify.interfaces.lifecycle.stop` stops the VApp, if it's not already stopped.
  * `cloudify.interfaces.lifecycle.delete` deletes the VApp and waits for termination.
  * `cloudify.interfaces.host.get_state` checks whether the VM is in started state.

**Attributes:**

  * `vcloud_vapp_name` created VApp name

Two additional runtime-properties are available on node instances of this type once the `cloudify.interfaces.host.get_state` operation succeeds:

  * `networks` server's networks' information.
  * `ip` the private IP (ip on the internal network) of the server.


## cloudify.vcloud.nodes.Network

**Derived From:** [cloudify.nodes.Network](reference-types.html)

**Properties:**

* `network` key-value network configuration.
    * `name` network name
    * `static_range` static ip allocation pool range
    * `netmask` network netmask
    * `gateway_ip` network gateway
    * `dns` dns server ip
    * `dns_suffix` dns suffix
    * `dhcp` dhcp settings
        * `dhcp_range` DHCP pool range
        * `default_lease` deault lease in seconds
        * `max_lease` maximum lease in seconds
* `use_external_resource` a boolean for setting whether to create the resource or use an existing one. Defaults to `false`.
* `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true`. Defaults to `''` (empty string).
* `vcloud_config` see the [vCloud Configuration](#vcloud-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the network
  * `cloudify.interfaces.lifecycle.delete` deletes the network

**Attributes:**

  * `vcloud_network_name` network name


## cloudify.vcloud.nodes.Port

**Derived From:** [cloudify.nodes.Port](reference-types.html)

**Properties:**

* `port` key-value server network port configuration.
    * `network` network name.
    * `ip_allocation_mode` ip allocation mode. Can be 'dhcp', 'pool' or 'manual'.
    * `ip_address` ip address if ip allocation mode is 'manual'.
    * `mac_address` interface MAC address.
    * `primary_interface` is interface primary (true or false).
* `vcloud_config` see the [vCloud Configuration](#vcloud-configuration).


## cloudify.vcloud.nodes.FloatingIP

**Derived From:** [cloudify.nodes.VirtualIP](reference-types.html)

**Properties:**

* `floatingip` key-value floating ip configuration.
    * `gateway` vCloud gateway name
    * `public_ip` public ip. If not specified public ip will be allocated from the pool of free public ips.
* `vcloud_config` see the [vCloud Configuration](#vcloud-configuration).

**Attributes:**

  * `public_ip` public ip address


# Relationships

## cloudify.vcloud.server_connected_to_floating_ip

**Description:** A relationship for associating a floating ip with a server.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates the floating IP with the server.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disassociates the floating IP from the server.

## cloudify.vcloud.server_connected_to_port

**Description:** A relationship for connecting a server to a port. *Note*: This relationship has no operations associated with it; The server will use this relationship to connect to the port upon server creation.

## cloudify.vcloud.port_connected_to_network

**Description:** A relationship for connecting a port to a network. *Note*: This relationship has no operations associated with it.


# Examples

## Example I

This example will show how to use all of the types in this plugin.

{% togglecloak id=1 %}
Example I
{% endtogglecloak %}

{% gcloak 1 %}
The following is an excerpt from the blueprint's `blueprint`.`node_templates` section:

{% highlight yaml %}
example_server:
    type: cloudify.vcloud.nodes.Server
    properties:
        server:
            name: example-server
            catalog: example-catalog
            template: example-vapp-template
        management_network: existing-network
        vcloud_config: { get_property: [vcloud_configuration, vcloud_config] }
    relationships:
        - target: example_port
          type: cloudify.vcloud.server_connected_to_port
        - target: example_port2
          type: cloudify.vcloud.server_connected_to_port
        - target: manager_floating_ip
          type: cloudify.vcloud.server_connected_to_floating_ip

manager_floating_ip:
    type: cloudify.vcloud.nodes.FloatingIP
    properties:
        floatingip:
            gateway: M000000000-1111
            public_ip: 24.44.244.44
        vcloud_config: { get_property: [vcloud_configuration, vcloud_config] }

example_port:
    type: cloudify.vcloud.nodes.Port
    properties:
        port:
            network: existing-network
            ip_allocation_mode: dhcp
            primary_interface: true
        vcloud_config: { get_property: [vcloud_configuration, vcloud_config] }
    relationships:
        - target: example_network
          type: cloudify.vcloud.port_connected_to_network

example_network:
    type: cloudify.vcloud.nodes.Network
    properties:
        use_external_resource: true
        resource_id: existing-network
        vcloud_config: { get_property: [vcloud_configuration, vcloud_config] }

example_port2:
    type: cloudify.vcloud.nodes.Port
    properties:
        port:
            network: new-network
            ip_allocation_mode: manual
            ip_address: 10.10.0.2
            mac_address: 00:50:56:01:01:49
            primary_interface: false
        vcloud_config: { get_property: [vcloud_configuration, vcloud_config] }
    relationships:
        - target: example_network2
          type: cloudify.vcloud.port_connected_to_network

example_network2:
    type: cloudify.vcloud.nodes.Network
    properties:
        network:
            name: new-network
            static_range: 10.10.0.2-10.10.0.64
            netmask: 255.255.255.0
            gateway_ip: 10.10.0.1/24
            dns: 8.8.8.8
            dns_suffix: test
            dhcp:
                dhcp_range: 10.0.0.65-10.0.0.254
                default_lease: 3600
                max_lease: 7200
        vcloud_config: { get_property: [vcloud_configuration, vcloud_config] }

vcloud_configuration:
    type: vcloud_configuration
    properties:
        vcloud_config:
            username: user
            password: pw
            url: https://vchs.vmware.com
            service: M000000000-1111
            vdc: M000000000-1111
{%endhighlight%}

Node by node explanation:

{% endgcloak %}


# vCloud Configuration

The vCloud plugin requires credentials in order to authenticate and interact with vCloud.

This information will be gathered by the plugin from the following sources, each source possibly partially or completely overriding values gathered from previous ones:

  1. JSON file at `~/vcloud_config.json` or at a path specified by the value of an environment variable named `VCLOUD_CONFIG_PATH`
  2. values specified in the `vcloud_config` property for the node whose operation is currently getting executed (in the case of relationship operations, the `vcloud_config` property of either the *source* or *target* nodes will be used if available, with the *source*'s one taking precedence).

The structure of the JSON file in section (1), as well as of the `vcloud_config` property in section (2), is as follows:

{% highlight json %}
{
    "username": "",
    "password": "",
    "url": "",
    "vdc": "",
    "service": ""
}
{%endhighlight%}

* `username` vCloud username.
* `password` vCloud password.
* `url` vCloud url.
* `vdc` vCloud Virtual Datacenter name.
* `service` vCloud Service name.


{%tip title=Tip%}
The [vCloud manager blueprint](reference-vcloud-manager.html) store the vCloud configuration used for the bootstrap process in a JSON file as described in (1) at `~/vcloud_config.json`. Therefore, if they've been used for bootstrap, the vCloud configuration for applications isn't mandatory as the plugin will default to these same settings.
{%endtip%}


# Misc

## VApp template
Template should have:

* one VM with:
    * root disk with OS, SSH server and VMware Tools installed.
    * user account, with manager and agent SSH keys in authorized_hosts.

Template should not have:

* any networks connected.


## Resources prefix support

This plugin supports transformation of resource names according to the resources prefix feature. For more information on this feature, visit the [CLI guide](guide-cli.html).
