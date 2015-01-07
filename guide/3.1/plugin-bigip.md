---
layout: bt_wiki
title: F5 BIG-IP Plugin
category: Plugins
publish: true
abstract: "Cloudify F5 BIG-IP description"
pageord: 670
---
{%summary%}
{%endsummary%}


# Description

The BIG-IP plugin provides an interface to F5 BIG-IP functionality. At the moment, the following functionality is supported:

{: .table .table-bordered}
| Category | Operations |
|:---------|:-----------|
| Load-balancing pools | Creating pools |
|                      | Deleting pools |
|                      | Adding a member to a pool |
|                      | Deleting a member from a pool |

# Types

## cloudify.bigip.nodes.Pool

**Description:** Represents a BIG-IP load-balancing pool.

**Derived From:** [cloudify.nodes.LoadBalancer](reference-types.html)

**Properties:**

  * `host` (*Required*): the host address of the BIG-IP server.
  * `username` (*Required*): the username to use when authenticating to, and executing commands against, the BIG-IP server.
  * `password` (*Required*): the password used to authenticate against the BIG-IP server.
  * `pool_id` (*Required*): the pool's identifier.
  * `lb_method`: the pool's load-balancing method. Must be one of the string values defined in the [LBMethod type](https://devcentral.f5.com/wiki/iControl.LocalLB__LBMethod.ashx)). Defaults to `LB_METHOD_ROUND_ROBIN`.

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create`: register the pool with the BIG-IP server.
  * `cloudify.interfaces.lifecycle.delete`: unregisters the pool from the BIG-IP server.

# Relationships

## cloudify.bigip.pool_to_endpoint

**Description:** Defines a relationship between a pool and an endpoint.

**Derived From:** [cloudify.relationships.connected_to](reference-types.html)

**Mapped Operations:**

  * `cloudify.interfaces.relationship_lifecycle.establish`: adds the target endpoint to the pool.
  * `cloudify.interfaces.relationship_lifecycle.unlink`: removes the target endpoint from the pool.

Both operations expect the following inputs:

  * `address`: the host address of the pool member to add/remove. As this relationship is most commonly used with a floating IP node as the target, the default value for this input is the value of the target's `floating_ip_address` attribute.
  * `port` (*Required*): the port of the pool member to add/remove.

## cloudify.bigip.pool_to_application

**Description:** Defines a relationship between a pool and the application served by the pool. This relationship is useful in order to ensure
that a pool is never established before the application is ready to serve requests.

**Derived From:** [cloudify.relationships.depends_on](reference-types.html)

# Example

The following example will demonstrate how the BIG-IP plugin is used within an OpenStack topology.

{% highlight yaml %}
inputs:
    host: {}
    username: {}
    password: {}
    pool_id: {}
    lb_method:
        default: LB_METHOD_ROUND_ROBIN

node_templates:
    floating_ip:
        type: cloudify.openstack.nodes.FloatingIP

    application:
        type: cloudify.nodes.ApplicationModule
        properties:
            port:
                description: port used to communicate with the application
                type: integer

    lb_pool:
        type: cloudify.bigip.nodes.Pool
        properties:
            host: { get_input: host }
            username: { get_input: username }
            password: { get_input: password }
            pool_id: { get_input: pool_id }
            lb_method: { get_input: lb_method }
        relationships:
          - type: cloudify.bigip.pool_to_application
            target: application
          - type: cloudify.bigip.pool_to_endpoint
            target: floating_ip
            source_interfaces:
                cloudify.interfaces.relationship_lifecycle:
                    establish:
                        inputs:
                            port: { get_property: [ app, port ] }
                    unlink:
                        inputs:
                            port: { get_property: [ app, port ] }
{%endhighlight%}

Step-by-step explanation:

* `floating_ip` is used as a placeholder for any floating IP definition. For clarity, other node-related properties are omitted.
* `application` is used as a placeholder for an arbitrary application served by the pool.
* `lb_pool` is the actual pool node definition.
  * The pool node receives its properties through deployment inputs.
  * The pool will not be constructed before the application is constructed. This is achieved by the `cloudify.bigip.pool_to_application` relationship.
  * The pool definition includes a relationship to the `floating_ip`, thereby adding the floating IP to the pool. The host address is obtained dynamically through the `floating_ip_address` attribute of the `floating_ip` node.
