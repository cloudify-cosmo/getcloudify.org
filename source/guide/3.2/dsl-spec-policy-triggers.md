---
layout: bt_wiki
title: Policy Triggers
category: Blueprints DSL
publish: true
pageord: 291

types_yaml_link: https://github.com/cloudify-cosmo/cloudify-manager/blob/3.1/resources/rest-service/cloudify/types/types.yaml
execute_workflow_trigger_link: https://github.com/cloudify-cosmo/cloudify-manager/blob/3.1/resources/rest-service/cloudify/triggers/execute_workflow.clj
---
{%summary%}
Policy Triggers provide a way of declaring actions the can be invoked by [policies](dsl-spec-policy-types.html).
{%endsummary%}

Policy Trigger specify the implementation of actions invoked by policies and declare the properties that define the trigger's behavior.

## Policy Triggers Declaration

The `policy_triggers` section is a hash where each item in the hash represents an policy trigger.

{%highlight yaml%}
policy_triggers:
  # my_definitions.policy_triggers.my_trigger1 is the policy trigger name
  my_definitions.policy_triggers.my_trigger1:
    ...
  my_trigger2:
    ...
{%endhighlight%}


### Policy Trigger Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
source      | yes      | string      | The policy trigger implementation source (URL or a path relative to the blueprint root directory).
parameters  | no       | dict        | Optional parameters schema for the policy trigger.


<br>


Example:

{%highlight yaml%}
policy_triggers:

  my_webhook_trigger:

    source: policy_trigger/webhook_trigger.clj

    properties:
      webhook_endpoint:
        description: >
          URL for making a POST HTTP request to
      webhook_body:
        description: >
          request body (serialized to JSON)
        default: {}

{%endhighlight%}


## Built-in Policy Triggers

The following policy triggers are defined in [`types.yaml`]({{page.types_yaml_link}}).

### cloudify.policies.triggers.execute_workflow

#### Parameters

* `workflow` Workflow name to execute.
* `workflow_parameters` Workflow parameters. (Optional, Default `{}`)
* `force` Should the workflow be executed even when another execution for the same workflow is currently in progress. (Optional, Default: `false`)
* `allow_custom_parameters` Should parameters not defined in the workflow parameters schema be accepted. (Optional, Default: `false`)
* `socket_timeout` Socket timeout when making request to manager REST in ms. (Optional, Default: `1000`)
* `conn_timeout` Connection timeout when making request to manager REST in ms. (Optional, Default: `1000`)

You can find the implementation for this trigger on [github]({{page.execute_workflow_trigger_link}}). It builds the HTTP request to the manager REST service and makes the actual REST call using the `clj-http` clojure library.

## Usage
This page describes how to define a policy trigger. To actually use policy triggers with policies,
refer to the [Groups](dsl-spec-groups.html) specification.
