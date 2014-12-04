---
layout: bt_wiki
title: Relationships
category: DSL Specification
publish: true
abstract: "Relationships Between Nodes"
pageord: 300

---
{%summary%}{{page.abstract}}{%endsummary%}

RELATIONSHIP TYPES
RELATIONSHIP INSTANCES
USAGE

# *Relationships*

Relationships let you define how [nodes]() relate to one another. By default, nodes can be related using the 3 relationship types described below. You may also [declare your own](#declaring-relationship-types) relationship types of course.

The 3 built in types are:

## *depends_on*
A node depends on another node. For example, the creation of a new subnet depends on the creation of a new network.

{%warning title=Note%}
The `depends_on` relationship type is meant to be used as a logical representation of dependencies between nodes. As such, you should only use it in very specific cases when the other two do not fit or when you want to suggest that a certain node should be created before or after another for the sake of order - not when a node actually depends on another node. Use with caution!
{%endwarning%}

The other two relationship types inherit from the `depends_on` relationship type. The implementation of the `connected_to` relationship type is the same, therefore, usage reference should be dictated by `connected_to` which is described below.

## *contained_in*
A node is contained in another node. For example, an `http_web_server` is contained within a `vm`.

Example:

{%highlight yaml%}
node_templates:

  vm:
    type: cloudify.nodes.Server
    instances:
      deploy: 2

  http_web_server:
    type: cloudify.nodes.WebServer
    instances:
      deploy: 2
    properties:
      port: { get_input: webserver_port }
    relationships:
      - type: cloudify.relationships.contained_in
        target: vm
    interfaces:
      cloudify.interfaces.lifecycle:
        configure: scripts/configure.sh
        start:
          implementation: scripts/start.sh
          inputs:
            process:
              env:
                port: { get_input: webserver_port }
        stop: scripts/stop.sh
{%endhighlight%}

In the above example, the http_web_server node is contained within a `vm` node.
This practically means that:

* The `vm`'s [node instances]() will be created before the `http_server_server`'s node instances.
* The http_web_server node will inherit the `host_id` runtime property of the `vm` it is contained in. That is true even if a node is contained within another node that is contained within a vm. Any node, no matter how nested it is within the topology will always receive the `host_id` runtime property of the host it resides in.
* Two instances of the http_web_server node will be created within each of the two node instances of the vm node. That means that we will have 4 node instances of the http_web_server node.

The last bullet is a bit tricky. The number of node instances for each node that is contained within another node will be determined by multiplying the number of instances requested for the contained node and the number of instances requested for the node it is contained in.

Let's break this down:

node 'A' is set to have 'X' node instances; node 'B' is set to have 'Y' node instances; node B is `contained_in` node A.
Then, node 'A' will have X node instances and node 'B' will have X*Y node instances - Y node instances per node instance in 'A'.

{%warning title=Note%}
There can only be one `contained_in` relationship per node!
{%endwarning%}

Note that the implementation of `contained_in` doesn't necessarily dictate that a node must be *physically* contained in another node.

For instance, a counter-example to the `http_web_server` in a `vm` would be an `ip` node that is `contained_in` a `network` node. While the `ip` isn't really contained within the network itself, if two instances of the `ip` node will be `contained_in` the `network` node, you will have 2 `ip` node instances in each instance of the `network` node.

<!--

2) it has different multi-instance semantics (i've heard Dan already went over this with you)

3) host_id and host_ip: host_id is a node's attribute (set in deployment creation) and host_ip is a plugin context method which retrieves the ip of the host node by looking at its properties/runtime-props dynamically. They are affected by the contained_in as obviously this is how we determine the host node for a given node. These in turn lead to other semantic differences, e.g. an agent plugin must be used on a node which has a host node (i.e. IS a host node or is connected to one via contained_in relationships) - however these are byproducts and are not directly part of the contained_in semantics.

4) ​lastly, there's some workflow-related API which also touches on the 'contained_in' type, e.g. "contained_instances" property of the CloudifyWorkflowNodeInstance class - basically these are used to form subgraphs to execute operations on specific nodes etc.
 -->

## *connected_to*
A node is connected to another node. For example, an `application` is `connected_to` a `database` and both of them are `contained_in` a `vm`.

Example:

{%highlight yaml%}
node_templates:

  application:
    type: web_app
    instances:
      deploy: 2
    relationships:
      - type: cloudify.relationships.contained_in
        target: vm
      - type: cloudify.relationships.connected_to
        target: database

  database:
    type: database
    instances:
      deploy: 1
    relationships:
      - type: cloudify.relationships.contained_in
        target: vm

  vm:
    type: cloudify.nodes.Server
    instances:
      deploy: 2
{%endhighlight%}

In the above example, an application node is `connected_to` a database node (and both the database and the application nodes are `contained_in` a vm node.)

Note that since we deployed two `vm` node instances, two `application` node instances and one `database` node instance, each of the two vm's will contain one `database` node instance and two `application` node instances as explained in the [contained_in](#contained-in) relationship type.

This actually means that we will have four `application` node instances (two on each `vm` node instance) and one `database` node instance (one on each `vm` node instance). All `application` node instances will be `connected_to` each of the two databases residing on the two vm's.

## Multi-instance `connected_to` semantics

A specific feature in `connected_to` allows you to connect a node to an arbitrary instance of another node.

Example:

{%highlight yaml%}
node_templates:

  application:
    type: web_app
    instances:
      deploy: 2
    relationships:
      - type: cloudify.relationships.connected_to
        target: database
        connection_type:
            default: all_to_one

  database:
    type: database
    instances:
      deploy: 2

{%endhighlight%}

In the above example we have two `application` node instances connecting to *one* of the two `database` node instances arbitrarily.
The default configuration for `connection_type` is `all_to_all`.

# Declaring relationship types

You can declare your own relationship types in the relationships section in the blueprint.

Example:

{%highlight yaml%}
relationships:
  app_connected_to_db:
    derived_from: cloudify.relationships.connected_to
    source_interfaces:
      cloudify.interfaces.relationship_lifecycle:
          postconfigure:
              implementation: scripts/configure_my_connection.py
              inputs: {}

node_templates:
  application:
    type: web_app
    instances:
      deploy: 2
    relationships:
      - type: cloudify.relationships.contained_in
        target: vm
      - type: app_connected_to_db
        target: database
{%endhighlight%}

In the above example, we create a relationship type called `app_connected_to_db` which inherits from the base `connected_to` relationship type and implements a specific configuration (by running scripts/configure_my_connection.py) for the type.