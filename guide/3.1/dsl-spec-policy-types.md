---
layout: bt_wiki
title: Policy Types
category: DSL Specification
publish: true
pageord: 290

---
{%summary%}
Policies provide a way of analyzing a stream of events that correspond to a group of nodes (and their instances)
{%endsummary%}

Policy Types specify the implementation of event stream analyzers and declare the properties that define their behavior.

See [Policies Authoring Guide](guide-authoring-policies.html) for further details on creating custom policies.

## Policy Types Declaration

The `policy_types` section is a hash where each item in the hash represents an policy type.

{%highlight yaml%}
policy_types:
  # my_definitions.policies.my_policy1 is the policy type name
  my_definitions.policies.my_policy1:
    ...
  my_policy2:
    ...
{%endhighlight%}


### Policy Type Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
source      | yes      | string      | The policy type implementation source (URL or a path relative to the blueprint root directory).
properties  | no       | dict        | Optional properties schema for the policy type.


<br>


Example:

{%highlight yaml%}
policy_types:

  my_threshold_policy:

    source: policies/threshold.clj

    properties:
      service_regex:
        description: >
          Operate on events who's
          service matches this regual expression
        default: .*?
      metric_threshold:
        description: >
          Activate policy triggers when an event's
          metric exeeds this threshold


{%endhighlight%}

## Usage
This page describes how to define a policy type. To actually use policy types,
refer to the [Groups](dsl-spec-groups.html) specification.
