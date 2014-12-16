---
layout: bt_wiki
title: Node Templates
category: DSL Specification
publish: true
pageord: 300

---
{%summary%}
Node templates represent the actual instances of node types which would eventually represent a running application/service as described in the blueprint.
{%endsummary%}

# Decleration

The `node_templates` section in the DSL is a dictionary where each key is a node template.

{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_0

imports:
  ...

inputs:
  ...

node_templates:
  node_template_1:
    ...
  node_template_2:
    ...

outputs:
  ...
{%endhighlight%}


## Definition


Keyname       | Required | Type          | Description
-----------   | -------- | ----          | -----------
type          | yes      | string        | The type of the node template.
properties    | no       | dict          | The properties of the node template matching its node type properties schema.
instances     | no       | dict          | Instances configuration.
interfaces    | no       | interfaces    | Used for mapping plugins to [interfaces](dsl-spec-interfaces.html) operation or for specifying inputs for already mapped node type operations.
relationships | no       | relationships | Used for specifying the [relationships](relationships) this node template has with other node templates.



### Instances Configuration

The `instances` key is used for configuring the deployment characteristics of the node template.

### Instances Definition

Keyname       | Required | Type     | Default | Description
-----------   | -------- | ----     | ---     | -----------
deploy        | no       | integer  | 1       | The number of [node instances](reference-terminology.html#node-instance) this node template will have.


### Example:

{%highlight yaml%}
node_templates:
  vm:
    type: cloudify.openstack.nodes.Compute
    instances:
      deploy: 5
{%endhighlight%}

In the previous example, vm node would have 5 instances when deployed.

More informatiom about number of instances combined with relationships can be found in the [relationships](dsl-spec-relationships.html) specification.




# Example

{%highlight yaml%}
node_types:
  nodes.Nginx:
    derived_from: cloudify.nodes.WebServer
    properties:
      port:
        description: The default listening port for the Nginx server.
        type: integer
    interfaces:
      cloudify.interfaces.lifecycle:
        create:
          implementation: scripts/install-nginx.sh
          inputs:
            process:
              default:
                env:
                  port: 80
        start: scripts/start-nginx.sh

node_templates:
  vm:
    type: cloudify.nodes.Compute
    instances:
      deploy: 2
    properties:
      ip: 192.168.0.11

  nginx:
    type: nodes.Nginx
    # properties should match nodes.Nginx type properties schema
    properties:
      port: 80
    interfaces:
      cloudify.interfaces.lifecycle:
        create:
          # inputs should match the inputs schema defined in nodes.Nginx for the create operation
          inputs:
            process:
              env:
                port: { get_property: [SELF, port] }
    relationships:
      - type: cloudify.relationships.contained_in
        target: vm
{%endhighlight%}



