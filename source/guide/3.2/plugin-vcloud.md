---
layout: bt_wiki
title: vCloud Plugin
category: Plugins
publish: true
abstract: Cloudify vCloud plugin description and configuration
pageord: 600

---
{%summary%}
{%endsummary%}


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
    * `guest_customization` guest customization section
        * `public_keys` public keys to inject; list of key-value configurations
              * `key` public ssh key
              * `user` user name
        * `computer_name` vm hostname
        * `admin_password` root password
        * `pre_script` pre-customization script
        * `post_script` post-customization script
        * `script_executor` script executor, '/bin/bash' by default
    * `hardware` key-value hardware customization section
        * `cpu` vm cpu count
        * `memory` vm memory size, in MB
* `management_network` management network name
* `vcloud_config` see the [vCloud Configuration](#vcloud-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the VApp.
  * `cloudify.interfaces.lifecycle.start` starts the VApp, if it's not already started.
  * `cloudify.interfaces.lifecycle.stop` stops the VApp, if it's not already stopped.
  * `cloudify.interfaces.lifecycle.delete` deletes the VApp and waits for termination.
  * `cloudify.interfaces.lifecycle.creation_validation` validates Server node parameters before creation.

**Attributes:**

  * `vcloud_vapp_name` created VApp name

Two additional runtime-properties are available on node instances of this type once the `cloudify.interfaces.host.get_state` operation succeeds:

  * `networks` server networks information.
  * `ip` the private IP (ip on the internal network) of the server.


## cloudify.vcloud.nodes.Network

**Derived From:** [cloudify.nodes.Network](reference-types.html)

**Properties:**

* `network` key-value network configuration.
    * `edge_gateway` edge gateway name
    * `name` network name
    * `static_range` static ip allocation pool range
    * `netmask` network netmask
    * `gateway_ip` network gateway
    * `dns` list of dns ip addresses
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
  * `cloudify.interfaces.lifecycle.creation_validation` validates Network node parameters before creation

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

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.creation_validation` validates Port node parameters


## cloudify.vcloud.nodes.FloatingIP

**Derived From:** [cloudify.nodes.VirtualIP](reference-types.html)

**Properties:**

* `floatingip` key-value floating ip configuration.
    * `edge_gateway` vCloud gateway name
    * `public_ip` public ip. If not specified public ip will be allocated from the pool of free public ips.
* `vcloud_config` see the [vCloud Configuration](#vcloud-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.creation_validation` validates FloatingIP node parameters

**Attributes:**

  * `public_ip` public ip address


## cloudify.vcloud.nodes.PublicNAT

**Derived From:** [cloudify.nodes.VirtualIP](reference-types.html)

**Properties:**

* `nat` key-value NAT configuration.
    * `edge_gateway` vCloud gateway name
    * `public_ip` public ip. If not specified public ip will be allocated from the pool of free public ips.
* `rules` key-value NAT rules configuration.
    * `protocol` network protocol. Can be 'tcp', 'udp' or 'any'. Applies only for 'DNAT'.
    * `original_port` original port. Applies only for 'DNAT'.
    * `translated_port` translated port. Applies only for 'DNAT'.
    * `type` list of NAT types. Can be 'SNAT', 'DNAT' or both.
* `use_external_resource` a boolean for setting whether to create the resource or use an existing one. Defaults to `false`.
* `vcloud_config` see the [vCloud Configuration](#vcloud-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.creation_validation` validates PublicNAT node parameters

**Attributes:**

  * `public_ip` public ip address


## cloudify.vcloud.nodes.KeyPair

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

* `private_key_path` path to private ssh key file.
* `public_key` key-value public key configuration
    * `key` ssh public key
    * `user` user name

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.creation_validation` validates KeyPair node parameters


## cloudify.vcloud.nodes.SecurityGroup

**Derived From:** [cloudify.nodes.SecurityGroup](reference-types.html)

**Properties:**

* `security_group` key-value SecurityGroup configuration
    * `edge_gateway` vCloud gateway name
* `rules` security group rules; list of key-value configurations
    * `protocol` 'tcp', 'udp', 'icmp' or 'any'
    * `source` source of traffic to apply firewall rule on. Can be 'internal', 'external', 'host', 'any', ip address or ip range.
    * `source_port` port number or 'any'
    * `destination` destination of traffic to apply firewall rule on. Can be 'internal', 'external', 'host', 'any', ip address or ip range.
    * `destination_port` port number or 'any'
    * `action` 'allow' or 'deny'
    * `log_traffic` capture traffic, 'true' or 'false'
    * `description` rule description
* `vcloud_config` see the [vCloud Configuration](#vcloud-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.creation_validation` validates SecurityGroup node parameters


# Relationships

## cloudify.vcloud.server_connected_to_floating_ip

**Description:** A relationship for associating FloatingIP node with Server node.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates FloatingIP with Server.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: dissociates FloatingIP from Server.

## cloudify.vcloud.server_connected_to_port

**Description:** A relationship for connecting Server to Port.
*Note*: This relationship has no operations associated with it; The server will use this relationship to connect to the port upon server creation.

## cloudify.vcloud.port_connected_to_network

**Description:** A relationship for connecting Port to Network.
*Note*: This relationship has no operations associated with it.

## cloudify.vcloud.server_connected_to_network
**Description:** A relationship for connecting Server to Network.
*Note*: This relationship has no operations associated with it; The server will use this relationship to connect to the network upon server creation. It will use DHCP for ip allocation.

## cloudify.vcloud.server_connected_to_public_nat
**Description:** A relationship for associating PublicNAT and Server.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates PublicNAT with Server.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: dissociates PublicNAT from Server.

## cloudify.vcloud.server_connected_to_security_group
**Description:** A relationship for associating SecurityGroup and Server.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates SecurityGroup with Server.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: dissociates SecurityGroup from Server.

## cloudify.vcloud.net_connected_to_public_nat
**Description:** A relationship for associating PublicNAT and Network.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates PublicNAT with Network.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: dissociates PublicNAT from Network.


# Examples

## Example I

This example will show how to use some of the types of this plugin.

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
            hardware:
                cpu: 2
                memory: 4096
            guest_customization:
                public_keys:
                    - key: ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCi64cS8ZLXP9xgzscr+m7bKBDdnhTxXaarJ8hIVgG5C7FHkF1Yj9Za+JIMqGjlwsOugFt09ZTvR1kQcIXdZQhs5HWhnG8UY7RkuUwO4FOFpL2VtMAleP/ZNXSZIGwwy4Sm/wtYOo8V5GPrJNbQnVtsW2NJNt6mB1geJzlshbl9wpshHlFSOz6jV2L8k2kOq32nt/Wa3qpDk20IbKnO9wJYWHVzvyJ4bTOyHowStAABFEj8O7XmoQp8jdUuTj+qAOgCROTAQh93XbS3PJjaQYBhxLOOreYYeqjKG/8IUlFxtRdUn7MLS6Rd15AP2HnjhjKad2KqnOuFZqiTLBu+CGWf
                      user: ubuntu
                computer_name: { get_input: manager_server_name }
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
            edge_gateway: M000000000-1111
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
            edge_gateway: M000000000-1111
            name: new-network
            static_range: 10.10.0.2-10.10.0.64
            netmask: 255.255.255.0
            gateway_ip: 10.10.0.1/24
            dns: ['10.0.0.1', '8.8.8.8']
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
            service_type: subscription
            service: M000000000-1111
            vdc: M000000000-1111
            org: M000000000-1111
{%endhighlight%}

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
    "org": "",
    "vdc": "",
    "service": "",
    "service_type": "",
    "api_version": "",
    "region": "",
    "org_url": ""
}
{%endhighlight%}

* `username` vCloud account username.
* `password` vCloud account password.
* `url` vCloud url.
* `org` Organization name.
* `vdc` Virtual Datacenter name.
* `service` vCloud Service name.
* `service_type` service type. Can be `subscription`, `ondemand` or `private`. Defaults to `subscription`.
* `api_version` vCloud API version. For Subscription defaults to `5.6`, for OnDemand - to `5.7`.
* `region` region name. Applies for OnDemand.
* `org_url` organization url. Required only for `private` service type.
* `edge_gateway` edge gateway name.


{%tip title=Tip%}
The [vCloud manager blueprint](reference-vcloud-manager.html) store the vCloud configuration used for the bootstrap process in a JSON file as described in (1) at `~/vcloud_config.json`. Therefore, if they've been used for bootstrap, the vCloud configuration for applications isn't mandatory as the plugin will default to these same settings.
{%endtip%}


# Misc

## VApp template
Template should have:

* one VM with root disk with OS, SSH server and VMware Tools installed.

Template should not have:

* any networks connected.


## Resources prefix support

This plugin supports transformation of resource names according to the resources prefix feature. For more information on this feature, visit the [CLI guide](guide-cli.html).
