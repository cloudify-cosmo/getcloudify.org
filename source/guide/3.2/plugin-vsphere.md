---
layout: bt_wiki
title: vSphere Plugin
category: Official Plugins
publish: true
abstract: Cloudify vSphere plugin description and configuration
pageord: 600

plugin_link: http://getcloudify.org.s3.amazonaws.com/spec/vsphere-plugin/1.2/plugin.yaml
---
{%summary%}
{%endsummary%}


# Description

The vSphere plugin allows users to use a vSphere based infrastructure for deploying services and applications.

{% note %}
This page relates to a commercial add-on to Cloudify which is not open source. If you'd like to give it a test drive contact us using the feedback button on the right.
The vSphere plugin.yaml configuration file can be found in this [link.]({{page.plugin_link}})
{% endnote %}


# Plugin Requirements:

* Python Versions:
  * 2.7.x

* User Permissions:
  * To create and destroy virtual machines and storage:
    * On the datacenter:
      * Datastore/Allocate Space
      * Network/Assign Network
      * Virtual Machine/Configuration/Add or remove device
      * Virtual Machine/Configuration/Change CPU count
      * Virtual Machine/Configuration/Memory
      * Virtual Machine/Interaction/Power On
      * Virtual Machine/Inventory/Create from existing
    * On the specific resource pool:
      * Full permissions recommended.
    * On the template(s) to be used:
      * Virtual Machine/Provisioning/Customize
      * Virtual Machine/Provisioning/Deploy template
  * To create and destroy port groups:
    * On the datacenter:
      * Host/Configuration/Network configuration
  * To create and destroy distributed port groups:
    * On the datacenter:
      * dvPort group/Create
      * dvPort group/Delete

## vSphere Environment

* You will require a working vSphere environment. The plugin was tested with version 5.5, with updates 1 and 2 installed.

## SSH Keys
* You will need SSH keys generated for both the manager and the application VM's. If you are using the default key locations in the inputs, these can be created with the following commands:

{% highlight bash %}
ssh-keygen -b2048 -N "" -q -f ~/.ssh/cloudify-manager-kp.pem
ssh-keygen -b2048 -N "" -q -f ~/.ssh/cloudify-agent-kp.pem
{% endhighlight %}

## OS Templates

* You need OS templates of your preferred operating systems (e.g. Ubuntu Trusty) within the vSphere datastores.
* Application VM templates should accept the Cloudify agent public key for its root user. The Cloudify manager template must accept the cloudify manager public key. Note that you can choose to use same template for both the manager and the application VMs, in that case the shared template must accept both public keys.
* The cloudify manager must meet the manager [requirements.](getting-started-prerequisites.html)
* Linux templates must:
  * Have SSH activated and open on the firewall.
  * Have a user account with the agent key trusted as an authorized key for application VM templates.
  * Have a user account with the master key trusted as an authorized key for the manager VM template.
  * A single template can be used with both sets of keys trusted to act as both the manager VM template and the application VM template.
  * The user account must have passwordless sudo access. e.g. if the user is a member of the sudo group then /etc/sudoers should contain the line: '%sudo ALL=(ALL:ALL) NOPASSWD:ALL'
