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

[Blueprint]({{page.terminology_link}}#blueprint) authors can declare operations within `interfaces`:

{%highlight yaml%}
node_types:
  some_type:
      interfaces:
          interface1:
            ...
          interface2:
            ...
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

relationships:
   some_relationship:
       source_interfaces:
         ...
       target_interfaces:
        ...
{%endhighlight%}

## Operation Definition within an Interface

Keyname          | Required | Type        | Description
-----------      | -------- | ----        | -----------
implementation   | yes      | string      | The script or plugin task name to execute.
inputs           | no       | dict        | A dict of to be fed as **kwargs to the operation.
executor         | no       | string      | Valid values: `central_deployment_agent`, `host_agent`. See the [plugins spec]({{page.dsl_plugins_link}}) for more info.

<br>

Example:

Here we will declare an interface which will allow us to:

* Configure a master deployment server using a plugin.
* Deploy code on the hosts using a plugin.
* Verify that the deployment succeeded using a shell script.
* Start the application after the deployment ended.

For the sake of simplicity, we will not refer to [relationships]({{page.dsl_relationships_link}}) in this example.

# Configuring Interfaces in `node_types`

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
* Declared a [node type]({{page.dsl_node_types_link}}) with a `my_deployment_interface` interface with a `configure` operation which should execute the `deployer.config_in_master.configure` task.
* Declared a `nodejs` node of type `nodejs_app`.


# Overriding the executor

In the above example we've declared an `executor` for our `deployer` plugin.
Cloudify enables declaring an `executor` for a single operation thus overriding the previous declaration.

Example:

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


# Mapping an operation directly

Cloudify provides an easy way to map operations to script executions (using the [Script Plugin]({{page.script_plugin_link}}) or module tasks directly.

This is done by providing a path directly to the operation rather than providing the `implementation` attribute thus working around the default method of declaring operation mappings.

Example:

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
        configure: deployer.config_in_master.configure
        deploy:
          ...
        verify: scripts/deployment_verifier.py

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  nodejs:
    type: nodejs_app
{%endhighlight%}

Here we've directly added a `verify` operation to our interface which maps directly to a script. We also mapped the `configure` operations directly to an operation in our `deployer` module.


# Declaring an operation implementation within the node

You can specify the entire set of attributes for a specific operation within the node's interface under the node template itself.

Example:

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

Let's say that we use our `my_deployment_interface` on more than the `nodejs` node. While on all other nodes the start operation is not mapped to anything, we'd like to have a `start` operation for the `nodejs` node specifically which will run our application after it is deployed.

Here, we've declared the `start` operation and mapped it to execute a script specifically on the `nodejs` node.

This comes to show that you can define your interfaces either in `node_types` or in `node_templates` depending on whether you want to reuse the declared interfaces in diffrent nodes or declare them in specific nodes.


# Adding inputs to an interface's operation

You can add [inputs]({{page.dsl_inputs_link}}) to an interface's operation.

Example:

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
              type: string
              default: git
        verify: scripts/deployment_verifier.py

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
            app:
              type: string
              default: my_web_app
            validate:
              type: bolean
              default: true
{%endhighlight%}

Here we added an input to the `deploy` operation under the `my_deployment_interface` interface in our `nodejs_app` node type and two inputs to the `start` operation in the `nodejs` node's interface.

{%note title=Note%}
While `properties` defined in a `node_type` are a part of a schema and restrict from adding additional properties in a `node_template` based on that `node_type`, in interface inputs, the situation is different. You can add inputs both in the `node_type`'s interface AND in the `node_template`'s interface independently.
{%endnote%}

{%note title=Note%}
Note that interface inputs are NOT the same type of objects as the inputs defined in the `inputs` section of the blueprint.
Interface inputs are passed directly to a plugin's operation (as **kwargs to our `deploy` operation in the `deployer` plugin) or, in the case of the `start` operations, to the [Script Plugin]({{page.script_plugin_link}}).
{%endnote%}

# Relationship Interfaces

For information on relationship interfaces see the [relationships spec]({{page.dsl_relationships_link}}#relationship-interfaces).