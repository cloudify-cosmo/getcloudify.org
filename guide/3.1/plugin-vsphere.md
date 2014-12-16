---
layout: bt_wiki
title: vSphere Plugin
category: Plugins
publish: true
abstract: Cloudify vSphere plugin description and configuration
pageord: 600

plugin_link: http://getcloudify.org.s3.amazonaws.com/spec/vsphere-plugin/1.1/plugin.yaml
---


{%summary%}
This section describes how to use vSphere based infrastructure in your services and applications.
{%endsummary%}

{% note %}
This page relates to a commercial add-on to Cloudify which is not open source. If you'd like to give it a test drive contact us using the feedback button on the right.
The vSphere plugin.yaml configuration file can be found in this [link.]({{page.plugin_link}}) 
{% endnote %}

# Types

{%tip title=Tip%}
Each type has property `connection_config`. It can be used to pass parameters for authenticating. Overriding of this property is not required, and by default the authentication will take place with the same credentials that were used for the Cloudify bootstrap process.
{%endtip%}


## cloudify.vsphere.nodes.server

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Properties:**

* `server` key-value server configuration.
    * `name` server name.
    * `template` virtual machine template from which server will be spawned. For more information, see the [Misc section - Virtual machine template](#virtual-machine-template).
    * `cpus` number of cpus.
    * `memory` amount of RAM, in MB.

* `networking` key-value server networking configuration.
    * `domain` the fully qualified domain name.
    * `dns_servers` list of DNS servers.
    * `connected_networks` list of existing networks to which server will be connected, described as key-value objects. Network will be described as:
        * `name` network name.
        * `management` signifies if it's a management network (false by default). Only one connected network can be management.
        * `external` signifies if it's an external network (false by default). Only one connected network can be external.
        * `switch_distributed` signifies if network is connected to a distributed switch (false by default).
        * `use_dhcp` use DHCP to obtain an ip address (true by default).
        * `network` network cidr (for example, 10.0.0.0/24). It will be used by the plugin only when `use_dhcp` is false.
        * `gateway` network gateway ip. It will be used by the plugin only when `use_dhcp` is false.
        * `ip` server ip address. It will be used by the plugin only when `use_dhcp` is false.

* `connection_config` key-value authentication configuration. If not specified, values that were used for Cloudify bootstrap process will be used.
    * `username` vSphere username.
    * `password` user password.
    * `url` vSphere url.
    * `port` port which vCenter Server system uses to monitor data transfer from SDK clients (443 by default).
    * `datacenter_name` datacenter name.
    * `resource_pool_name` name of a network resource pool.
    * `auto_placement` signifies if server is to be automatically placed on a host (false by default).


## cloudify.vsphere.nodes.network

**Derived From:** [cloudify.nodes.Network](reference-types.html)

**Properties:**

* `network` key-value network configuration.
    * `name` network name
    * `vlan_id` VLAN identifier which will be assigne to the network.
    * `vswitch_name` vswitch name to which the network will be connected
* `connection_config` key-value authentication configuration. Same as for `cloudify.vsphere.server` type.


## cloudify.vsphere.nodes.storage

**Derived From:** [cloudify.nodes.Volume](reference-types.html)

**Properties:**

* `storage` key-value storage disk configuration.
    * `storage_size` disk size in GB.
* `connection_config` key-value authentication configuration. Same as for `cloudify.vsphere.server` type.


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
type: cloudify.vsphere.nodes.server
properties:
    networking:
        domain: example.com
        dns_servers: ['8.8.8.8']
        connected_networks:
            -
                name: example_management_network
                management: true
                switch_distributed: false
                use_dhcp: true
            -
                name: example_external_network
                external: true
                switch_distributed: true
                use_dhcp: false
                network: 10.0.0.0/24
                gateway: 10.0.0.1
                ip: 10.0.0.2
            -
                name: example_other_network
                switch_distributed: true
                use_dhcp: true
    server:
        name: example_server
        template: example_server_template
        cpus: 1
        memory: 512

example_network:
type: cloudify.vsphere.nodes.network
properties:
    network:
        name: example_network
        vlan_id: 1
        vswitch_name: example_vswitch

example_storage:
type: cloudify.vsphere.nodes.storage
properties:
    storage:
        storage_size: 1
    relationships:
        - target: example_server
          type: cloudify.vsphere.storage_connected_to_server
{%endhighlight%}

Node by node explanation:

1. Creates a server. In the server 'networking' property we spefied desired domain name as 'example.com', additional DNS server 8.8.8.8, and three existing networks we want to connect to: example_management_network, example_external_network and example_other_network. In the 'server' property we specified server name as example_server, vm template name as example_server_template, number of cpus as 1, and RAM as 512 MB.

2. Creates a network. We specified network name as example_network, network VLAN id as 1, and an existing vswitch name we want to connect to as example_vswitch.

3. Creates a storage. We specified desired storage size as 1 GB and wish to add this storage to example_server vm.

{% endgcloak %}


# Misc

## Virtual machine template
Template should have:

* root disk with OS, SSH server and vSphere Tools installed.
* user account, with manager and agent SSH keys in authorized_hosts.

Template should not have:

* any network interfaces connected. 


## Resources prefix support

This plugin supports transformation of resource names according to the resources prefix feature. For more information on this feature, visit the [CLI guide](guide-cli.html).
