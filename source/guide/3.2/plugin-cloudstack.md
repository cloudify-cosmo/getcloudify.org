---
layout: bt_wiki
title: CloudStack Plugin
category: Contributed Plugins
publish: true
abstract: Cloudify CloudStack plugin description and configuration
pageord: 650
---
{%summary%}The CloudStack plugin allows users to use a CloudStack based cloud infrastructure for deploying services and applications.
For more information about CloudStack, please refer to [cloudstack.apache.org](http://cloudstack.apache.org/).{%endsummary%}

{%note title=Disclaimer%}This plugin is has been manually tested with Cloudify 3.1, and is not yet tested automatically and regularly.{%endnote%}


# Plugin Requirements

* Python Versions:
  * 2.7.x


# Types

## cloudify.cloudstack.nodes.VirtualMachine:

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Properties:**

  * `server` *Required*. key-value server configuration.
   * `image_id` *Required* the UUID of the Cloudstack vm image to use
   * `size` *Required* The name of the service offering for the VM.
   * `zone` *Required* The name of the zone where the VM will be deployed.
   * `expunge` Boolean (True/False) option to specify if the VM needs to be expunged on deletion, normally VM's will only be expunged on intervals by cloudstack, not expunging VM's on removal might result in failing uninstall workflows. e.g. cloudstack cannot delete a network if it contains VM's
  * `management_network_name` Cloudify's management network name. Every server should be connected to the management network. If the management network's name information   * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `cloudstack_config` see the [CloudStack Configuration](#cloudstack-configuration).
  * `portmaps` List of portmaps to create for this VM, these portmaps will only be created if there is a relationship with a floating ip.
   * `protocol` *Required*. either UDP or TCP
   * `private_port` *Required* TCP/UDP port on vm side
   * `public_port` *Required* TCP/UDP port to use on the public side (floating ip)
   * `private_end_port` End private port if you want to create a port range for mapping
   * `public_end_port` End public port if you want to create a port range for mapping
  * `network` network configuration
   * `default_network` Name of the default network which will be configured with a default gateway only applicable if the vm is multihomed.
   * `ip_address` Optional, normally the vm get's assigned a random ip address from within the network range, use this option to specify a specific address instead of random.

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the server.
  * `cloudify.interfaces.lifecycle.start` starts the server, if it's not already started.
  * `cloudify.interfaces.lifecycle.stop` stops the server, if it's not already stopped.
  * `cloudify.interfaces.lifecycle.delete` deletes the server and waits for termination.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additionally, the image and flavor supplied are checked for existence.
  * `cloudify.interfaces.host.get_state` checks whether the server is in started state.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).

Two additional runtime-properties are available on node instances of this type once the `cloudify.interfaces.host.get_state` operation succeeds:

  * `ip` the private IP (ip on the internal network) of the server.
  * `networking_type` the type of networking used by this VM, either network or security_group



## cloudify.cloudstack.nodes.WindowsServer:

**Derived From:** [cloudify.cloudstack.nodes.VirtualMachine](#cloudstackvirtualmachine)

This type has the same properties and operations-mapping as the type above (as it derives from it), yet it overrides some of the agent and plugin installations operations-mapping derived from the [built-in cloudify.nodes.Compute type](reference-types.html). Use this type when working with a Windows server.


## cloudify.cloudstack.nodes.KeyPair

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

  * `private_key_path` *Required*. The path (on the machine the plugin is running on) where the private key should be stored. If `use_external_resource` is set to `true`, the existing private key is expected to be at this path.
  * `keypair` the keypair object as described by Cloudstack. This parameter can be used to override and pass parameters directly to the libcloud client. Note that in the case of keypair, the only nested parameter that can be used is "name".
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `cloudstack_config` see the [CloudStack Configuration](#cloudstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the keypair.
  * `cloudify.interfaces.lifecycle.delete` deletes the keypair.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additional validations which take place:
    * validation for the private key path supplied not to exist if it's a new keypair resource.
    * validation for the private key path supplied to exist and have the correct permissions and/or owner if it's an existing keypair resource.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).


## cloudify.cloudstack.nodes.SecurityGroup

**Derived From:** [cloudify.nodes.SecurityGroup](reference-types.html)

**Properties:**

  * `security_group` key-value security_group configuration. Defaults to `{}`.
    * **Sugaring:**
      * `port` key may be used instead of the `port_range_max` and `port_range_min` keys to limit the rule to a single port.
      * `remote_group_node` can be used instead of `remote_group_id` to specify a remote group, by supplying this key with a value which is the name of the remote security group node. The target node must be a node the current security-group node has a relationship (of any type) to. Note that like the `remote_group_id` key, this shouldn't be provided if `remote_ip_prefix` was provided.
      * `remote_group_name` will automatically resolve the CloudStack name of a security group into a `remote_group_id`. Note that like the `remote_group_id` key, this shouldn't be provided if `remote_ip_prefix` was provided.
  * `rules` key-value security_group_rule configuration as described in [TBD](#). Defaults to `[]`.
  * `disable_default_egress_rules` a flag for removing the default rules which [allow all egress traffic](#). If not set to `true`, these rules will remain, and exist alongside any additional rules passed using the `rules` property. Defaults to `false`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `cloudstack_config` see the [CloudStack Configuration](#cloudstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the security group, along with its defined rules.
  * `cloudify.interfaces.lifecycle.delete` deletes the security group.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additionally, the *CIDR* of rules which specify one is verified to be of the correct format.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).


## cloudify.cloudstack.nodes.Network

**Derived From:** [cloudify.nodes.Network](reference-types.html)

**Properties:**

  * `network` key-value network configuration as described in [TBD](#). Defaults to `{}`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `cloudstack_config` see the [CloudStack Configuration](#cloudstack-configuration).
   * `network` name-value pairs of configuration items for this network
   * `vpc` If this network is part of a VPC then specify the VPC name here.
   * `service_offering` *Required*. The name of the service offering for this network
   * `zone` *Required* the zone where this network will be deployed.
   * `gateway` the IP address to use as gateway for this network
   * `netmask` the netmask to use for this network
  * `firewall` List of firewall rules
   * `type` either ingress or egress, where egress is traffic to the public network/internet and ingress is traffic flowing from the public network / internet.
   * `protocol` either TCP or UDP
   * `cidr` the [CIDR] (http://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_blocks) in 192.168.0/24 notation for this firewall rule
   * `ports` a list of ports e.g.: ports:[80,443]

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the network
  * `cloudify.interfaces.lifecycle.delete` deletes the network
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).


## cloudify.cloudstack.nodes.FloatingIP

**Derived From:** [cloudify.nodes.Root](reference-types.html)

In cloudstack lingo this is better known as a public ip.

**Properties:**

  * `floatingip` There are no additional configuration parameters available yet. Assignment is handled by relationships Defaults to `{}`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` the IP or ID of an existing floating IP when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `cloudstack_config` see the [CloudStack Configuration](#cloudstack-configuration).


**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the floating IP
  * `cloudify.interfaces.lifecycle.delete` deletes the floating IP
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).

Note that the actual IP is available via the `floating_ip_address` runtime-property.


## cloudify.cloudstack.nodes.VPC

**Derived From:** [cloudify.nodes.Network](reference-types.html)

**Properties:**

  * `network` *Required*. The network configuration for this VPC
   * `service_offering` *Required* The network service offering to use for this VPC
   * `zone` *Required* The zone where this VPC will be created
   * `cidr` *Required* The [CIDR] (http://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_blocks) in 192.168.0/24 notation to use as supernet for this VPC, all networks within this VPC need to be inside this supernet.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `cloudstack_config` see the [CloudStack Configuration](#cloudstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the VPC
  * `cloudify.interfaces.lifecycle.delete` deletes the VPC
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).



# Relationships

{%info title=Information%}
Not all relationships have built-in types (i.e., some types may simply get connected using standard Cloudify relationships such as `cloudify.relationship.connected_to`).

Some relationships take effect in non-relationship operations, e.g. a subnet which is connected to a network actually gets connected on subnet's creation (in the `cloudify.interfaces.lifecycle.create` operation) and not in a `cloudify.interfaces.relationship_lifecycle.establish` operation - this occurs whenever the connection information is required on resource creation.
{%endinfo%}

## cloudify.cloudstack.virtual_machine_connected_to_floating_ip

**Description:** A relationship for associating a floating ip with a VM.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates the floating IP with the server.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disassociates the floating IP from the server.


## cloudify.cloudstack.floating_ip_connected_to_network

**Description:** A relationship connecting a floating IP to a network.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: connects the floating IP with the network.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disconnects the floating IP from the network.

## cloudify.cloudstack.floating_ip_connected_to_vpc

**Description:** A relationship connecting a floating IP to a VPC

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: connects the floating IP to the VPC.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disconnects the floating IP from the VPC.

## cloudify.cloudstack.virtual_machine_connected_to_network

**Description:** A relationship connecting a VM to a network

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: connects the VM to the network.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disconnects the VM from the network.

## cloudify.cloudstack.virtual_machine_connected_to_keypair

**Description:** A relationship that associates a keypair with a VM

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates the keypair with a VM.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disassociates the keypair from the VM.


# Common Behaviors of Types

## Validations

All types offer the same base functionality for the `cloudify.interfaces.validation.creation` interface operation:

  * If it's a new resource (`use_external_resource` is set to `false`), the basic validation is to verify there's enough quota to allocate a new resource of the given type.

  * When [using an existing resource](#using-existing-resources), the validation ensures the resource indeed exists.


## Runtime Properties

Node instances of any of the types defined in this plugin get set with the following runtime properties during the `cloudify.interfaces.lifecycle.create` operation:

  * `external_id` the CloudStack ID of the resource
  * `external_type` the CloudStack type of the resource
  * `external_name` the CloudStack name of the resource


## Default Resource Naming Convention

When creating a new resource (i.e. `use_external_resource` is set to `false`), its name on CloudStack will be the value of its `resource_id` property (possibly with the addition of a prefix - see the [Misc section](#misc)). However, if this value is not provided, the name will default to the following schema:

`<cloudstack-resource-type>_<deployment-id>_<node-instance-id>`

For example, if a server node is defined as so:

{% highlight yaml %}
node_templates:
  myserver:
    type: cloudify.cloiudstack.nodes.VirtualMachine
    ...
{%endhighlight%}

Yet without setting the `resource_id` property, then the server's name on CloudStack will be `server_my-deployment_myserver_XXXXX` (where the XXXXX is the autogenerated part of the node instance's ID).




# Using Existing Resources

It is possible to use existing resources on CloudStack - whether these have been created by a different Cloudify deployment or not via Cloudify at all.

All Cloudify CloudStack types have a property named `use_external_resource`, whose default value is `false`. When set to `true`, the plugin will apply different semantics for each of the operations executed on the relevant node's instances. Specifically, in the case of the `cloudify.interfaces.lifecycle.create` operation, rather than creating a new resource on CloudStack of the given type, the plugin will behave as follows:

1. Try to find an existing resource on CloudStack whose name (or IP, in the case of one of the *floating-ip* types) is the value specified for the `resource_id` property. If more than one is found, an error is raised.

2. If no resource was found, the plugin will use the value of the `resource_id` property to look for the resource by ID instead. If a resource still isn't found, an error is raised.

3. If a single resource was found, the plugin will use that resource, and set the node instance with the appropriate runtime properties according to the resource's data.


The semantics of other operations are affected as well:

* The `cloudify.interfaces.lifecycle.start` operation, where applicable, will only validate that the resource is indeed started, raising an error if it isn't.

* The `cloudify.interfaces.lifecycle.stop` operation, where applicable, won't have any effect.

* The `cloudify.interfaces.lifecycle.delete` operation will not actually delete the resource from Openstack (but will clear the runtime properties from the node instance).

* The `cloudify.interfaces.validation.creation` operation will verify that a resource with the given name or ID indeed exists, or otherwise print a list of all available resources of the given type.

* The `cloudify.interfaces.relationship_lifecycle.establish` operation will behave as normal if the related node is not set with `use_external_resource` as `true`; However if both nodes have this property set to `true`, the operation will only attempt to verify that they're indeed "connected" on CloudStack as well ("connected" in this case also refers to a security-group imposed on a server, floating-ip associated with a server, etc.).


## Notes

* Unlike when creating a new resource, the resource prefix (see the [Misc section](#misc)) will not get appended to the `resource_id` value when attempting to use an existing resource. Make sure the name or ID supplied are the exact resource's values as they are on CloudStack.

* As mentioned in the [Relationships section](#relationships), some relationships take effect in non-relationship operations. When `use_external_resource` is set to `true`, the existence of such connections is validated as well.

* Using an existing resource only makes sense for single-instance nodes.




# CloudStack Configuration

The CloudStack plugin requires credentials and endpoint setup information in order to authenticate and interact with CloudStack.

This information will be gathered by the plugin from the following sources, each source possibly partially or completely overriding values gathered from previous ones:

  1. Environment variables for each of the configuration parameters.
  2. JSON file at `~/cloudstack_config.json` or at a path specified by the value of an environment variable named `CLOUDSTACK_CONFIG_PATH`
  3. Values specified in the `cloudstack_config` property for the node whose operation is currently getting executed (in the case of relationship operations, the `cloudstack_config` property of either the *source* or *target* nodes will be used if available, with the *source*'s one taking precedence).

The structure of the JSON file in section (2), as well as of the `cloudstack_config` property in section (3), is as follows:

{% highlight json %}
{
    "cs_api_key":"",
    "cs_api_secret":"",
    "cs_api_url":""
}
{%endhighlight%}

* `cs_api_key` the API key for authenticating against the CloudStack endpoint.
* `cs_api_secret` the secret key for authenticating against the CloudStack endpoint.
* `cs_api_url` the CloudStack endpoint URL.


The environment variables mentioned in (1) are the standard CloudStack environment variables equivalent to the ones in the JSON file or `cloudstack_config` property. In their respective order, they are:

* `CS_API_KEY`
* `CS_API_SECRET`
* `CS_API_URL`

{%tip title=Tip%}
The [CloudStack manager blueprint](manager-blueprints-cloudstack.html) and the CloudStack provider store the CloudStack configuration used for the bootstrap process in a JSON file as described in (2) at `~/cloudstack-config.json`. Therefore, if they've been used for bootstrap, the CloudStack configuration for applications isn't required as the plugin will default to these same settings.
{%endtip%}

# Example

For a detailed example please refer to the two nodecellar blueprints:

* [The default nodecellar CloudStack blueprint](https://github.com/cloudify-cosmo/cloudify-nodecellar-example/blob/3.2/cloudstack-blueprint.yaml), which defines a network for the application, two VMs, one of which attached to a floating IP, and the application components (a Mongo database and a nodejs server)
* [The nodecellar CloudStack VPC blueprint](https://github.com/cloudify-cosmo/cloudify-nodecellar-example/blob/3.2/cloudstack-vpc-blueprint.yaml), which defines a VPC, two networks which are attached to it (one for the web tier and one for the database tier), two VMs (one in each network), a floating IP and the application components.

# Tips

* It is highly recommended to **ensure that CloudStack names are unique** (for a given type): While CloudStack allows for same name objects, having identical names for objects of the same type might lead to ambiguities and errors.

# Misc

* This plugin supports transformation of resource names according to the resources prefix feature. For more information on this feature, read the [*CloudifyManager* node type's documentation](reference-types.html#cloudifymanager-type).

* The plugin's operations are each *transactional* (and therefore also retryable on failures), yet not *idempotent*. Attempting to execute the same operation twice is likely to fail.

