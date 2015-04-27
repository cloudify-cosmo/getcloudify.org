---
layout: bt_wiki
title: Openstack Plugin
category: Plugins
publish: true
abstract: Cloudify Openstack plugin description and configuration
pageord: 600
---
{%summary%}
{%endsummary%}


# Description

The OpenStack plugin allows users to use an OpenStack based cloud infrastructure for deploying services and applications.
For more information about OpenStack, please refer to: [https://www.openstack.org/](https://www.openstack.org/).


# Plugin Requirements

* Python Versions:
  * 2.7.x


# Types

## cloudify.openstack.nodes.Server

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Properties:**

  * `server` key-value server configuration as described in [OpenStack compute create server API](http://developer.openstack.org/api-ref-compute-v2.html#compute_servers).
    * **Notes:**
      * Usage of the `nics` key should be avoided. To connect the server to networks, the Server node should be connected to Network nodes and/or Port nodes via relationships. These will then be translated into the appropriate `nics` definitions automatically.
      * The public key which is set for the server needs to match the private key file whose path is set for the `cloudify_agent`'s `key` property (see [cloudify.nodes.Compute's properties](reference-types.html)). The public key may be set in a number of ways:
        * By connecting the server node to a keypair node using the `cloudify.openstack.server_connected_to_keypair` relationship.
        * By setting it explicitly in the `key_name` key under the `server` property (*note*: in this case, the value will get attached with the resource prefix. See [Misc section](#misc)).
        * If the agent's keypair information is set in the [Provider Context](reference-terminology.html#provider-context), the agents' keypair will serve as the default public key to be used if it was not specified otherwise. See the [Misc section](#misc) for more information on the Openstack Provider Context.
      * If the server is to have an agent installed on it, it should use the agents security group. If the agents security group information isn't set in the [Provider Context](reference-terminology.html#provider-context), this group should be set by using the `security_groups` key. See the [Misc section](#misc) for more information on the Openstack Provider Context.
    * **Sugaring:**
      * `image_name` (**DEPRECATED - Use the `image` *property* instead**) will automatically resolve the Openstack name of an image into its matching image id.
      * `flavor_name` (**DEPRECATED - Use the `flavor` *property* instead**) will automatically resolve the Openstack name of a flavor into its matching flavor id.
      * the `userdata` key may receive either a string (passed as-is to Nova in the create server request), or a dictionary containing:
        * a field `type` whose value is `http`
        * a field `url` whose value is a url to a `userdata` script/value.
  * `image` The image for the server. May receive either the ID or the name of the image. *note*: This property is currently optional for backwards compatibility, but will be modified to become a required property in future versions (Default: `''`).
  * `flavor` The flavor for the server. May receive either the ID or the name of the flavor. *note*: This property is currently optional for backwards compatibility, but will be modified to become a required property in future versions (Default: `''`).
  * `management_network_name` Cloudify's management network name. Every server should be connected to the management network. If the management network's name information is available in the [Provider Context](reference-terminology.html#provider-context), this connection is made automatically and there's no need to override this property (See the [Misc section](#misc) for more information on the Openstack Provider Context). Otherwise, it is required to set the value of this property to the management network name as it was set in the bootstrap process. *Note*: When using Nova-net Openstack (see the [Nova-net Support section](#nova-net-support)), don't set this property. Defaults to `''` (empty string).
  * `use_password` A boolean describing whether this server image supports user-password authentication. Images that do should post the administrator user's password to the Openstack metadata service (e.g. via [cloudbase](http://www.cloudbase.it/cloud-init-for-windows-instances/)); The password would then be retrieved by the plugin, decrypted using the server's keypair and then saved in the server's runtime properties.  Defaults to `false`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the server.
  * `cloudify.interfaces.lifecycle.start` starts the server, if it's not already started.
    * **Inputs:**
      * `start_retry_interval` Polling interval until the server becomes active (in seconds) (Default: `30`)
      * `private_key_path` Path to private key which matches the server's public key. Will be used to decrypt password in case the `use_password` property is set to `true`. If not set, the plugin will attempt to find a keypair node connected to the server and use that, or use the default agent keypair which is set during bootstrap (Default: `''`).
  * `cloudify.interfaces.lifecycle.stop` stops the server, if it's not already stopped.
  * `cloudify.interfaces.lifecycle.delete` deletes the server and waits for termination.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additionally, the image and flavor supplied are checked for existence.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).

Two additional runtime-properties are available on node instances of this type once the `cloudify.interfaces.lifecycle.start` operation succeeds:

  * `networks` server's networks' information, as retrieved from the Nova service.
  * `ip` the private IP (ip on the internal network) of the server.
  * `password` the password for the administrator user. This runtime property is only available if the `use_password` property is set to `true`.



## cloudify.openstack.nodes.WindowsServer

**Derived From:** [cloudify.openstack.nodes.Server](#cloudifyopenstackserver)

This type has the same properties and operations-mapping as the type above (as it derives from it), yet it overrides some of the agent and plugin installations operations-mapping derived from the [built-in cloudify.nodes.Compute type](reference-types.html). Use this type when working with a Windows server.

Additionally, the default value for the `use_password` property is overridden for this type, and is set to `true`. When using an image with a preset password, it should be modified to `false`.



## cloudify.openstack.nodes.KeyPair

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

  * `private_key_path` *Required*. The path (on the machine the plugin is running on) where the private key should be stored. If `use_external_resource` is set to `true`, the existing private key is expected to be at this path.
  * `keypair` key-value keypair configuration as described in [OpenStack network create keypair API](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-os-keypairs). Defaults to `{}`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the keypair.
  * `cloudify.interfaces.lifecycle.delete` deletes the keypair.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additional validations which take place:
    * validation for the private key path supplied not to exist if it's a new keypair resource.
    * validation for the private key path supplied to exist and have the correct permissions and/or owner if it's an existing keypair resource.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).



## cloudify.openstack.nodes.Subnet

**Derived From:** [cloudify.nodes.Subnet](reference-types.html)

**Properties:**

  * `subnet` *Required*. key-value subnet configuration as described in [OpenStack network create subnet API](http://developer.openstack.org/api-ref-networking-v2.html#subnets).
    * **Notes:**
      * The `network_id` key should not be used. Instead, the Subnet node should be connected to *exactly* one Network node via a relationship. It will then be placed on that network automatically.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the subnet.
  * `cloudify.interfaces.lifecycle.delete` deletes the subnet.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additionally, the `cidr` property's value is verified to be of the correct format.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).



## cloudify.openstack.nodes.SecurityGroup

**Derived From:** [cloudify.nodes.SecurityGroup](reference-types.html)

**Properties:**

  * `security_group` key-value security_group configuration as described in [OpenStack network create security group API](http://developer.openstack.org/api-ref-networking-v2.html#security_groups). Defaults to `{}`.
    * **Sugaring:**
      * `port` key may be used instead of the `port_range_max` and `port_range_min` keys to limit the rule to a single port.
      * `remote_group_node` can be used instead of `remote_group_id` to specify a remote group, by supplying this key with a value which is the name of the remote security group node. The target node must be a node the current security-group node has a relationship (of any type) to. Note that like the `remote_group_id` key, this shouldn't be provided if `remote_ip_prefix` was provided.
      * `remote_group_name` will automatically resolve the Openstack name of a security group into a `remote_group_id`. Note that like the `remote_group_id` key, this shouldn't be provided if `remote_ip_prefix` was provided.
  * `rules` key-value security_group_rule configuration as described in [OpenStack network create security group rule](http://developer.openstack.org/api-ref-networking-v2.html#security_groups). Defaults to `[]`.
    * Note: Each rule will be parsed with default values, which will take effect unless overridden. The default values are:
      * `direction`: `ingress`
      * `ethertype`: `IPv4`
      * `port_range_min`: `1`
      * `port_range_max`: `65535`
      * `protocol`: `tcp`
      * `remote_group_id`: `None`
      * `remote_ip_prefix`: `0.0.0.0/0`
    * If `remote_group_id`, `remote_group_node` or `remote_group_name` are used, `remote_ip_prefix` is replaced with value `None`

  * `disable_default_egress_rules` a flag for removing the default rules which [allow all egress traffic](https://wiki.openstack.org/wiki/Neutron/SecurityGroups#Behavior). If not set to `true`, these rules will remain, and exist alongside any additional rules passed using the `rules` property. Defaults to `false`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the security group, along with its defined rules.
  * `cloudify.interfaces.lifecycle.delete` deletes the security group.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additionally, the *CIDR* of rules which specify one is verified to be of the correct format.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).



## cloudify.openstack.nodes.Router

**Derived From:** [cloudify.nodes.Router](reference-types.html)

**Properties:**

  * `router` key-value router configuration as described in [OpenStack network create router API](http://developer.openstack.org/api-ref-networking-v2.html#layer3). Defaults to `{}`.

{%warning title=Deprecation Notice%}
The `network_name` sugaring under the `external_gateway_info` key is now deprecated; Use the `external_netowrk` property to connect the router to an external network by giving either the external network's name or ID.

See more information in the [migration guide](migrating-from-3.1.html).
{%endwarning%}

  * `external_network` An external network name or ID. If given, the router will use this external network as a gateway. Defaults to `''` (empty string).
  * `default_to_managers_external_network` A boolean which determines whether to use the Cloudify Manager's external network if no other external network was given (whether by a relationship, by the `external_network` property or by the nested `external_gateway_info` key in the `router` property). This is only relevant if the manager's external network appears in the [Provider-context](#misc). Defaults to `true`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Notes:**

  * There are several ways to connect a router to an external network: 
    * The most direct way is to use the `external_network` property, which allows providing either the name or ID of the external network to connect to. 
    * Another option which may be preferred, especially if there's already a node representing the external network in the blueprint, is to connect the router to the external network using a relationship.  
    * It's possible to pass the external network ID via the standard Neutron API by using the nested `network_id` key under the `external_gateway_info` key of the `router` property. This will override the value given under the `external_network` property.
    * If none of the above is provided, and the external-network used by the Cloudify Manager is available in the [Provider-context](#misc), it may be automatically used as the gateway for the router, depending on the value of the `default_to_managers_external_network` property.
  * Don't provide an external network by both an ID/name *and* by relationship - this will result in an error.

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the router
  * `cloudify.interfaces.lifecycle.delete` deletes the router
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).



## cloudify.openstack.nodes.Port

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

  * `port` key-value port configuration as described in [OpenStack network create port API](http://developer.openstack.org/api-ref-networking-v2.html#ports). Defaults to `{}`.
    * **Notes:**
      * The `network_id` key should not be used. Instead, the Port node should be connected to a *single* Network node via a relationship. It will then be placed on that network automatically.
  * `fixed_ip` may be used to request a specific fixed IP for the port. If the IP is unavailable (either already taken or does not belong to a subnet the port is on) an error will be raised. Defaults to `''`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the port
  * `cloudify.interfaces.lifecycle.delete` deletes the port
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).

Additionally, the Port's fixed-IP is available via the `fixed_ip_address` runtime property.



## cloudify.openstack.nodes.Network

**Derived From:** [cloudify.nodes.Network](reference-types.html)

**Properties:**

  * `network` key-value network configuration as described in [OpenStack network create network API](http://developer.openstack.org/api-ref-networking-v2.html#networks). Defaults to `{}`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the network
  * `cloudify.interfaces.lifecycle.delete` deletes the network
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).



## cloudify.openstack.nodes.FloatingIP

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

  * `floatingip` key-value floatingip configuration as described in [OpenStack network create floating ip API](http://developer.openstack.org/api-ref-networking-v2.html#layer3). Defaults to `{}`.
    * **Notes:**
      * a `floating_ip_address` key can be passed for using an existing allocated floating IP. The value is the existing floating IP address.
    * **Sugaring:**
      * `floating_network_name` will automatically resolve the Openstack name of a network into the `floating_network_id`
      * `ip` equivalent of the `floating_ip_address` key
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` the IP or ID of an existing floating IP when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the floating IP
  * `cloudify.interfaces.lifecycle.delete` deletes the floating IP
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).

Note that the actual IP is available via the `floating_ip_address` runtime-property.


## cloudify.openstack.nodes.Volume

**Derived From:** [cloudify.nodes.Volume](reference-types.html)

**Properties:**

  * `volume` *Required*. key-value volume configuration as described in [OpenStack Cinder create volume API](http://developer.openstack.org/api-ref-blockstorage-v1.html#volumes-v1).
  * `device_name` The device name this volume will be attached to. Default value is *auto*, which means openstack will auto-assign a device. Note that if you do explicitly set a value, this value may not be the actual device name assigned. Sometimes the device requested will not be available and openstack will assign it to a different device, this is why we recommend using *auto*.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the volume
  * `cloudify.interfaces.lifecycle.delete` deletes the volume
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).



## cloudify.openstack.nova_net.nodes.FloatingIP

{%note title=Note%}
This is a Nova-net specific type. See more in the [Nova-net Support section](#nova-net-support).
{%endnote%}

**Derived From:** [cloudify.nodes.VirtualIP](reference-types.html)

**Properties:**

  * `floatingip` key-value floatingip configuration as described in [OpenStack Nova create floating ip API](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-os-floating-ips). Defaults to `{}`.
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` the IP or ID of an existing floating IP when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the floating IP
  * `cloudify.interfaces.lifecycle.delete` deletes the floating IP
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).

Note that the actual IP is available via the `floating_ip_address` runtime-property.


## cloudify.openstack.nova_net.nodes.SecurityGroup

{%note title=Note%}
This is a Nova-net specific type. See more in the [Nova-net Support section](#nova-net-support).
{%endnote%}

**Derived From:** [cloudify.nodes.SecurityGroup](reference-types.html)

**Properties:**

  * `description` *Required*. The description for the security-group.
  * `security_group` key-value security_group configuration as described in [OpenStack Nova create security group API](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-os-security-groups). Defaults to `{}`.
    * **Notes:**
      * this property supports the same sugaring described for the equivalent property in the [Neutron security-group type](#cloudifyopenstacknodessecuritygroup).
  * `rules` key-value security group rule configuration as described in [OpenStack Nova security group API](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-os-security-group-default-rules). Defaults to `[]`.
    * Note: Each rule will be parsed with default values, which will take effect unless overridden. The default values are:
      * `from_port`: `1`
      * `to_port`: `65535`
      * `ip_protocol`: `tcp`
      * `cidr`: `0.0.0.0/0`
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` name to give to the new resource or the name or ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `openstack_config` see the [Openstack Configuration](#openstack-configuration).

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the security group, along with its defined rules.
  * `cloudify.interfaces.lifecycle.delete`: deletes the security group.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additionally, the *CIDR* of rules which specify one is verified to be of the correct format.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).


# Relationships

{%info title=Information%}
Not all relationships have built-in types (i.e., some types may simply get connected using standard Cloudify relationships such as `cloudify.relationships.connected_to`).

Some relationships take effect in non-relationship operations, e.g. a subnet which is connected to a network actually gets connected on subnet's creation (in the `cloudify.interfaces.lifecycle.create` operation) and not in a `cloudify.interfaces.relationship_lifecycle.establish` operation - this occurs whenever the connection information is required on resource creation.
{%endinfo%}


## cloudify.openstack.port_connected_to_security_group

**Description:** A relationship for a port to a security group.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: sets the security group on the port.


## cloudify.openstack.subnet_connected_to_router

**Description:** A relationship for connecting a subnet to a router.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: connects the subnet to the router.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disconnects the subnet from the router.


## cloudify.openstack.server_connected_to_floating_ip

**Description:** A relationship for associating a floating ip with a server.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates the floating IP with the server.
    * **Inputs:**
      * `fixed_ip` a specific fixed-IP of the server to be associated with the floating IP. If omitted, a fixed-IP (or "port") will be chosen by Openstack (Default: `''`).
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disassociates the floating IP from the server.


## cloudify.openstack.server_connected_to_security_group

**Description:** A relationship for setting a security group on a server.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: sets the security group on the server.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: unsets the security group from the server.


## cloudify.openstack.volume_attached_to_server

**Description:** A relationship for attaching a volume to a server.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: attaches the volume to the server.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: detaches the volume from the server.


## cloudify.openstack.server_connected_to_port

**Description:** A relationship for connecting a server to a port. *Note*: This relationship has no operations associated with it; The server will use this relationship to automatically connect to the port upon server creation.


## cloudify.openstack.port_connected_to_subnet

**Description:** A relationship for connecting a port to a subnet. This is useful when a network has multiple subnets, and a port should belong to a specific subnet on that network. The port will then receive some IP from that given subnet.

Note that when using this relationship in combination with the port type's property `fixed_ip`, the IP given should be on the CIDR of the subnet connected to the port.

*Note*: This relationship has no operations associated with it; The port will use this relationship to automatically connect to the subnet upon port creation.


## cloudify.openstack.port_connected_to_floating_ip

**Description:** A relationship for associating a floating ip with a port. If that port is later connected to a server, the server will be accessible via the floating IP.

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: associates the floating IP with the port.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: disassociates the floating IP from the port.


# Types' Common Behaviors

## Validations

All types offer the same base functionality for the `cloudify.interfaces.validation.creation` interface operation:

  * If it's a new resource (`use_external_resource` is set to `false`), the basic validation is to verify there's enough quota to allocate a new resource of the given type.

  * When [using an existing resource](#using-existing-resources), the validation ensures the resource indeed exists.


## Runtime Properties

Node instances of any of the types defined in this plugin get set with the following runtime properties during the `cloudify.interfaces.lifecycle.create` operation:

  * `external_id` the Openstack ID of the resource
  * `external_type` the Openstack type of the resource
  * `external_name` the Openstack name of the resource

The only exceptions are the two *floating-ip* types - Since floating-ip objects on Openstack don't have a name, the `external_name` runtime property is replaced with the `floating_ip_address` one, which holds the object's actual IP address.


## Default Resource Naming Convention

When creating a new resource (i.e. `use_external_resource` is set to `false`), its name on Openstack will be the value of its `resource_id` property (possibly with the addition of a prefix - see the [Misc section](#misc)). However, if this value is not provided, the name will default to the following schema:

`<openstack-resource-type>_<deployment-id>_<node-instance-id>`

For example, if a server node is defined as so:

{% highlight yaml %}
node_templates:
  myserver:
    type: cloudify.openstack.nodes.Server
    ...
{%endhighlight%}

Yet without setting the `resource_id` property, then the server's name on Openstack will be `server_my-deployment_myserver_XXXXX` (where the XXXXX is the autogenerated part of the node instance's ID).




# Using Existing Resources

It is possible to use existing resources on Openstack - whether these have been created by a different Cloudify deployment or not via Cloudify at all.

All Cloudify Openstack types have a property named `use_external_resource`, whose default value is `false`. When set to `true`, the plugin will apply different semantics for each of the operations executed on the relevant node's instances. Specifically, in the case of the `cloudify.interfaces.lifecycle.create` operation, rather than creating a new resource on Openstack of the given type, the plugin will behave as follows:

1. Try to find an existing resource on Openstack whose name (or IP, in the case of one of the *floating-ip* types) is the value specified for the `resource_id` property. If more than one is found, an error is raised.

2. If no resource was found, the plugin will use the value of the `resource_id` property to look for the resource by ID instead. If a resource still isn't found, an error is raised.

3. If a single resource was found, the plugin will use that resource, and set the node instance with the appropriate runtime properties according to the resource's data.


The semantics of other operations are affected as well:

* The `cloudify.interfaces.lifecycle.start` operation, where applicable, will only validate that the resource is indeed started, raising an error if it isn't.

* The `cloudify.interfaces.lifecycle.stop` operation, where applicable, won't have any effect.

* The `cloudify.interfaces.lifecycle.delete` operation will not actually delete the resource from Openstack (but will clear the runtime properties from the node instance).

* The `cloudify.interfaces.validation.creation` operation will verify that a resource with the given name or ID indeed exists, or otherwise print a list of all available resources of the given type.

* The `cloudify.interfaces.relationship_lifecycle.establish` operation will behave as normal if the related node is not set with `use_external_resource` as `true`; However if both nodes have this property set to `true`, the operation will only attempt to verify that they're indeed "connected" on Openstack as well ("connected" in this case also refers to a security-group imposed on a server, floating-ip associated with a server, etc.).


## Notes

* Unlike when creating a new resource, the resource prefix (see the [Misc section](#misc)) will not get appended to the `resource_id` value when attempting to use an existing resource. Make sure the name or ID supplied are the exact resource's values as they are on Openstack.

* As mentioned in the [Relationships section](#relationships), some relationships take effect in non-relationship operations. When `use_external_resource` is set to `true`, the existence of such connections is validated as well.

* Using an existing resource only makes sense for single-instance nodes.




# Openstack Configuration

The Openstack plugin requires credentials and endpoint setup information in order to authenticate and interact with Openstack.

This information will be gathered by the plugin from the following sources, each source possibly partially or completely overriding values gathered from previous ones:

  1. environment variables for each of the configuration parameters.
  2. JSON file at `~/openstack_config.json` or at a path specified by the value of an environment variable named `OPENSTACK_CONFIG_PATH`
  3. values specified in the `openstack_config` property for the node whose operation is currently getting executed (in the case of relationship operations, the `openstack_config` property of either the *source* or *target* nodes will be used if available, with the *source*'s one taking precedence).

The structure of the JSON file in section (2), as well as of the `openstack_config` property in section (3), is as follows:

{% highlight json %}
{
    "username": "",
    "password": "",
    "tenant_name": "",
    "auth_url": "",
    "region": "",
    "nova_url": "",
    "neutron_url": "",
    "custom_configuration": ""
}
{%endhighlight%}

* `username` username for authentication with Openstack Keystone service.
* `password` password for authentication with Openstack Keystone service.
* `tenant_name` name of the tenant to be used.
* `auth_url` URL of the Openstack Keystone service.
* `region` Openstack region to be used. This may be optional when there's but a single region.
* `nova_url` (**DEPRECATED - instead, use `custom_configuration` to pass `bypass_url` directly to the Nova client**) explicit URL for the Openstack Nova service. This may be used to override the URL for the Nova service that is listed in the Keystone service.
* `neutron_url` (**DEPRECATED - instead, use `custom_configuration` to pass `endpoint_url` directly to the Neutron client**) explicit URL for the Openstack Neutron service. This may be used to override the URL for the Neutron service that is listed in the Keystone service.
* `custom_configuration` a dictionary which allows overriding or directly passing custom configuration parameter to each of the Openstack clients, by using any of the relevant keys: `keystone_client`, `nova_client`, `neutron_client` or `cinder_client`.
  * Parameters passed directly to Openstack clients using the `custom_configuration` mechanism will override other definitions (e.g. any of the common Openstack configuration parameters listed above, such as `username` and `tenant_name`)
  * The following is an example for the usage of the `custom_configuration` section in a blueprint:
{% highlight yaml %}
custom_configuration:
  nova_client:
    bypass_url: nova-endpoint-url
    nova_specific_key_1: value_1
    nova_specific_key_2: value_2
  neutron_client:
    endpoint_url: neutron-endpoint-url
  keystone_client:
    ..
  cinder_client:
    ..
{%endhighlight%}


The environment variables mentioned in (1) are the standard Openstack environment variables equivalent to the ones in the JSON file or `openstack_config` property. In their respective order, they are:

* `OS_USERNAME`
* `OS_PASSWORD`
* `OS_TENANT_NAME`
* `OS_AUTH_URL`
* `OS_REGION_NAME`
* `NOVACLIENT_BYPASS_URL`
* `OS_URL`

*Note*: `custom_configuration` doesn't have an equivalent standard Openstack environment variable.


{%tip title=Tip%}
The [Openstack manager blueprint](reference-openstack-manager.html) and the Openstack provider store the Openstack configuration used for the bootstrap process in a JSON file as described in (2) at `~/openstack-config.json`. Therefore, if they've been used for bootstrap, the Openstack configuration for applications isn't required as the plugin will default to these same settings.
{%endtip%}



# Nova-net Support

The Openstack plugin includes support for Nova-net mode - i.e., an Openstack installation which does not have the Networking API (Neutron service).

In such an environment, there is but a single preconfigured private network, which all servers make use of automatically. There are no subnets, networks, routers or ports. Since these resource types don't exist, the plugin's equivalent types aren't valid to use in such an environment.

There are, however, some resource types whose API is available via both the Nova and Neutron services - These had originally been on the Nova service, and later were moved and got extended implementation in the Neutron one, but were also kept in the Nova service for backward compatibility.

For these resource types, the Openstack plugin defines two separate types - one in the plugin's standard types namespace (`cloudify.openstack.nodes.XXX`), which uses the newer and extended API via the Neutron service; and Another in a special namespace (`cloudify.openstack.nova_net.nodes.XXX`), which uses the older API via the Nova service. This is why you may notice two separate types defined for [Floating](#cloudifyopenstacknodesfloatingip) [IP](#cloudifyopenstacknovanetnodesfloatingip), as well as for [Security](#cloudifyopenstacknodessecuritygroup) [Group](#cloudifyopenstacknovanetnodessecuritygroup).


To summarize, ensure that when working in a Nova-net Openstack environment, Neutron types aren't used - these include all types whose resources' APIs are natively available only via the Network API, as well as the types which are in the `cloudify.openstack.nova_net.Nodes` namespace.

On the opposite side, when using an Openstack environment which supports Neutron, it's recommended to use the Neutron-versions of the relevant types (i.e. avoid any types defined under the `cloudify.openstack.nova_net.Nodes` namespace), as they offer more advanced capabilities. However, it's important to mention that this is not required, and using the Nova-versions of some types in a Neutron-enabled environment is possible and will work as well.



# Examples

## Example I

This example will show how to use most of the types in this plugin, as well as how to make the relationships between them.

We'll see how to create a server with a security group set on it and a floating_ip associated to it, on a subnet in a network.

{% togglecloak id=1 %}
Example I
{% endtogglecloak %}

{% gcloak 1 %}
The following is an excerpt from the blueprint's `blueprint`.`nodes` section:

{% highlight yaml %}
my_floating_ip:
  type: cloudify.openstack.nodes.FloatingIP
  properties:
    floatingip:
      floating_network_name: Ext-Net


my_network:
  type: cloudify.openstack.nodes.Network
  properties:
    resource_id: my_network_openstack_name


my_subnet:
  type: cloudify.openstack.nodes.Subnet
  properties:
    resource_id: my_subnet_openstack_name
    subnet:
      cidr: 1.2.3.0/24
      ip_version: 4
  relationships:
    - target: my_network
      type: cloudify.relationships.contained_in


my_security_group:
  type: cloudify.openstack.nodes.SecurityGroup
  properties:
    resource_id: my_security_group_openstack_name
    rules:
      - remote_ip_prefix: 0.0.0.0/0
        port: 8080


my_server:
  type: cloudify.openstack.nodes.Server
  properties:
    resource_id: my_server_openstack_name
    server:
      image: 8672f4c6-e33d-46f5-b6d8-ebbeba12fa02
      flavor: 101
  relationships:
    - target: my_network
      type: cloudify.relationships.connected_to
    - target: my_subnet
      type: cloudify.relationships.depends_on
    - target: my_floating_ip
      type: cloudify.openstack.server_connected_to_floating_ip
    - target: my_security_group
      type: cloudify.relationships.server_connected_to_security_group
{%endhighlight%}

Node by node explanation:

1. Creates a floating IP, whose node name is `my_floating_ip`, and whose floating_network_name is `Ext-Net` (This value represents the name of the external network).

2. Creates a network, whose node name is `my_network`, and whose name on Openstack is `my_network_openstack_name`.

3. Creates a subnet, whose node name is `my_subnet`, and whose name on Openstack is `my_subnet_openstack_name`. The subnet's address range is defined to be 1.2.3.0 - 1.2.3.255 using the `cidr` parameter, and the subnet's IP version is set to version 4. The subnet will be set on the `my_network_openstack_name` network because of the relationship to the `my_network` node.

4. Creates a security_group, whose node name is `my_security_group`, and whose name on Openstack is `my_security_group_openstack_Name`. The security group is set with a single rule, which allows all traffic (since we use the address range `0.0.0.0/0`) to port `8080` (default direction is *ingress*).

5. Creates a server, whose node name is `my_server`, and whose name on openstack is `my_server_openstack_name`. The server is set with an image and flavor IDs. The server is set with multiple relationships:
  - A relationship to the `my_network` node: Through this relationship, the server will be automatically placed on the `my_network_openstack_name` network.
  - A relationship to the `my_subnet` node: This relationship is strictly for ensuring the order of creation is correct, as the server requires the `my_subnet_openstack_name` subnet to exist before it can be created on it.
  - A relationship to the `my_floating_ip` node: This designated relationship type will take care of associating the server with the floating IP represented by the `my_floating_ip` node.
  - A relationship with the `my_security_group` node: This relationship will take care of setting the server up with the security group represented by the `my_security_group` node.
{% endgcloak %}


## Example II

This example will show how to use the `router` and `port` types, as well as some of the relationships that were missing from Example I.

We'll see how to create a server connected to a port, where the port is set on a subnet in a network, and has a security group set on it. Finally, we'll see how this subnet connects to a router and from there to the external network.

{% togglecloak id=2 %}
Example II
{% endtogglecloak %}

{% gcloak 2 %}
The following is an excerpt from the blueprint's `blueprint`.`node_templates` section:

{% highlight yaml %}
my_network:
  type: cloudify.openstack.nodes.Network
  properties:
    resource_id: my_network_openstack_name


my_security_group:
  type: cloudify.openstack.nodes.SecurityGroup
  properties:
    resource_id: my_security_group_openstack_name
    rules:
      - remote_ip_prefix: 0.0.0.0/0
        port: 8080


my_subnet:
  type: cloudify.openstack.nodes.Subnet
  properties:
    resource_id: my_subnet_openstack_name
    subnet:
      cidr: 1.2.3.0/24
      ip_version: 4
  relationships:
    - target: my_network
      type: cloudify.relationships.contained_in
    - target: my_router
      type: cloudify.openstack.subnet_connected_to_router


my_port:
  type: cloudify.openstack.nodes.Port
  properties:
    resource_id: my_port_openstack_name
  relationships:
    - target: my_network
      type: cloudify.relationships.contained_in
    - target: my_subnet
      type: cloudify.relationships.depends_on
    - target: my_security_group
      type: cloudify.openstack.port_connected_to_security_group


my_router:
  type: cloudify.openstack.nodes.Router
  properties:
    resource_id: my_router_openstack_Name


my_server:
  type: cloudify.openstack.nodes.Server
  properties:
    server:
      image: 8672f4c6-e33d-46f5-b6d8-ebbeba12fa02
      flavor: 101
    cloudify_agent:
      user: ubuntu
  relationships:
    - target: my_port
      type: cloudify.openstack.server_connected_to_port
{%endhighlight%}

Node by node explanation:

1. Creates a network. See Example I for more information.

2. Creates a security group. See Example I for more information.

3. Creates a subnet. This is again similar to what we've done in Example I. The difference here is that the subnet has an extra relationship set towards a router.

4. Creates a port, whose node name is `my_port`, and whose name on Openstack is `my_port_openstack_name`. The port is set with multiple relationships:
  - A relationship to the `my_network` node: Through this relationship, the port will be automatically placed on the `my_network_openstack_name` network.
  - A relationship to the `my_subnet` node: This relationship is strictly for ensuring the order of creation is correct, as the port requires the `my_subnet_openstack_name` subnet to exist before it can be created on it.
  - A relationship to the `my_security_group` node: This designated relationship type will take care of setting the `my_security_group_openstack_name` security group on the port.

5. Creates a router, whose node name is `my_router`, and whose name on Openstack is `my_router_openstack_name`. The router will automatically have an interface in the external network.

6. Creates a server, whose node name is `my_server`, and whose name on Openstack is *the node's ID* (since no `name` parameter was supplied under the `server` property). The server is set with an image and flavor IDs. It also overrides the `cloudify_agent` property of its parent type to set the username that will be used to connect to the server for installing the Cloudify agent on it. Finally, it is set with a relationship to the `my_port` node: This designated relationship type will take care of connecting the server to `my_port_openstack_name`.
{% endgcloak %}


## Example III

This example will show how to use the `volume` type, as well as `volume_attached_to_server` relationship.

{% togglecloak id=3 %}
Example III
{% endtogglecloak %}

{% gcloak 3 %}
The following is an excerpt from the blueprint's `blueprint`.`node_templates` section:

{% highlight yaml %}
my_server:
  type: cloudify.openstack.nodes.Server
  properties:
    server:
      image: 8672f4c6-e33d-46f5-b6d8-ebbeba12fa02
      flavor: 101
    cloudify_agent:
      user: ubuntu

my_volume:
  type: cloudify.openstack.nodes.Volume
  properties:
    resource_id: my_openstack_volume_name
    volume:
      size: 1
    device_name: /dev/vdb
  relationships:
    - target: my_server
      type: cloudify.openstack.volume_attached_to_server
{%endhighlight%}

Node by node explanation:

1. Creates a server, with name `my_server`, and with name on Openstack *the node's ID* (since no `name` parameter was supplied under the `server` property). The server is set with an image and flavor IDs.
2. Creates a volume. It is set with a relationship to the `my_server` node: This designated relationship type will take care of attaching the volume to Openstack server node.
{% endgcloak %}



## Example IV

This example will show how to use a Windows server with a Cloudify agent on it.

{% togglecloak id=4 %}
Example IV
{% endtogglecloak %}

{% gcloak 4 %}
The following is an excerpt from the blueprint's `blueprint`.`node_templates` section:

{% highlight yaml %}
my_keypair:
  type: cloudify.openstack.nodes.KeyPair
  properties:
    private_key_path: /tmp/windows-test.pem

my_server:
  type: cloudify.openstack.nodes.WindowsServer
  properties:
    server:
      image: 8672f4c6-e33d-46f5-b6d8-ebbeba12fa02
      flavor: 101
      name: my-server
      userdata: |
        #ps1_sysnative
        winrm quickconfig -q
        winrm set winrm/config/winrs '@{MaxMemoryPerShellMB="300"}'
        winrm set winrm/config '@{MaxTimeoutms="1800000"}'
        winrm set winrm/config/service '@{AllowUnencrypted="true"}'
        winrm set winrm/config/service/auth '@{Basic="true"}'
        &netsh advfirewall firewall add rule name="WinRM 5985" protocol=TCP dir=in localport=5985 action=allow
        &netsh advfirewall firewall add rule name="WinRM 5986" protocol=TCP dir=in localport=5986 action=allow

        msiexec /i https://www.python.org/ftp/python/2.7.6/python-2.7.6.msi TARGETDIR=C:\Python27 ALLUSERS=1 /qn
  relationships:
    - type: cloudify.openstack.server_connected_to_keypair
      target: keypair
  interfaces:
    cloudify.interfaces.worker_installer:
      install:
        inputs:
          cloudify_agent:
            user: Admin
            password: { get_attribute: [SELF, password] }
{%endhighlight%}

Node by node explanation:

1. Creates a keypair. the private key will be saved under `/tmp/windows-test.pem`.
2. Creates a Windows server:
  * It is set with a relationship to the `my_keypair` node, which will make the server use the it as a public key for authentication, and also use this public key to encrypt its password before posting it to the Openstack metadata service.
  * The worker-installer interface operations are given values for the user and password for the `cloudify_agent` input - the password uses the [get_attribute](dsl-spec-intrinsic-functions.html#getattribute) feature to retrieve the decrypted password from the Server's runtime properties (Note that in this example, only the `install` operation was given with this input, but all of the worker installer operations as well as the plugin installer operations should be given with it).
  * We define custom userdata which configures WinRM and installs Python on the machine (Windows Server 2012 in this example) once it's up. This is required for the Cloudify agent to be installed on the machine.
{% endgcloak %}


# Tips

* It is highly recommended to **ensure that Openstack names are unique** (for a given type): While Openstack allows for same name objects, having identical names for objects of the same type might lead to ambiguities and errors.

* To set up DNS servers for Openstack servers (whether it's the Cloudify Manager or application VMs), one may use the Openstack `dns_nameservers` parameter for the [Subnet type](#cloudifyopenstacknodessubnet) - that is, pass the parameter directly to Neutron by using the `subnet` property of the Subnet node, e.g.:
{% highlight yaml %}
my_subnet_node:
  subnet:
    dns_nameservers: [1.2.3.4]
{%endhighlight%}
  This will set up `1.2.3.4` as the DNS server for all servers on this subnet.

* Public keys, unlike the rest of the Openstack resources, are user-based rather than tenant-based. When errors indicate a missing keypair, make sure you're using the correct user rather than tenant.

* To control the order in which networks are attached to a server (and thereby control which interface is connected to which network), it's possible to override the `nics` key of the `server` property of the `cloudify.openstack.nodes.Server` type.

* ICMP rules show up on Horizon (Openstack GUI) as ones defined using `type` and `code` fields, rather than a port range. However, in the actual Neutron (and Nova, in case of Nova-net security groups) service, these fields are represented using the standard port range fields (i.e., `type` and `code` correspond to `port_range_min` and `port_range_max` (respectively) on Neutron security groups, and to `from_port` and `to_port` (respectively) on Nova-net security groups).
  * For example, to set a security group rule which allows *ping* from anywhere, the following setting may be declared in the blueprint:
    * `protocol`: `icmp`
    * `port_range_min`: `0` (type)
    * `port_range_max`: `0` (code)
    * `remote_ip_prefix`: `0.0.0.0/0`


# Misc

* This plugin supports transformation of resource names according to the resources prefix feature. For more information on this feature, read the [*CloudifyManager* node type's documentation](reference-types.html#cloudifymanager-type).

* The plugin's operations are each *transactional* (and therefore also retryable on failures), yet not *idempotent*. Attempting to execute the same operation twice is likely to fail.

* Over this documentation, it's been mentioned multiple times that some configuration-saving information may be available in the [Provider Context](reference-terminology.html#provider-context). The [Openstack manager blueprint](reference-openstack-manager.html) and Openstack provider both create this relevant information, and therefore if either was used for bootstrapping, the Provider Context will be available for the Openstack plugin to use.

  The exact details of the structure of the Openstack Provider Context are not documented since this feature is going through deprecation and will be replaced with a more advanced one.
