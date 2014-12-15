---
layout: bt_wiki
title: Interfaces
category: DSL Specification
publish: true
abstract: Declaring and using Interfaces
pageord: 300

terminology_link: reference-terminology.html
dsl_inputs_link: dsl-spec-inputs.html
dsl_node_templates_link: dsl-spec-node-templates.html
dsl_plugins_link: dsl-spec-plugins.html
dsl_relationships_link: dsl-spec-relationships.html
dsl_node_types_link: dsl-spec-node-types.html
script_plugin_link: plugin-script.html
---
{%summary%}{{page.abstract}}{%endsummary%}
{%summary%}
Interfaces provide a way to map logical tasks to executable [operations]({{page.terminology_link}}#operation).
{%endsummary%}

# Interfaces Declaration

[Blueprint]({{page.terminology_link}}#blueprint) authors can declare operations within `interfaces`.

## Node Types and Relationships Interface Definition

{%highlight yaml%}
node_types:
  some_type:
    interfaces:
      interface1:
        op1:
          ...
        op2:
          ...
      interface2:
        ...
relationships:
  some_relationship:
    source_interfaces:
      interface1:
        ...
    target_interfaces:
      interface2:
        ...
{%endhighlight%}

Each interface declaration under the different `interfaces`/`source_interfaces`/`target_interfaces` sections is a dictionay of operations.

## Operation Definition in Node Types and Relationships Interfaces

{%highlight yaml%}
node_types:
  some_type:
    interfaces:
      interface1:
        op1:
          implementation: ...
          inputs:
            ...
          executor: ...
{%endhighlight%}

Keyname          | Required | Type        | Description
-----------      | -------- | ----        | -----------
implementation   | yes      | string      | The script or plugin task name to execute.
inputs           | no       | dict        | Schema of inputs that will be passed to the implementation as kwargs.
executor         | no       | string      | Valid values: `central_deployment_agent`, `host_agent`. See the [Plugins Specification]({{page.dsl_plugins_link}}) for more info.

## Operation Input Schema Definition

{%highlight yaml%}
node_types:
  some_type:
    interfaces:
      interface1:
        op1:
          implementation: ...
          inputs:
            input1:
              description: ...
              type: ...
              default: ...
          executor: ...
{%endhighlight%}


Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
description | no       | string      | Description for the input.
type        | no       | string      | Input type. Not specifying a data type means the type can be anything (also types not listed in the valid types). Valid types: string, integer, boolean
default     | no       | \<any\>     | An optional default value for the input.

## Node Templates Interface Definition

{%highlight yaml%}
node_templates:
  some_node:
    interfaces:
      ...
    relationships:
      - type: ...
        target: ...
        source_interfaces:
          ...
        target_interfaces:
          ...
{%endhighlight%}

## Operation Definition in Node Templates

### Simple Mapping

{%highlight yaml%}
node_templates:
  some_node:
    interfaces:
      op1: plugin_name.path.to.module.task
{%endhighlight%}

When mapping operations to implementations in node templates, if there is no need to pass inputs or override the executor, the full mapping structure can be avoided and the implementation can be written directly.

### Full Mapping

{%highlight yaml%}
node_templates:
  some_node:
    interfaces:
      op1:
        implementation: plugin_name.path.to.module.task
        inputs:
          ...
        executor: ...
{%endhighlight%}

The full mapping structure is identical to the one in node types and relationships interfaces with the exception that the inputs are not a schema.

## Operation Inputs in Node Templates Interfaces

{%highlight yaml%}
node_types:
  some_type:
    interfaces:
      op1:
        implementation: plugin_name.path.to.module.task
        inputs:
          input1:
            description: some mandatory input
          input2:
            description: some optional input with default
            default: 1000
        executor: ...

node_templates:
  some_node:
    interfaces:
      op1:
        inputs:
          input1: mandatory_input_value
          input3: some_additional_input
{%endhighlight%}

When an operation in a node template interface is inherited from a node type or a relationship interface:

* All inputs that were declared in the operation inputs schema must be provided.
* Additional inputs, which were not specified in the operation inputs schema, may be passed as well.


# Examples

In the following examples, we will declare an interface which will allow us to:

* Configure a master deployment server using a plugin.
* Deploy code on the hosts using a plugin.
* Verify that the deployment succeeded using a shell script.
* Start the application after the deployment ended.

For the sake of simplicity, we will not refer to [relationships]({{page.dsl_relationships_link}}) in these examples.

## Configuring Interfaces in Node Types

Configuring the master server:

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

node_types:
  nodejs_app:
    derived_from: cloudify.nodes.ApplicationModule
    properties:
      ...
    interfaces:
      my_deployment_interface:
        configure:
          implementation: deployer.config_in_master.configure

node_templates:
  nodejs:
    type: nodejs_app
{%endhighlight%}

In this example, we've:

* Declared a `deployer` plugin which, [by default](#overriding-the-executor), should execute its operations on the Cloudify manager.
* Declared a [node type]({{page.dsl_node_types_link}}) with a `my_deployment_interface` interface that has a single `configure` operation which is mapped to the `deployer.config_in_master.configure` task.
* Declared a `nodejs` node template of type `nodejs_app`.


## Overriding the executor

In the above example we've declared an `executor` for our `deployer` plugin.
Cloudify enables declaring an `executor` for a single operation thus overriding the previous declaration.

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

node_types:
  nodejs_app:
    derived_from: cloudify.nodes.ApplicationModule
    properties:
      ...
    interfaces:
      my_deployment_interface:
        configure:
          implementation: deployer.config_in_master.configure
        deploy:
          implementation: deployer.deploy_framework.deploy
          executor: host_agent

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  nodejs:
    type: nodejs_app
{%endhighlight%}

Here we added a `deploy` operation to our `my_deployment_interface` interface. Note that its `executor` attribute is configured to `host_agent` which means that even though the `deployer` plugin is configured to execute operations on the `central_deployment_agent`, the `deploy` operation will be executed on hosts of the `nodejs_app` rather than the Cloudify manager.


## Declaring an operation implementation within the node

You can specify a full operation definition within the node's interface under the node template itself.

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

node_types:
  nodejs_app:
    derived_from: cloudify.nodes.ApplicationModule
    properties:
      ...
    interfaces:
      my_deployment_interface:
        ...

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  nodejs:
    type: nodejs_app
    interfaces:
      my_deployment_interface:
        ...
        start: scripts/start_app.sh
{%endhighlight%}

Let's say that we use our `my_deployment_interface` on more than the `nodejs` node. While on all other nodes, a `start` operation is not mapped to anything, we'd like to have a `start` operation for the `nodejs` node specifically, which will run our application after it is deployed.

Here, we've declared a `start` operation and mapped it to execute a script specifically on the `nodejs` node.

This comes to show that you can define your interfaces either in `node_types` or in `node_templates` depending on whether you want to reuse the declared interfaces in diffrent nodes or declare them in specific nodes.


## Operation Inputs

Operations can specify inputs that will be passed to the implementation.

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

node_types:
  nodejs_app:
    derived_from: cloudify.nodes.ApplicationModule
    properties:
      ...
    interfaces:
      my_deployment_interface:
        configure:
          ...
        deploy:
          implementation: deployer.deploy_framework.deploy
          executor: host_agent
          inputs:
            source:
              description: deployment source
              type: string
              default: git
        verify:
          implementation: scripts/deployment_verifier.py

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  nodejs_app:
    type: cloudify.nodes.WebServer
    interfaces:
      my_deployment_interface:
        ...
        start:
          implementation: scripts/start_app.sh
          inputs:
            app: my_web_app
            validate: true
{%endhighlight%}

Here, we added an input to the `deploy` operation under the `my_deployment_interface` interface in our `nodejs_app` node type and two inputs to the `start` operation in the `nodejs` node's interface.

{%note title=Note%}
Note that interface inputs are NOT the same type of objects as the inputs defined in the `inputs` section of the blueprint.
Interface inputs are passed directly to a plugin's operation (as **kwargs to our `deploy` operation in the `deployer` plugin) or, in the case of our `start` operations, to the [Script Plugin]({{page.script_plugin_link}}).
{%endnote%}

# Relationship Interfaces

For information on relationship interfaces see [Relationships Specification]({{page.dsl_relationships_link}}#relationship-interfaces).

# Built-in Interfaces

See [Built-in Interfaces](reference-builtin-interfaces.html)
