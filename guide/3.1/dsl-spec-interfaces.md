---
layout: bt_wiki
title: Interfaces
category: DSL Specification
publish: true
abstract: Declaring and using Interfaces
pageord: 300

types_yaml_link: http://www.getcloudify.org/spec/cloudify/3.1/types.yaml
terminology_link: reference-terminology.html
dsl_node_types_link: dsl-spec-node-types.html
dsl_groups_link: dsl-spec-groups.html
dsl_inputs_link: dsl-spec-inputs.html
dsl_outputs_link: dsl-spec-outputs.html
dsl_node_templates_link: dsl-spec-node-templates.html
dsl_plugins_link: dsl-spec-plugins.html
---
{%summary%}{{page.abstract}}{%endsummary%}
{%summary%}
Interfaces provide a way to map logical tasks to executable [operations]({{page.terminology_link}}#operation).
{%endsummary%}

Blueprint authors can declare interfaces in the `interfaces` section of the blueprint.

# Interfaces Declaration

The `interfaces` section is a list where each item in the list represents a YAML file to import.

{%highlight yaml%}
interfaces:
  interface1:
    operation1:
      ...
    operation2:
      ...
  interface2:
    operation1:
      ...
    operation2:
      ...
{%endhighlight%}

## Interface Definition

Keyname          | Required | Type        | Description
-----------      | -------- | ----        | -----------
implementation   | yes      | string      | The script or plugin task name to execute.
inputs           | no       | dict        | A dict of [inputs]({{page.dsl_inputs_link}}).
executor         | no       | string      | Valid values: `central_deployment_agent`, `host_agent`. See the [plugins spec]({{page.dsl_plugins_link}}) for more info.

<br>

Example:

Here we will declare an interface which will allow us to:

* Configure a master deployment server using a plugin.
* Deploy code on the hosts using a plugin.
* Verify that the deployment succeeded using a shell script.
* Start the application after the deployment ended.

Configuring the master server:

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

interfaces:
  my_deployment_interface:
    configure:
      implementation: deployer.config_in_master.configure

node_templates:
  nodejs_app:
    type: cloudify.nodes.WebServer
    interfaces:
      my_deployment_interface:
        configure: my_deployment_interface.configure
{%endhighlight%}

In this example, we've:
- Declared a plugin called `deployer` which, [by default](#overriding-the-executor), should execute its operations on the Cloudify manager.
- Declared an interface `my_deployment_interface` with a `configure` operation which should execute the `deployer.config_in_master.configure` task. We also provided it with some inputs.
- Declared a `nodejs_app` node which uses our declared interface and executes the `configure` operation.


# Overriding the executor

In the above example we've declared an `executor` for our `deployer` plugin.
Cloudify enables declaring an `executor` for a single operation thus overriding the previous declaration.

Example:

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

interfaces:
  my_deployment_interface:
    configure:
      ...
    deploy:
      implementation: deployer.deploy_framework.deploy
      inputs:
        source:
          type: string
          default: git
      executor: host_agent

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  nodejs_app:
    type: cloudify.nodes.WebServer
    interfaces:
      my_deployment_interface:
        configure: my_deployment_interface.configure
        deploy: my_deployment_interface.deploy
{%endhighlight%}

Here we added a `deploy` operation to our interface. Note that its `executor` attribute is configured to `host_agent` which means that even though the `deployer` plugin is configured to execute operations on the `central_deployment_agent`, the `deploy` operation will be executed on hosts of the `nodejs_app` rather than the Cloudify manager.


# Mapping an operation to a script

Cloudify provides an easy way to map operations to script executions using the [Script Plugin]({{page.script_plugin_link}}).

This is done by providing a script path directly to the operation rather than providing the `implementation` attribute thus working around the default method of declaring operation mappings.

Example:

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

interfaces:
  my_deployment_interface:
    configure:
      ...
    deploy:
      ...
    verify: scripts/deployment_verifier.py

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  nodejs_app:
    type: cloudify.nodes.WebServer
    interfaces:
      my_deployment_interface:
        configure: my_deployment_interface.configure
        deploy: my_deployment_interface.deploy
        verify: my_deployment_interface.verify
{%endhighlight%}

Here we've added a `verify` operation to our interface which maps directly to a script afterwhich we've configured the `nodejs_app` node to use that operation.


# Declaring an operation implementation within the node

You can specify the entire set of attributes for a specific operation within the node's interface under the note template itself.

Example:

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

interfaces:
  my_deployment_interface:
    configure:
      ...
    deploy:
      ...
    verify: scripts/deployment_verifier.py

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  nodejs_app:
    type: cloudify.nodes.WebServer
    interfaces:
      my_deployment_interface:
        ...
        start: scripts/start_app.sh
{%endhighlight%}

Let's say that we use our `my_deployment_interface` on more than the `nodejs_app` node. And while on all other nodes the last operation to be executed is the `verify` operation, we'd like to have a `start` operation for the `nodejs_app` node specifically which will run our application after it is deployed.

Here, we've declared the `start` operation and mapped it to execute a script specifically on the `nodejs_app` node.


# Adding inputs to an interface's operation

You can add [inputs]({{page.dsl_inputs_link}}) to an interface's operation.

Example:

{%highlight yaml%}
plugins:
  deployer:
    executor: central_deployment_agent

interfaces:
  my_deployment_interface:
    configure:
      ...
    deploy:
      ...
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

# Relationship Interfaces

## Source Interfaces

## Target interfaces