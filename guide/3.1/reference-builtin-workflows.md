---
layout: bt_wiki
title: Built-in Workflows Reference
category: Reference
publish: true
abstract: "description and details on the Cloudify built-in workflows"
pageord: 900
---

{%summary%} Cloudify comes with two [built-in workflows](guide-workflows.html#built-in-workflows): `install` and `uninstall`. This page will give a high level description of these workflows. {%endsummary%}


# Install

For each node, for each node instance (in parallel):

1. Wait for node instance relationships to be started. (Only start processing this node instance when the node instances it depends on are started).
2. Execute `cloudify.interfaces.lifecycle.create` operation. <sup>1</sup>
3. Execute `cloudify.interfaces.relationship_lifecycle.preconfigure` relationship operations.<sup>2</sup>
4. Execute `cloudify.interfaces.lifecycle.configure` operation.<sup>1</sup>
5. Execute `cloudify.interfaces.relationship_lifecycle.postconfigure` relationship operations.<sup>2</sup>
6. Execute `cloudify.interfaces.lifecycle.start` operation.<sup>1</sup>
7. If the node instance is a host node (its type is a subtype of `cloudify.types.host`):
    * Wait for host to be started. (Wait for `cloudify.interfaces.host.get_state` operation on the node instance to return `true`, if mapped, do nothing otherwise).
    * Install agent workers and required plugins on this host.
8. Execute `cloudify.interfaces.relationship_lifecycle.establish` relationship operations.<sup>2</sup>

<sub>
1. Execute the task mapped to the node's lifecycle operation. (do nothing if no task is defined).<br>
2. Execute all tasks mapped to this node's relationship lifecycle operation.
</sub>

# Uninstall

For each node, for each node instance (in parallel):

1. Wait for dependent node instances to be deleted. Only start processing this node instance when the node instances dependent on it are stopped).
2. If node instance is host node (its type is a subtype of `cloudify.types.host`):
    * Stop and uninstall agent workers.
3. Execute `cloudify.interfaces.lifecycle.stop` operation.<sup>1</sup>
4. Execute `cloudify.interfaces.relationship_lifecycle.unlink` relationship operations.<sup>2</sup>
5. Execute `cloudify.interfaces.lifecycle.delete` operation.<sup>1</sup>

<sub>
1. Execute the task mapped to the node's lifecycle operation. (do nothing if no task is defined).<br>
2. Execute all tasks mapped to this node's relationship lifecycle operation.
</sub>
