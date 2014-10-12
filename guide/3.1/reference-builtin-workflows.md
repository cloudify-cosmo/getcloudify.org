---
layout: bt_wiki
title: Built-in Workflows Reference
category: Reference
publish: true
abstract: "description and details on the Cloudify built-in workflows"
pageord: 900
---

{%summary%} Cloudify comes with a few [built-in workflows](guide-workflows.html#built-in-workflows). This page will give a high level description of these workflows. {%endsummary%}


# Install

**Workflow name:** *install*

**Workflow description:** The workflow for installing applications.

**Workflow high-level pseudo-code:**

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

**Workflow name:** *uninstall*

**Workflow description:** The workflow for uninstalling applications.

**Workflow high-level pseudo-code:**

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

# Execute Operation

**Workflow name**: *execute_operation*

**Workflow description:** A generic workflow for executing arbitrary operations on nodes.

**Workflow parameters:**

  - *operation*: The name of the operation to execute (**Mandatory**).
  - *operation_kwargs*: A dictionary of keyword arguments that will be passed to the operation invocation (Default: `{}`).
  - *run_by_dependency_order*: A boolean describing whether the operation should execute on the relevant nodes according to the order of their relationships dependencies or rather execute on all relevant nodes in parallel (Default: `false`).
  - *type_names*: A list of type names. The opreation will be executed only on node instances which are of these types or of types which (recursively) derive from them. An empty list means no filtering will take place and all type names are valid (Default: `[]`).
  - *node_ids*: A list of node ids. The operation will be executed only on node instances which are instances of these nodes. An empty list means no filtering will take place and all nodes are valid (Default: `[]`).
  - *node_instance_ids*: A list of node instance ids. The operation will be executed only on the node instances specified. An empty list means no filtering will take place and all node instances are valid (Default: `[]`).

{%note title=Note%}
The various filtering fields - *type_names*, *node_ids*, *node_instance_ids* - will all be enforced together, meaning that the operation will only be executed on node instances which comply with all of these filters.
{%endnote%}

{%warning title=Warning%}
Executing an operation on a node which has that interface operation but has not mapped it to any concrete implementation will simply do nothing. However, attempting to execute an operation on a node which doesn't have the relevant interface operation will result in a workflow execution error.
Use the filtering fields to ensure the operation is only executed on nodes which the operation might be relevant to.
{%endwarning%}

**Workflow high-level psuedo-code:**

For each node, for each node instance:

  1. Filter out instances whose node is not in the *node_ids* list (unless its empty).
  2. Filter out instances whose id is not in the *node_instance_ids* list (unless its empty).
  3. Filter out instances whose node type is not in or a descendant of a type which is in the type_names list (unless its empty).

If *run_by_dependency_order* is set to `true`:
	create a task dependency between the following section's (1) task for a given instance and the (3) task for all instances it depends on.<sup>1</sup>

For each of the remaining node instances:

  1. Send a node instance event about starting the execution the operation.
  2. Execute the *operation* operation for the instance, with the *operation_kwargs* passed to the operation invocation.
  3. Send a node instance event about completing the execution of the operation.

<sub>
1. Note that the dependency may be indirect, e.g. in a case where instance A is dependent on instance B, which is in turn dependent on instance C, and only B was filtered out, instance A's operation execution will still only happen after instance C's operation execution.
</sub>
