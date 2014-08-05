---
layout: bt_wiki
title: Openstack Plugin
category: Plugins
publish: true
abstract: Cloudify Openstack plugin description and configuration
pageord: 600
---


{%summary%}
This section describes how to use OpenStack based cloud infrastructure in your services and applications.
For more information about OpenStack, please refer to: [https://www.openstack.org/](https://www.openstack.org/).
{%endsummary%}


# Types

{%tip title=Tip%}
Each type has one or both of the properties `nova_config` and `neutron_config`. These can be used to pass parameters for authenticating with the requested Openstack services. However, if the Cloudify bootstrap was done using Openstack Provider in the current region, there's no need to override these properties, and the authentication will take place with the same credentials that were used for the Cloudify bootstrap process. For more information, see the [Misc section - Openstack authentication](#openstack-authentication).
{%endtip%}

{%info title=Information%}
Each object of any type (with the exception of Floating IP) has a name on Openstack. This name can be set using the `name` key under the relevant object property (e.g. `server` for `cloudify.openstack.server`, `subnet` for `cloudify.openstack.subnet`, etc.). If it isn't set, the Cloudify node ID will be used as the name.
{%endinfo%}

{%warning title=Warning%}
It is important to **ensure that Openstack names are unique** (for a given type): While Openstack technically allows for same name objects for any type except Server, having identical names for objects of the same type will lead to ambiguities and errors.
{%endwarning%}

## cloudify.openstack.server

**Derived From:** [cloudify.types.host](reference-types.html)

**Properties:**

* `server` key-value server configuration as described in [OpenStack compute create server API](http://docs.openstack.org/api/openstack-compute/2/content/POST_createServer__v2__tenant_id__servers_CreateServers.html).
  * **Notes:**
    * The `nics` key must not be used. To connect the server to networks, the Server node should be connected to Network nodes and/or Port nodes via relationships. These will then be translated into the appropriate `nics` definitions automatically.
    * The `key_name` key needs to match the private key file whose path is set at `cloudify_agent`'s `key` property (see [cloudify.types.host's properties](reference-types.html)). This should be the *agents-keypair* that was used in the bootstrap process. If the Cloudify bootstrap was done using Openstack Provider, there's no need to override this property, and it will be set automatically.
    * The server should use the agents security group. If Cloudify bootstrap wasn't done using the Openstack Provider, this group should be set by using the `security_groups` key. Otherwise, this group will be set for the server automatically, whether passed as part of the `security_groups` value or not (including the case where the `security_groups` key isn't passed at all).
  * **Sugaring:**
    * `image_name` will automatically resolve the Openstack name of an image into an `image_id`
    * `flavor_name` will automatically resolve the Openstack name of a flavor into a `flavor_id`
    * the `userdata` key may receive either a string (passed as-is to Nova in the create server request), or a dictionary containing:
      * a field `type` whose value is `http`
      * a field `url` whose value is a url to a `userdata` script
