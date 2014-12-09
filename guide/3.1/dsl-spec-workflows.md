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
* Simple mapping - maps a workflow name to a workflow implementation which requires no parameters.
The key represents the workflow name.
The value represents the full path to the method that implements this workflow

{%highlight yaml%}
workflows:
  workflow1: ...
  workflow2: ...
{%endhighlight%}

* Mapping with parameters - maps a workflow name to a workflow implementation that uses parameters. Workflow parameters are structured as a schema map, where each entry specifies the parameter schema.

{%highlight yaml%}
workflows:
  workflow_1:
    mapping: my_workflow_plugin_name.my_workflow_module_name.my_workflow_method_name
    parameters:
      mandatory_parameter:
        description: this parameter is mandatory
      optional_parameter:
        description: this parameters is optional, if not set, will take the default
        default: optional_parameter_default_value

{%endhighlight%}

### Workflow Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
mapping     | yes      | string      | A mapping to the method implementing this workflow. In the “Simple mapping” format this value is set without explicitly using the “mapping” key
parameters  | no       | map         | parameters to be passed to the workflow implementation

{%note title=Note%}
It is currently not allowed to set the “mapping” key without setting “parameters” as well. If your workflow method doesn’t accept parameters use the “simple mapping” format described above.
{%endnote%}

### Parameter Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
description | no       | string      | An optional description for the input.
default     | no       | \<any\>     | An optional default value for the input.


<br>
Example:
In the following example, a workflow plugin named “maintenance_workflows_plugin” is defined. A workflow named “test_connection_workflow” is then declared, pointing to an implementation in module “maintenance_workflows”, method “validate_connection”. 
The first parameter is “protocol”. This parameter is mandatory.
The second parameter is “port”. This parameter is optional, if not passed upon workflow execution, the default value 8080 will be used.
The third parameter is “connection_properties”. It’s default value is a map consisting of 2 entries - “timeout_seconds” set to 60, and “retry_attempts” set to 3.

{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_0

imports:
  - http://www.getcloudify.org/spec/cloudify/3.1/types.yaml


plugins:
  maintenance_workflows_plugin:
    executor: central_deployment_agent
    source: http://example.com/url/to/plugin.zip

workflows:
  test_connection_workflow:
    mapping: maintenance_workflows_plugin.maintenance_workflows.validate_connection
    parameters:
      protocol:
        description: the protocol to use for connection
      port:
        description: the port to use for connection
        default: 8080
      connection_properties:
        description: connection properties - timeout (in seconds) and retry attempts
        default:
          timeout_seconds: 60
          retry_attempts: 3
{%endhighlight%}
