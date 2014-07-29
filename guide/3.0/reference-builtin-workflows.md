---
layout: bt_wiki
title: Built-in Workflows Reference
category: Reference
publish: true
abstract: "description and details on the Cloudify built-in workflows"
pageord: 100
---

{%summary%} Cloudify comes with two [built-in workflows](guide-workflows.html#built-in-workflows): `install` and `uninstall`. This page will give a high level description in pseudocode of these workflows. {%endsummary%}


# Install

{% highlight python %}
for each node
  for each node instance
    1) wait for node instance relationships to be started
    2) execute 'cloudify.interfaces.lifecycle.create' operation
    3) execute 'cloudify.interfaces.relationship_lifecycle.preconfigure' relationship operations
    2) execute 'cloudify.interfaces.lifecycle.configure' operation
    3) execute 'cloudify.interfaces.relationship_lifecycle.postconfigure' relationship operations
    2) execute 'cloudify.interfaces.lifecycle.start' operation
    4) if node instance is host node:
    5)   wait for host to be started
    6)   install agent worker and plugins
    3) execute 'cloudify.interfaces.relationship_lifecycle.establish' relationship operations
{% endhighlight %}

1. Only start processing this node instance when the node instances it depends on are started.
2. Execute the task mapped to the node's lifecycle operation. (do nothing if no task is defined).
3. Execute all tasks mapped to this node's relationship lifecycle operation.
4. A node is considered a host node if its type is a subtype of `cloudify.types.host`.
5. Wait for `cloudify.interfaces.host.get_state` operation on the node instance to return `true` (if mapped, do nothing otherwise).
6. Install the agent workers and the required plugins on this host.

# Uninstall

{% highlight python %}
for each node
  for each node instance
    1) wait for dependent node instances to be deleted
    2) if node instance is host node:
    3)   stop and uninstall agent workers
    4) execute 'cloudify.interfaces.lifecycle.stop' operation
    5) execute 'cloudify.interfaces.relationship_lifecycle.unlink' relationship operations
    4) execute 'cloudify.interfaces.lifecycle.delete' operation
{% endhighlight %}

1. Only start processing this node instance when the node instances dependent on it are stopped.
2. A node is considered a host node if its type is a subtype of `cloudify.types.host`.
3. Uninstall and stop the agent.
4. Execute the task mapped to the node's lifecycle operation. (do nothing if no task is defined).
5. Execute all tasks mapped to this node's relationship lifecycle operation.