* `management_network_name` Cloudify's management network name. Every server should be connected to the management network. If the Cloudify bootstrap was done using Openstack Provider, this is done automatically and there's no need to override this property. Otherwise, it is required to set the value of this property to the management network name as it was set in the bootstrap process. *Note*: When using a flat network (e.g. when using Openstack Folsom), don't set this property.
* `nova_config` see [Misc section - Openstack authentication](#openstack-authentication)
* `neutron_config` see [Misc section - Openstack authentication](#openstack-authentication)


{%note title=Note%}
This type has the property `neutron_config` as it requires communication with the Openstack Neutron service for connecting the server to networks.
{%endnote%}


## cloudify.openstack.windows_server

**Derived From:** [cloudify.openstack.server](#cloudifyopenstackserver)

This type has the same properties as the type above (as it derives from it). Use this type when working with a Windows server.


## cloudify.openstack.subnet

**Derived From:** [cloudify.types.subnet](reference-types.html)

**Properties:**

* `subnet` key-value subnet configuration as described in [OpenStack network create subnet API](http://docs.openstack.org/api/openstack-network/2.0/content/create_subnet.html)
  * **Notes:**
    * The `network_id` key should not be used. Instead, the Subnet node should be connected to *exactly* one Network node via a relationship. It will then be placed on that network automatically.
* `neutron_config` see [Misc section - Openstack authentication](#openstack-authentication)


## cloudify.openstack.security_group

**Derived From:** [cloudify.types.base](reference-types.html)

**Properties:**

* `security_group` key-value security_group configuration as described in [OpenStack network create security group API](http://docs.openstack.org/api/openstack-network/2.0/content/POST_createSecGroup__v2.0_security-groups_security_groups.html)
  * **Sugaring:**
    * `port` key may be used instead of the `port_range_max` and `port_range_min` keys to limit the rule to a single port.
    * `remote_group_node` can be used instead of `remote_group_id` to specify a remote group, by supplying this key with a value which is the name of the remote security group node. Note that like the `remote_group_id` key, this shouldn't be provided if `remote_ip_prefix` was provided.
    * `remote_group_name` will automatically resolve the Openstack name of a security group into a `remote_group_id`. Note that like the `remote_group_id` key, this shouldn't be provided if `remote_ip_prefix` was provided.
* `rules` key-value security_group_rule configuration as described in [OpenStack network create security group rule](http://docs.openstack.org/api/openstack-network/2.0/content/POST_createSecGroupRule__security-group-rules_.html)
* `disable_egress` a flag for disallowing **all** egress traffic (as the default for Neutron security groups is to [allow all egress traffic](https://wiki.openstack.org/wiki/Neutron/SecurityGroups#Behavior)). *Note*: When using this flag, don't provide any `rules` whose *direction* value is *egress*. To simply limit the egress traffic, provide `rules` with *direction* value *egress* but without this flag, and the default rule for allowing all egress traffic will be automatically deleted before applying the provided egress rules.
* `neutron_config` see [Misc section - Openstack authentication](#openstack-authentication)


## cloudify.openstack.router

**Derived From:** [cloudify.types.router](reference-types.html)

**Properties:**

* `router` key-value router configuration as described in [OpenStack network create router API](http://docs.openstack.org/api/openstack-network/2.0/content/router_create.html)
  * **Notes:**
    * Currently, a router must have an interface in the external network. The external network must be provided using the `external_gateway_info` key, unless Cloudify bootstrap was done using OpenStack provider (in which case the external network will be detected automatically).
  * **Sugaring:**
    * `network_name` under `external_gateway_info` will automatically resolve the Openstack name of a network into the `network_id`
* `neutron_config` see [Misc section - Openstack authentication](#openstack-authentication)


## cloudify.openstack.port

**Derived From:** [cloudify.types.base](reference-types.html)

**Properties:**

* `port` key-value port configuration as described in [OpenStack network create port API](http://docs.openstack.org/api/openstack-network/2.0/content/Create_Port.html)
  * **Notes:**
    * The `network_id` key should not be used. Instead, the Port node should be connected to *exactly* one Network node via a relationship. It will then be placed on that network automatically.
* `neutron_config` see [Misc section - Openstack authentication](#openstack-authentication)


## cloudify.openstack.network

**Derived From:** [cloudify.types.network](reference-types.html)

**Properties:**

* `network` key-value network configuration as described in [OpenStack network create network API](http://docs.openstack.org/api/openstack-network/2.0/content/Create_Network.html)
* `neutron_config` see [Misc section - Openstack authentication](#openstack-authentication)


## cloudify.openstack.floatingip

**Derived From:** [cloudify.types.base](reference-types.html)

**Properties:**

* `floatingip` key-value floatingip configuration as described in [OpenStack network create floating ip API](http://docs.openstack.org/api/openstack-network/2.0/content/floatingip_create.html)
  * **Notes:**
    * a `floating_ip_address` key can be passed for using an existing allocated floating IP. The value is the existing floating IP address.
  * **Sugaring:**
    * `floating_network_name` will automatically resolve the Openstack name of a network into the `floating_network_id`
    * `ip` equivalent of the `floating_ip_address` key
* `neutron_config` see [Misc section - Openstack authentication](#openstack-authentication)


# Relationships

## cloudify.openstack.port_connected_to_security_group

**Description:** A relationship for a port to a security group.


## cloudify.openstack.subnet_connected_to_router

**Description:** A relationship for connecting a subnet to a router.


## cloudify.openstack.server_connected_to_floating_ip

**Description:** A relationship for associating a floating ip with a server.


## cloudify.openstack.server_connected_to_port

**Description:** A relationship for connecting a server to a port. *Note*: This is a marker relationship, and has no operations associated with it. A server will automatically be connected to any port whose node  is connected to the server's node with any relationship.


## cloudify.openstack.floating_ip_connected_to_port

**Description:** A relationship for associating a floating ip with a port. *Note*: This is a marker relationship, and has no operations associated with it. A floating ip will automatically be associated with any port whose node is connected to the floating ip's node with any relationship.



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
- name: my_floating_ip
  type: cloudify.openstack.floatingip
  properties:
    floatingip:
      floating_network_name: Ext-Net


- name: my_network
  type: cloudify.openstack.network
  properties:
    network:
      name: my_network_openstack_name


- name: my_subnet
  type: cloudify.openstack.subnet
  properties:
    subnet:
      name: my_subnet_openstack_name
      cidr: 1.2.3.0/24
      ip_version: 4
  relationships:
    - target: my_network
      type: cloudify.relationships.contained_in


- name: my_security_group
  type: cloudify.openstack.security_group
  properties:
    security_group:
      name: my_security_group_openstack_name
    rules:
      - remote_ip_prefix: 0.0.0.0/0
        port: 8080


- name: my_server
  type: cloudify.openstack.server
  properties:
    - server:
        name: my_server_openstack_name
        image: 8672f4c6-e33d-46f5-b6d8-ebbeba12fa02
        flavor: 101
        security_groups: [my_security_group_openstack_name]
  relationships:
    - target: my_network
      type: cloudify.relationships.connected_to
    - target: my_subnet
      type: cloudify.relationships.depends_on
    - target: my_floating_ip
      type: cloudify.openstack.server_connected_to_floating_ip
    - target: my_security_group
      type: cloudify.relationships.depends_on
{%endhighlight%}

Node by node explanation:

1. Creates a floating IP, whose node name is `my_floating_ip`, and whose floating_network_name is `Ext-Net` (This value represents the name of the external network).

2. Creates a network, whose node name is `my_network`, and whose name on Openstack is `my_network_openstack_name`.

3. Creates a subnet, whose node name is `my_subnet`, and whose name on Openstack is `my_subnet_openstack_name`. The subnet's address range is defined to be 1.2.3.0 - 1.2.3.255 using the `cidr` parameter, and the subnet's IP version is set to version 4. The subnet will be set on the `my_network_openstack_name` network because of the relationship to the `my_network` node.

4. Creates a security_group, whose node name is `my_security_group`, and whose name on Openstack is `my_security_group_openstack_Name`. The security group is set with a single rule, which allows all traffic (since we use the address range `0.0.0.0/0`) to port `8080` (default direction is *ingress*).

5. Creates a server, whose node name is `my_server`, and whose name on openstack is `my_server_openstack_name`. The server is set with an image and flavor IDs, as well as the security group we defined in step 4. The server is set with multiple relationships:
  - A relationship to the `my_network` node: Through this relationship, the server will be automatically placed on the `my_network_openstack_name` network.
  - A relationship to the `my_subnet` node: This relationship is strictly for ensuring the order of creation is correct, as the server requires the `my_subnet_openstack_name` subnet to exist before it can be created on it.
  - A relationship to the `my_floating_ip` node: This designated relationship type will take care of associating the server with the floating IP represented by the `my_floating_ip` node.
  - A relationship with the `my_security_group` node: This relationship is strictly for ensuring the order of creation is correct, as the server requires the `my_security_group_openstack_name` security group to exist before it can be set with it. The actual link between the two is done via the `security_groups` key of the `server` property,
{% endgcloak %}


## Example II

This example will show how to use the `router` and `port` types, as well as some of the relationships that were missing from Example I.

We'll see how to create a server connected to a port, where the port is set on a subnet in a network, and has a security group set on it. Finally, we'll see how this subnet connects to a router and from there to the external network.

{% togglecloak id=2 %}
Example II
{% endtogglecloak %}

{% gcloak 2 %}
The following is an excerpt from the blueprint's `blueprint`.`nodes` section:

{% highlight yaml %}
- name: my_network
  type: cloudify.openstack.network
  properties:
    network:
      name: my_network_openstack_name


- name: my_security_group
  type: cloudify.openstack.security_group
  properties:
    security_group:
      name: my_security_group_openstack_name
    rules:
      - remote_ip_prefix: 0.0.0.0/0
        port: 8080


- name: my_subnet
  type: cloudify.openstack.subnet
  properties:
    subnet:
      cidr: 1.2.3.0/24
      ip_version: 4
      name: my_subnet_openstack_name
  relationships:
    - target: my_network
      type: cloudify.relationships.contained_in
    - target: my_router
      type: cloudify.openstack.subnet_connected_to_router


- name: my_port
  type: cloudify.openstack.port
  properties:
    port:
      name: my_port_openstack_name
  relationships:
    - target: my_network
      type: cloudify.relationships.contained_in
    - target: my_subnet
      type: cloudify.relationships.depends_on
    - target: my_security_group
      type: cloudify.openstack.port_connected_to_security_group


- name: my_router
  type: cloudify.openstack.router
  properties:
    router:
      name: my_router_openstack_Name


- name: my_server
  type: cloudify.openstack.server
  properties:
    - server:
        image: 8672f4c6-e33d-46f5-b6d8-ebbeba12fa02
        flavor: 101
    - cloudify_agent:
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



# Misc

## Openstack authentication

If the Cloudify bootstrap was done using the Openstack Provider in the current region, the authentication with Openstack will be taken care of automatically. The plugin does this by using configuration files the Openstack Provider created for it during the Cloudify bootstrap process.

However, if Cloudify bootstrap was done in a different method, or if there's a need to override the credentials and/or region configuration, this can be achieved by either creating these configuration files on the management server manually, or by supplying each object of the types in this plugin with the appropriate `nova_config` and/or `neutron_config` values, which will override the configuration files values for the authentication process.

The mentioned configuration files are two JSON files, where one holds the credentials and Nova region data, and the other holds the Neutron URL. Specifically, the first file (*keystone config*) is expected to look like so:
{% highlight json %}
{
    "username": "Enter-Openstack-Username-Here",
    "password": "Enter-Openstack-Password-Here",
    "tenant_name": "Enter-Openstack-Tenant-Name-Here",
    "auth_url": "Enter-Openstack-Auth-Url-Here",
    "region": "Enter-Openstack-Region-Here"
}
{%endhighlight%}
and the second file (*neutron config*) is expected to look like this:
{% highlight json %}
{
    "url": "Enter-Neutron-Url-Here"
}
{%endhighlight%}

The plugin will look up these files in the following manner:

  1. The plugin will look up an environment variable named `KEYSTONE_CONFIG_PATH`, and read the config from the path which is the value of that variable if the variable exists.

  2. If the variable does not exist, the plugin will resort to try and read the config from `~/keystone_config.json`. If the file not found, an error will be raised.

The same will be applied for the second file, but with the environment variable being named `NEUTRON_CONFIG_PATH`, and the default path being `~/neutron_config.json`.


## Resources prefix support

This plugin supports transformation of resource names according to the resources prefix feature. For more information on this feature, visit the [CLI guide](guide-cli.html).