---
layout: bt_wiki
title: Groups
category: DSL Specification
publish: true
pageord: 220

---
{%summary%}
Groups provide a way of configuring shared behavior for different sets of [node templates](dsl-spec-node-templates.html).
{%endsummary%}


## Groups Declaration

The `groups` section is a hash where each item in the hash represents a group.

Within each group, the `policies` section is a hash where each item in the hash represents a [policy](dsl-spec-policy-types.html).

Within each policy, the `triggers` section is a hash where each item in the hash represents a [trigger](dsl-spec-policy-triggers.html).

{%highlight yaml%}
groups:
  group1:
    members: ...
    policies:
      policy1:
        type: ...
        properties:
          ...
        triggers:
          trigger1:
            type: ...
            parameters: ...
          trigger2:
            ...
      policy2:
        ...
  group2:
    ...
{%endhighlight%}


### Group Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
members     | yes      | list        | A list of group members. Members are node template names.
policies    | yes      | hash        | A hash of policies.

### Policy Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
type        | yes      | string      | Policy type.
properties  | no       | hash        | Optional properties for configuring the policy.
triggers    | yes      | hash        | A hash of triggers.

### Trigger Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
type        | yes      | string      | Trigger type.
parameters  | no       | hash        | Optional parameters that will be passed to the trigger.

<br>

Inside the trigger's `parameters` section, `{ get_property: [SELF, property_name] }` can be used to access properties of the event that caused the trigger to be processed. For example, a policy may add contextual data to an event, such as a node instance id or the CPU average in the last five minutes, before processing its triggers. An `execute_workflow` trigger, for example, may pass these properties to the workflow it executes.

## Example

See [Using Policies](guide-policies.html#using-policies)
