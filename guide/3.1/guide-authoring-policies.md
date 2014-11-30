---
layout: bt_wiki
title: Policies Authoring Guide
category: Guides
publish: true
abstract: "A guide to authoring Cloudify policy types"
pageord: 600
---

{%summary%}This guide explains how to write your own policy types{%endsummary%}


{%note title=Note%}
This section is aimed at advanced users. At the very least make sure you understand the [policies mechanism](guide-policies.html) in general.
{%endnote%}


# Policy Types Blueprint Definition
Policy types are specified in the blueprint along with a reference to their implementation and properties that configure instances of them.

An example (followed by an explanation):
{% highlight yaml %}
policy_types:
  my_policy_type:
    source: my_policy/my_policy_type.clj
    properties:
      prop1:
        description: >
          prop1 is probably the most important property
          of my_policy_type
      prop2:
        description: >
          prop2 is a little less important, so we have a default
          for it
        default: 15.0
{% endhighlight %}

Policy types are defined under the `policy_types` section of the blueprint.

* The `source` attribute of a policy type can be either a relative path to a policy implementation within the blueprint directory or a URL to a policy hosted somewhere.
* The `properties` attribute of a policy type defines the policy's properties schema. These properties are configured when instantiating policies within the `groups` section. In the following section we will describe how these properties can be used by a policy implementation.

# Policy Type Implementation
The implementation of policy types is written in [Clojure](http://clojure.org/) and more specifically using [Riemann](http://riemann.io/) API's with a thin layer provided by Cloudify.

An example: `my_policy/my_policy_type.clj`
{% highlight clj %}
{% raw %}
(where (metric {{prop2}})
  (with :state "{{prop1}}")
    process-policy-triggers)
{% endraw %}
{% endhighlight %}

First notice how `prop2` and `prop1` are being referenced in double curly braces. The implementation is actually a [`Jinja2`](http://jinja.pocoo.org/docs/dev/) template that is used to generate the actual implementation when the policy engine is started.

For each event who's metric value is equal to the value of `prop2`, the event's `state` field is set to the value of `prop1` and this event is delegated to the `process-policy-triggers` stream. In terms of Riemann, though, this is a very simple stream definition.

The `process-policy-triggers` stream executes, in a deployment dedicated thread pool, all the triggers that were specified for the policy that was instantiated. Executing the triggers in a different thread pool is important, as the policies themselves should be non-blocking. If policies perform blocking operations, the entire deployment event stream will be blocked by each policy that performs them.
