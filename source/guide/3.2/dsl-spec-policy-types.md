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

  my_host_failure_policy:

    source: policies/host_failure.clj

    properties:
        # The policy will maintain its state for each node instance individually.
        policy_operates_on_group: false

        # The trigger will be processed even if node is not in the started state
        is_node_started_before_workflow: false

        # Don't check the last workflow's trigger time before launching workflow
        interval_between_workflows: -1

        # Operate on events with an "example" being a substring of their service field
        service:
            - example

  my_threshold_policy:

    source: policies/threshold.clj

    properties:
        # Operate on events with a "cpu.total.system" being a substring of their service field value
        service: cpu.total.system

        # Activate policy triggers when an event's metric exceeds this threshold
        threshold: 90

        # Metrics whose value is bigger than the threshold will cause the triggers to be processed.
        upper_bound: true

        # How long the threshold must be breached before the triggers will be processed
        stability_time: 10

  my_ewma_policy:

    source: policies/ewma_stabilized.clj

    properties:
        # Operate on events with a "cpu.total.system" being a substring of their service field value
        service: cpu.total.system

        # Activate policy triggers when an event's metric exceeds this threshold
        threshold: 90

        # The policy will maintain its state for the whole group
        policy_operates_on_group: true

        # Process triggers only when last workflow was launched more than 600 seconds ago
        interval_between_workflows: 600

        # r is the ratio between successive events. The smaller it is,
        # the smaller impact on the computed value the most recent event has.
        ewma_timeless_r: 0.75

{%endhighlight%}

## Usage
This page describes how to define a policy type. To actually use policy types,
refer to the [Groups](dsl-spec-groups.html) specification.
