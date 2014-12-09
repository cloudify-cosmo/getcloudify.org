---
layout: bt_wiki
title: Workflows
category: DSL Specification
publish: true
abstract: "Workflow definitions"
pageord: 300

---
{%summary%}
Workflows define a set of tasks that can be executed on a node or a group of nodes, and the execution order this tasks, serially or in parallel. A task may be an operation (implemented by a plugin), but it may also be other actions, including arbitrary code.
{%endsummary%}

Workflows can be defined in a “workflows” section in the blueprint. This allows the user to execute different tasks on blueprint nodes, which can be very simple, e.g. performing a single operation on specific nodes, or more complex, such as coordinate the provisioning of different resources while handling their dependencies. For further reading please refer to the [Workflow Guide] (#http://getcloudify.org/guide/3.1/guide-workflows.html)

## Workflows Declaration
The workflows section is a hash where each item represents a workflow. Mapping a workflow name workflow implementation in the blueprint is done in one of two ways:

* Simple mapping - maps a workflow name to a it's implementating method, which doesn't accept parameters.

{%highlight yaml%}
workflows:
  workflow_1: my_workflow_plugin_name.my_workflow_module_name.my_first_workflow_method
  workflow_2: my_workflow_plugin_name.my_workflow_module_name.my_seconde_workflow_method
{%endhighlight%}

* Mapping with parameters - maps a workflow name to a workflow implementation that uses parameters. Workflow parameters are structured as a schema map, where each entry specifies the parameter schema.

{%highlight yaml%}
workflows:
  workflow_1:
    mapping: my_workflow_plugin_name.my_workflow_module_name.my_workflow_method
    parameters:
      my_mandatory_parameter:
        description: this parameter is mandatory, it has no default value
      my_optional_parameter:
        description: this parameters is optional, if not set it will take the default value
        default: optional_parameter_default_value

{%endhighlight%}

{%note title=Note%}
It is currently not allowed to set the “mapping” key without setting “parameters” as well. If your workflow method doesn’t accept parameters - use the “simple mapping” format (described above).
{%endnote%}


### Workflow Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
mapping     | yes      | string      | A path to the method implementing this workflow (In the “Simple mapping” format this value is set without explicitly using the “mapping” key)
parameters  | no       | dict        | A map of parameters to be passed to the workflow implementation


### Parameter Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
description | no       | string      | An optional description for the input.
type        | no       | string      | Represents the required data type of the input. Not specifying a data type means the type can be anything. Valid types: string, integer, boolean
default     | no       | \<any\>     | An optional default value for the input.


<br>
Example:

In the following example, a workflow plugin named “maintenance_workflows_plugin” is defined, and two workflows refer to it.

The first workflow is named "general_test_connection_workflow", it does not accept parameters and so it just maps the relevant implementation in module “maintenance_workflows”, method “validate_all_connections”.

The second workflow is named “test_connection_workflow”, it is mapped to the method "validate_connection" in module “maintenance_workflows”, and accpets three parameters - “protocol” (a mandatory parameter), “port” (an optional parameter, defaulting to "8080") and “connection_properties”. The last parameter has a default value of a map, consisting of 2 entries - “timeout_seconds” and “retry_attempts”.

{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_0

imports:
  - http://www.getcloudify.org/spec/cloudify/3.1/types.yaml


plugins:
  maintenance_workflows_plugin:
    executor: central_deployment_agent
    source: http://example.com/url/to/plugin.zip

workflows:
  general_test_connection_workflow: maintenance_workflows_plugin.maintenance_workflows.validate_all_connections
  test_connection_workflow:
    mapping: maintenance_workflows_plugin.maintenance_workflows.validate_connection
    parameters:
      protocol:
        description: the protocol to use for connection
        type: string
      port:
        description: the port to use for connection
        default: 8080
      connection_properties:
        description: connection properties - timeout (in seconds) and retry attempts
        default:
          timeout_seconds: 60
          retry_attempts: 3
{%endhighlight%}