* VM tools deploypkg must be installed on both templates:
  * [Linux requirements](http://kb.vmware.com/selfservice/search.do?cmd=displayKC&docType=kc&docTypeID=DT_KB_1_1&externalId=2075048)
  * Windows requires up to date VMWare tools and sysprep.
* Windows servers should be [configured to support winrm scripting.](plugin-windows-agent-installer.html)
* It is also necessary to install the deployPkg plugin on the VM according to [VMWare documentation](http://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2075048)
* The template should not have any network interfaces attached.
* vSphere must be of an appropriate version with any required updates to support customization of your chosen OS. [Compatibility matrix](http://partnerweb.vmware.com/programs/guestOS/guest-os-customization-matrix.pdf)

# Types

{%tip title=Tip%}
Each type has property `connection_config`. It can be used to pass parameters for authenticating. Overriding of this property is not required, and by default the authentication will take place with the same credentials that were used for the Cloudify bootstrap process.
{%endtip%}


## cloudify.vsphere.nodes.Server

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Properties:**

* `server` key-value server configuration.
    * `name` server name. These must be unique within the vSphere environment.
    * `template` virtual machine template from which server will be spawned. For more information, see the [Misc section - Virtual machine template](#virtual-machine-template).
    * `cpus` number of cpus.
    * `memory` amount of RAM, in MB.

* `networking` key-value server networking configuration.
    * `domain` the fully qualified domain name.
    * `dns_servers` list of DNS servers. These will be added to the interface configuration.
    * `connected_networks` list of existing networks to which server will be connected, described as key-value objects. Network will be described as:
        * `name` network name.
        * `management` signifies if it's a management network (false by default). Only one connected network can be management.
        * `external` signifies if it's an external network (false by default). Only one connected network can be external.
        * `switch_distributed` signifies if network is connected to a distributed vswitch (false by default).
        * `use_dhcp` use DHCP to obtain an ip address (true by default).
        * `network` network cidr (for example, 192.0.2.0/24). It will be used by the plugin only when `use_dhcp` is false.
        * `gateway` network gateway ip. It will be used by the plugin only when `use_dhcp` is false.
        * `ip` server ip address. It will be used by the plugin only when `use_dhcp` is false.

* `connection_config` key-value authentication configuration. If not specified, values that were used for Cloudify bootstrap process will be used.
    * `username` vSphere user name.
    * `password` vSphere user password.
    * `url` vSphere url.
    * `port` vCenter API port for SDK clients (443 by default)
    * `datacenter_name` datacenter name.
    * `resource_pool_name` name of a resource pool.
    * `auto_placement` Whether to use vSphere's auto placement algorithms to place the host. Defaults to false. If false, the plugin will select which host to use for deployment.

## cloudify.vsphere.nodes.Network

**Derived From:** [cloudify.nodes.Network](reference-types.html)

**Properties:**

* `network` key-value network configuration. Used to create port groups.
    * `name` port group name
    * `vlan_id` VLAN identifier which will be assign to the network.
    * `vswitch_name` vswitch name to which the port group will be connected.
    * `switch_distributed` True if the port group is on a dvSwitch, False otherwise.
* `connection_config` key-value authentication configuration. Same as for `cloudify.vsphere.server` type.


## cloudify.vsphere.nodes.Storage

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
type: cloudify.vsphere.nodes.Server
properties:
    networking:
        domain: example.com
        dns_servers: ['192.0.2.1']
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
                network: 192.0.2.0/24
                gateway: 192.0.2.1
                ip: 192.0.2.2
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
type: cloudify.vsphere.nodes.Network
properties:
    network:
        name: example_network
        vlan_id: 101
        vswitch_name: example_vswitch

example_storage:
type: cloudify.vsphere.nodes.Storage
properties:
    storage:
        storage_size: 1
    relationships:
        - target: example_server
          type: cloudify.vsphere.storage_connected_to_server
{%endhighlight%}

Node by node explanation:

1. Creates a server from the example_server_template. This server will have 1 CPU and 512MB of RAM and be attached to the three networks (example_management_network, example_external_network, and example_other_network). The IP on the example_external_network will be statically assigned. The DNS server 192.0.2.1 will be assigned as a DNS server.

2. Creates a network. We specified the network name as example_network, with network VLAN ID as 101, and an existing vswitch name we want to connect to as example_vswitch. This results in us creating a port group called 'example_network' on the 'example_vswitch' vswitch, tagged with VLAN ID 101.

3. Creates a new virtual hard disk (storage). We specified desired storage size as 1 GB and wish to add this storage to example_server vm.

{% endgcloak %}


# Misc

## Resources prefix support

This plugin supports transformation of resource names according to the resources prefix feature. For more information on this feature, visit the [CLI guide](guide-cli.html).
