---
layout: bt_wiki
title: Relationships
category: DSL Specification
publish: true
abstract: "Node Relationships"
pageord: 300

terminology_link: reference-terminology.html
---
{%summary%}{{page.abstract}}{%endsummary%}
{%summary%}
Relationships let you define how [nodes]({{page.terminology_link}}#node) relate to one another.
{%endsummary%}

# Relationship Declaration

Declaring node relationships is done like so:

{%highlight yaml%}
node_templates:
  node:
    ...
    relationships:
      - type:
        target:
        properties:
            connection_type:
    ...
{%endhighlight%}

## Relationship Definition

Keyname        | Required | Type        | Description
-----------    | -------- | ----        | -----------
type           | yes      | string      | The relationship type to use. Either a newly declared relationship or one of the relationships provided by default.
target         | yes      | string      | The node's name to relate the current node to.
connection_type| no       | string      | valid values: `all_to_all` and `all_to_one` (explained below)

<br>

By default, nodes can be related by using the relationship types described below. You may also [declare your own](#declaring-relationship-types) relationship types.

## The *depends_on* relationship type

A node depends on another node. For example, the creation of a new subnet depends on the creation of a new network.

{%warning title=Note%}
The `depends_on` relationship type is meant to be used as a logical representation of dependencies between nodes. As such, you should only use it in very specific cases when the other two do not fit or when you want to suggest that a certain node should be created before or after another for the sake of order - not when a node actually depends on another node. Use with caution!
{%endwarning%}

The other two relationship types inherit from the depends_on relationship type. The implementation of the connected_to relationship type is the same, therefore, usage reference should be dictated by connected_to which is described below.


## The *contained_in* relationship type

A node is contained in another node. For example, a web server is contained within a vm.

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

In the above example, the http_web_server node is contained within a vm node.
This practically means that:

* The vm's [node instances]({{page.terminology_link}}#node-instance) will be created before the http_server_server's node instances.
* The http_web_server node will inherit the host_id [runtime property]({{page.terminology_link}}#runtime-properties) of the vm it is contained in. That is true even if a node is contained within another node that is contained within a vm. Any node, no matter how nested it is within the topology will always receive the host_id runtime property of the host it resides in.
* Two instances of the http_web_server node will be created within each of the two node instances of the vm node. That means that we will have 4 node instances of the http_web_server node.

The last bullet is a bit tricky. The number of node instances for each node that is contained within another node will be determined by multiplying the number of instances requested for the contained node and the number of instances requested for the node it is contained in.

Let's break this down:

node 'A' is set to have 'X' node instances; node 'B' is set to have 'Y' node instances; node B is contained_in node A.
Then, node 'A' will have X node instances and node 'B' will have X*Y node instances - Y node instances per node instance in 'A'.

{%warning title=Note%}
There can only be one `contained_in` relationship per node!
{%endwarning%}

Note that the implementation of contained_in doesn't necessarily dictate that a node must be **physically** contained in another node.

For instance, a counter-example to the http_web_server in a vm would be an ip node that is contained in a network node. While the ip isn't really contained within the network itself, if two instances of the ip node will be contained_in the network node, you will have 2 ip node instances in each instance of the network node.

<!--

2) it has different multi-instance semantics (i've heard Dan already went over this with you)

3) host_id and host_ip: host_id is a node's attribute (set in deployment creation) and host_ip is a plugin context method which retrieves the ip of the host node by looking at its properties/runtime-props dynamically. They are affected by the contained_in as obviously this is how we determine the host node for a given node. These in turn lead to other semantic differences, e.g. an agent plugin must be used on a node which has a host node (i.e. IS a host node or is connected to one via contained_in relationships) - however these are byproducts and are not directly part of the contained_in semantics.

4) ​lastly, there's some workflow-related API which also touches on the 'contained_in' type, e.g. "contained_instances" property of the CloudifyWorkflowNodeInstance class - basically these are used to form subgraphs to execute operations on specific nodes etc.
 -->


## The *connected_to* relationship type

A node is connected to another node. For example, an application is connected to a database and both of them are contained in a vm.

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

In the above example, an application node is connected_to a database node (and both the database and the application nodes are contained_in a vm node.)

Note that since we deployed two vm node instances, two application node instances and one database node instance, each of the two vm's will contain one database node instance and two application node instances as explained in the [contained_in](#contained-in) relationship type.

This actually means that we will have four application node instances (two on each vm node instance) and one database node instance (one on each vm node instance). All application node instances will be connected_to each of the two databases residing on the two vm's.


## Multi-instance connected_to semantics

A specific feature in connected_to allows you to connect a node to an arbitrary instance of another node.

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
        properties:
            connection_type: all_to_one

  database:
    type: database
    instances:
      deploy: 2
{%endhighlight%}

In the above example we have two application node instances connecting to **one** of the two database node instances arbitrarily.
The default configuration for connection_type is all_to_all.

The same connection_type configuration can be applied to a contained_in relationship type, thought it will virtually do nothing.


# Relationship Instances

Let's assume you have a node with two instances and two relationships configured for them.

When a deployment is created, node instances are instantiated in the model.
Just like node instances are instantiated for each node, relationship instances are instantiated for each relationship.
This allows to write runtime properties not only to the node instance itself but also to the relationship instance that accompanies it.


# Declaring Relationship Types

You can declare your own relationship types in the relationships section in the blueprint.
This is useful when you want to change the default implementation of how nodes interact.

## Relationship Declaration

Declaring relationship types is done like so:

{%highlight yaml%}
relationships:
  relationship1:
    ...
  relationship2:
    ...
{%endhighlight%}

## Relationship Definition

Keyname           | Required | Type        | Description
-----------       | -------- | ----        | -----------
derived_from      | no       | string      | The relationship type from which the new relationship is derived.
source_interfaces | no       | dict        | The lifecycle operations used to configure the current node.
target_interfaces | no       | dict        | The lifecycle operations used to configure the related node.

Example:

{%highlight yaml%}
relationships:
  app_connected_to_db:
    derived_from: cloudify.relationships.connected_to
    source_interfaces:
      cloudify.interfaces.relationship_lifecycle:
        postconfigure: scripts/configure_my_connection.py

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

In the above example, we create a relationship type called app_connected_to_db which inherits from the base connected_to relationship type and implements a specific configuration (by running scripts/configure_my_connection.py) for the type.


# Relationship interfaces

Each relationship type has a source_interface and target_interface.

For a given node:

* The `source_interface` defines the lifecycle operations that will be executed on the node in which the relationship is declared.
* The `target_interface` defines the lifecycle operations that will be executed on the node its relationship targets.

Example:

{%highlight yaml%}
relationships:
  source_connected_to_target:
    derived_from: cloudify.relationships.connected_to
    source_interfaces:
      cloudify.interfaces.relationship_lifecycle:
        postconfigure: scripts/configure_source_node.py
    target_interfaces:
      cloudify.interfaces.relationship_lifecycle:
        postconfigure: scripts/configure_target_node.py

node_templates:
  source_node:
    type: app
    relationships:
      - type: source_connected_to_target
        target: target_node
{%endhighlight%}

In the above example we can see that the postconfigure lifecycle operation in the source_connected_to_target relationship type is configured once in its source_interfacessection and target_interfaces section. As such, the configure_source_node.py script will be executed in source_node instances and the configure_target_node.py will be executed in target_node instances.
