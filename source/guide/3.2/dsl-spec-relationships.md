---
layout: bt_wiki
title: Relationships
category: Blueprints DSL
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
      - type: ""
        target: ""
        properties:
            connection_type: ""
        source_interfaces: {}
        target_interfaces: {}
    ...
{%endhighlight%}

## Relationship Definition

Keyname          | Required | Type        | Description
-----------      | -------- | ----        | -----------
type             | yes      | string      | Either a newly declared relationship type or one of the relationship types provided by default when importing the [types.yaml](https://github.com/cloudify-cosmo/cloudify-manager/blob/master/resources/rest-service/cloudify/types/types.yaml) file.
target           | yes      | string      | The node's name to relate the current node to.
connection_type  | no       | string      | valid values: `all_to_all` and `all_to_one` (explained below)
source_interfaces| no       | dict        | A dict of interfaces.
target_interfaces| no       | dict        | A dict of interfaces.

<br>

By default, nodes can be related by using the relationship types described below. You may also [declare your own](#declaring-relationship-types) relationship types.

## The *cloudify.relationships.depends_on* relationship type

A node depends on another node. For example, the creation of a new subnet depends on the creation of a new network.

{%warning title=Note%}
The `cloudify.relationships.depends_on` relationship type is meant to be used as a logical representation of dependencies between nodes. As such, you should only use it in very specific cases when the other two do not fit or when you want to suggest that a certain node should be created before or after another for the sake of order - not when a node actually depends on another node. Use with caution!
{%endwarning%}

The other two relationship types inherit from the `cloudify.relationships.depends_on` relationship type. The semantics of the `cloudify.relationships.connected_to` relationship type is the same, therefore, usage reference should be dictated by `cloudify.relationships.connected_to` which is described below.


## The *cloudify.relationships.contained_in* relationship type

A node is contained in another node. For example, a web server is contained within a vm.

Example:

{%highlight yaml%}
node_templates:

  vm:
    type: cloudify.nodes.Compute
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

In the above example, the `http_web_server` node is contained within a `vm` node.
Practically, this means that:

* The `vm`'s [node instances]({{page.terminology_link}}#node-instance) will be created before the `http_web_server`'s node instances.
* Two instances of the `http_web_server` node will be created within each of the two node instances of the `vm` node. This means that we will have 4 node instances of the `http_web_server` node.

The last bullet is a bit tricky. The number of node instances for each node that is contained within another node will be determined by multiplying the number of instances requested for the contained node and the actual number of instances of the node it is contained in.

Let's break this down:

node 'A' is set to have 'X' node instances; node 'B' is set to have 'Y' node instances; node B is `cloudify.relationships.contained_in` node A.
Then, node 'A' will have X node instances and node 'B' will have X*Y node instances - Y node instances per node instance in 'A'.

{%warning title=Note%}
There can only be one `cloudify.relationships.contained_in` relationship per node!
{%endwarning%}

Note that the implementation of `cloudify.relationships.contained_in` doesn't necessarily dictate that a node must be **physically** contained in another node.

For instance, a counter-example to the `http_web_server` in a `vm` would be an `ip` node that is contained in a `network` node. While the ip isn't really contained within the network itself, if two instances of the `ip` node will be `cloudify.relationships.contained_in` the `network` node, you will have 2 `ip` node instances in each instance of the `network` node.

<!--

there's some workflow-related API which also touches on the 'contained_in' type, e.g. "contained_instances" property of the CloudifyWorkflowNodeInstance class - basically these are used to form subgraphs to execute operations on specific nodes etc.
 -->


## The *cloudify.relationships.connected_to* relationship type

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
    type: cloudify.nodes.Compute
    instances:
      deploy: 2
{%endhighlight%}

In the above example, an `application` node is connected to a `database` node (and both the `database` and the `application` nodes are contained in a `vm` node.)

Note that since we deployed two vm node instances, two application node instances and one database node instance, each of the two vm's will contain one database node instance and two application node instances as explained in the [cloudify.relationships.contained_in](#contained-in) relationship type.

This actually means that we will have four application node instances (two on each vm node instance) and two database node instance (one on each vm node instance). All application node instances will be connected to each of the two databases residing on the two vm's.


## Multi-instance cloudify.relationships.connected_to semantics

A specific feature in `cloudify.relationships.connected_to` allows you to connect a node to an arbitrary instance of another node.

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

In the above example we have two `application` node instances connecting to **one** of the two `database` node instances arbitrarily.

The default configuration for `connection_type` is `all_to_all`.

The same `connection_type` configuration can be applied to a `cloudify.relationships.contained_in` relationship type, though it will virtually have no effect.


## *connection_type*: *all_to_all* and *all_to_one*
As mentioned previously, the relationship types `cloudify.relationships.connected_to` and `cloudify.relationships.depends_on` and those that derive from it have a property named `connection_type` whose value can be either `all_to_all` or `all_to_one` (The default value is `all_to_all`).
The following diagrams aim to make their semantics clearer.

### *all_to_all*
Consider this blueprint:

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
            connection_type: all_to_all
  database:
    type: database
    instances:
      deploy: 2
{%endhighlight%}

When deployed, we will have 2 node instances of the `application` node and 2 node instances of the `database` node. *All* `application` node instances will be connected to *all* `database` node instances as follows:

![all_to_all diagram](/guide/images3/guide/relationships-all-to-all.png)

### *all_to_one*
Consider this blueprint:

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

When deployed, we will have 2 node instances of the `application` node and 2 node instances of the `database` node. *All* `application` node instances will be connected to *one* `database` node instance (chosen at random) as follows:

![all_to_one diagram](/guide/images3/guide/relationships-all-to-one.png)


# Relationship Instances

Let's assume you have a node with two instances and two relationships configured for them.

When a deployment is created, node instances are instantiated in the model.
Just like node instances are instantiated for each node, relationship instances are instantiated for each relationship.


# Declaring Relationship Types

You can declare your own relationship types in the relationships section in the blueprint.
This is useful when you want to change the default implementation of how nodes interact.

## Relationship Type Declaration

Declaring relationship types is done like so:

{%highlight yaml%}
relationships:

  relationship1:
    derived_from: ""
    source_interfaces: {}
    target_interfaces: {}
    properties:
      connection_type: ""

  relationship2: {}
    ...
{%endhighlight%}

## Relationship Type Definition

Keyname           | Required | Type        | Description
-----------       | -------- | ----        | -----------
derived_from      | no       | string      | The relationship type from which the new relationship is derived.
source_interfaces | no       | dict        | A dict of interfaces.
target_interfaces | no       | dict        | A dict of interfaces.
connection_type   | no       | string      | valid values: `all_to_all` and `all_to_one`

<br>


Example:

{%highlight yaml%}
relationships:
  app_connected_to_db:
    derived_from: cloudify.relationships.connected_to
    source_interfaces:
      cloudify.interfaces.relationship_lifecycle:
        postconfigure:
          implementation: scripts/configure_my_connection.py

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

In the above example, we create a relationship type called `app_connected_to_db` which inherits from the base `cloudify.relationships.connected_to` relationship type and implements a specific configuration (by running scripts/configure_my_connection.py) for the type.


# Relationship Interfaces

Each relationship type (and instance) has `source_interfaces` and `target_interfaces`.

For a given node:

* `source_interfaces` defines interfaces of operations that will be executed on the node in which the relationship is declared.
* `target_interfaces` defines interfaces of operations that will be executed on the node its relationship targets.

{%note title=Note%}
Having the interfaces defined under `source_interfaces` and `target_interfaces` does not necessarily mean that their operations will be executed. That is, operations defined in `cloudify.interfaces.relationship_lifecycle` will be executed when running `install`/`uninstall` workflows. We can also add a custom relationship interface and write a custom workflow that will execute operations from the new interface.
{%endnote%}

Example:

{%highlight yaml%}
relationships:
  source_connected_to_target:
    derived_from: cloudify.relationships.connected_to
    source_interfaces:
      cloudify.interfaces.relationship_lifecycle:
        postconfigure:
          implementation: scripts/configure_source_node.py
    target_interfaces:
      cloudify.interfaces.relationship_lifecycle:
        postconfigure:
          implementation: scripts/configure_target_node.py

node_templates:
  source_node:
    type: app
    relationships:
      - type: source_connected_to_target
        target: target_node
{%endhighlight%}

In the above example we can see that the `postconfigure` lifecycle operation in the `source_connected_to_target` relationship type is configured once in its `source_interfaces` section and `target_interfaces` section.

As such, the configure_source_node.py script will be executed on host instances of `source_node` and the configure_target_node.py will be executed on host instances of `target_node` (this is only true if the plugin executor is configured as `host_agent` and not `central_deployment_agent`. Otherwise, `source_interfaces` operations and `target_interfaces` operations are all executed on the manager.)

## How Relationships Affect Node Creation

Declaring relationships affects the node creation/teardown flow in respect to the `install`/`uninstall` workflows respectively.

When declaring a relationship and using the built in `install` workflow, the first lifecycle operation of the source node will only be executed once the entire set of lifecycle operations of the target node were executed and completed.
When using the `uninstall` workflow, the opposite will be true.

So, for instance, in the previous example, all source operations (`node_instance` operations, `source_interfaces` relationships operations and `target_interfaces` relationship operations) for `source_node` will be executed AFTER ALL `target_node` operations have been completed. This removes any uncertainties about whether a node was ready to have another node connect to or be contained in it due to it not being available. Of course, it's up to the user to define what "ready" means.
