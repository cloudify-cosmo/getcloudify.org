---
layout: bt_wiki
title: Node Types
category: DSL Specification
publish: true
abstract: "Node Types Declarations"
pageord: 300

---

{%summary%}
Node types are useful for defining common properties and behaviors for [node templates](dsl-spec-node-templates.html). Node templates can then be created based on these types, inheriting these definitions.
{%endsummary%}


# Node Types Declaration

The `node_types` section is a dictionary in which each item represents a type.

{%highlight yaml%}
node_types:
  type1:
    derived_from: cloudify.types.Root
    interfaces:
      ...
    properties:
      ...
  type2:
    ...
  ...
{%endhighlight%}


## Type fields

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
derived_from| no       | string      | A string referencing a parent type.
interfaces  | no       | dictionary  | A dictionary of node interfaces.
properties  | no       | dictionary  | A dictionary of node properties.


### derived_from

The `derived_from` property may be used to build over and extend an existing type. This is useful for further extracting common properties and behaviors, this time in between *types*.

Using this mechanism, one can build various [type hierarchies](reference-terminology.html#type-hierarchy) which can be reused over different application blueprints.


When a type derives from another type, its `interfaces` and `properties` keys get merged with the parent type's `interfaces` and `properties` keys. The merge is on the property/operation level: A property defined on the parent type will be overridden by a property with the same name defined on the deriving type. The same is true for an interface operation mapping - however, it is important to note that it's possible to add in the deriving type additional operation mappings to an interface defined in the parent type. See the [examples section](#examples) for more on this.

{%note title=Note%}
When not deriving from any other type, it's good practice to derive from the `cloudify.types.Root` type defined in the [Cloudify built-in types](reference-types.html).

Not doing so will require either [writing custom workflows](guide-authoring-workflows.html) or declaring the `cloudify.interfaces.lifecycle` interface in this new type, since the [built-in *install* and *uninstall* workflows](reference-builtin-workflows.html) are based on interfaces declared for the `cloudify.types.Root` type.
{%endnote%}


### interfaces

The `interfaces` property may be used to define common behaviors for node templates. See more over at the [Interfaces documentation](dsl-spec-interfaces.html).


### properties

The `properties` property may be used to define a common properties schema for node templates.

`properties` is a dictionary from a property name to a dictionary describing the property. The nested dictionary includes the following keys:

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
description | no       | string      | Description for the property.
type        | no       | string      | Property type. Not specifying a data type means the type can be anything (including types not listed in the valid types). Valid types: string, integer, float, boolean.
default     | no       | \<any\>     | An optional default value for the property.



# Examples

The following is an example node type definition (extracted from the [Cloudify-Nodecellar-Example blueprint](https://github.com/cloudify-cosmo/cloudify-nodecellar-example)):

{%highlight yaml%}
node_types:
  nodecellar.nodes.MongoDatabase:
    derived_from: cloudify.nodes.DBMS
    properties:
      port:
        description: MongoDB port
        type: integer
    interfaces:
      cloudify.interfaces.lifecycle:
        create: scripts/mongo/install-mongo.sh
        start: scripts/mongo/start-mongo.sh
        stop: scripts/mongo/stop-mongo.sh
{%endhighlight%}


An example of how to use this type follows:

{%highlight yaml%}
node_templates:
  MongoDB1:
    type: nodecellar.nodes.MongoDatabase
  MongoDB2:
    type: nodecellar.nodes.MongoDatabase
{%endhighlight%}


Each of these two nodes will now have both the `port` property and the three operations defined for the `nodecellar.nodes.MongoDatabase` type.


Finally, an example on how to extend an existing type by deriving from it:

{%highlight yaml%}
node_types:
  nodecellar.nodes.MongoDatabaseExtended:
    derived_from: nodecellar.nodes.MongoDatabase
    properties:
      enable_replication:
        description: MongoDB replication enabling flag
        type: boolean
        default: false
    interfaces:
      cloudify.interfaces.lifecycle:
        create: scripts/mongo/install-mongo-extended.sh
        configure: scripts/mongo/configure-mongo-extended.sh
{%endhighlight%}

The `nodecellar.nodes.MongoDatabaseExtended` type derives from the `nodecellar.nodes.MongoDatabase` type which was defined in the previous example; As such, it derives its properties and interfaces definitions, which get either merged or overridden by the ones it defines itself.

A node template whose type is `nodecellar.nodes.MongoDatabaseExtended` will therefore have both the `port` and `enable_replication` properties, as well as the following interfaces mapping:

{%highlight yaml%}
    interfaces:
      cloudify.interfaces.lifecycle:
        create: scripts/mongo/install-mongo-extended.sh
        configure: scripts/mongo/configure-mongo-extended.sh
        start: scripts/mongo/start-mongo.sh
        stop: scripts/mongo/stop-mongo.sh
{%endhighlight%}

As it is evident, the `configure` operation, which is mapped only in the extending type, got merged with the `start` and `stop` operations which are only mapped in the parent type, while the `create` operation, which is defined on both types, will be mapped to the value set in the extending type.