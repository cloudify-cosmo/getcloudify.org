---
layout: bt_wiki
title: Built-in Policies Reference
category: Reference
publish: true
abstract: "description and details on the Cloudify built-in policies"
pageord: 900
---

{%summary%} Cloudify comes with a few [built-in policies](guide-policies.html#built-in-policies). This page will give a high level description of these policies. {%endsummary%}


# Host Failure

**Policy name:** `cloudify.policies.types.host_failure`

**Policy description:**

This policy is based on intercepting expired events.

The first monitoring event sent by a certain node instance will add this event type (determined by the event's service and host properties) to the policy engine index (Riemann's index mechanism). Later, if this type of event does not get sent for a period of 60 seconds for this particular node instance, it gets expired.

When an event expires and has been sent by a service contained in the `service` property of the policy specified in the blueprint, the host failure policy passes this event to the restraints check and eventually processes the policy's triggers. It adds the `diagnose` field with value "heart-beat-failure" and the `failing_node` field with an id of the failing node instance to the event. Additionally, the event's state gets changed to "triggering_state".

This policy's implementation can be found at [github](https://github.com/cloudify-cosmo/cloudify-manager/blob/master/resources/rest-service/cloudify/policies/host_failure.clj).

It is based on Riemann's [expired?](http://riemann.io/api/riemann.streams.html#var-expired.3F) function.

# Threshold

**Policy name:** `cloudify.policies.types.threshold`

**Policy description:**

When for `stability_time` seconds all non-expired events have metric values that breach the `threshold`, the policy passes the last event to the restraints check and eventually processes the policy's triggers.

The event's state gets changed to "triggering_state".

This policy's implementation can be found at [github](https://github.com/cloudify-cosmo/cloudify-manager/blob/master/resources/rest-service/cloudify/policies/threshold.clj).

It is based on Riemann's [stable](http://riemann.io/api/riemann.streams.html#var-stable) function.

# Ewma

**Policy name:** `cloudify.policies.types.ewma_stabilized`

**Policy description:**

This policy calculates weighted average of events metrics over time.

When the average breaches the `threshold`, the policy passes the last event to the restraints check and eventually processes the policy's triggers.

The event's state gets changed to "triggering_state".

This policy's implementation can be found at [github](https://github.com/cloudify-cosmo/cloudify-manager/blob/master/resources/rest-service/cloudify/policies/ewma_stabilized.clj).

It is based on Riemann's [ewma-timeless](http://riemann.io/api/riemann.streams.html#var-ewma-timeless) function.
