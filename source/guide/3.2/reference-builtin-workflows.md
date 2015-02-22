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
7. If the node instance is a host node (its type is a subtype of `cloudify.nodes.Compute`):
    * Install agent workers and required plugins on this host.
    * Execute `cloudify.interfaces.monitoring_agent` interface `install` and `start` operations. <sup>1</sup>
8. Execute `cloudify.interfaces.relationship_lifecycle.establish` relationship operations.<sup>2</sup>
9. Execute `cloudify.interfaces.monitoring.start` operation. <sup>1</sup>

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
2. Execute `cloudify.interfaces.monitoring.stop` operation. <sup>1</sup>
3. If node instance is host node (its type is a subtype of `cloudify.nodes.Compute`):
    * Execute `cloudify.interfaces.monitoring_agent` interface `stop` and `uninstall` operations. <sup>1</sup>
    * Stop and uninstall agent workers.
4. Execute `cloudify.interfaces.lifecycle.stop` operation.<sup>1</sup>
5. Execute `cloudify.interfaces.relationship_lifecycle.unlink` relationship operations.<sup>2</sup>
6. Execute `cloudify.interfaces.lifecycle.delete` operation.<sup>1</sup>

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
  - *allow_kwargs_override*: A boolean describing whether overriding operations inputs defined in the blueprint by using inputs of the same name in the `operation_kwargs` parameter is allowed or not (Default: `null` [means that the default behavior, as defined by the workflows infrastructure, will be used]).
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

# Heal

**Workflow name:** *heal*

**Workflow description:** Reinstalls the whole subgraph of the system topology applying the `uninstall` and `install` workflows' logic respectively. The subgraph consists of all the node instances that are contained in the compute node instance which contains the failing node instance and/or the compute node instance itself. Additionally, this workflow handles unlinking and establishing all affected relationships in an appropriate order.

**Workflow parameters:**

  - *node_id*: The ID of the failing node instance that needs healing. The whole compute node instance containing (or being) this node instance will be reinstalled.

**Workflow high-level pseudo-code:**

  1. Retrieve the compute node instance of the failed node instance.
  2. Construct a compute sub-graph (see note below).
  3. Uninstall the sub-graph:

      - Execute uninstall lifecycle operations (`stop`, `delete`) on the compute node instance and all it's contained node instances. (1)
      - Execute uninstall relationship lifecycle operations (`unlink`) for all affected relationships.

  4. Install the sub-graph:

      - Execute install lifecycle operations (`create`, `configure`, `start`) on the compute node instance and all it's contained nodes instances.
      - Execute install relationship lifecycle operations (`preconfigure`, `postconfigure`, `establish`) for all affected relationships.

<sub>
1. Effectively, all node instances that are contained inside the compute node instance of the failing node instance, are considered failed as well and will be re-installed.
</sub>

A compute sub-graph can be though of as a blueprint that defines only nodes that are contained inside a compute node.
For example, if the full blueprint looks something like this:
{%highlight yaml%}
...

node_templates:

  webserver_host:
    type: cloudify.nodes.Compute
    relationships:
      - target: floating_ip
        type: cloudify.relationships.connected_to

  webserver:
    type: cloudify.nodes.WebServer
    relationships:
      - target: webserver_host
        type: cloudify.relationships.contained_in

  war:
    type: cloudify.nodes.ApplicationModule
    relationships:
      - target: webserver
        type: cloudify.relationships.contained_in
      - target: database
        type: cloudify.relationships.connected_to

  database_host:
    type: cloudify.nodes.Compute

  database:
    type: cloudify.nodes.Database
    relationships:
      - target: database_host
        type: cloudify.relationships.contained_in

  floating_ip:
    type: cloudify.nodes.VirtualIP

...
{%endhighlight%}

Then the corresponding graph will look like so:

![Blueprint as Graph](/guide/images3/blueprint/blueprint-as-graph.png)

And a compute sub-graph for the **`webserver_host`** will look like:

![Blueprint as Graph](/guide/images3/blueprint/sub-blueprint-as-graph.png)

{%note title=Note%}

This sub-graph determines the operations that will be executed during the workflow execution. In this example:

* The following node instances will be re-installed: `war_1`, `webserver_1` and `webserver_host_1`.
* The following relationships will be re-established: `war_1` **connected to** `database_1` and `webserver_host_1` **connected to** `floating_ip_1`.
{%endnote%}

# Scale

**Workflow name:** *scale*

**Workflow description:**

Scales out/in the node subgraph of the system topology applying the `install`/`uninstall` workflows' logic respectively.

If the node denoted by `node_id` is contained in a compute node (or is a compute node itself) and `scale_compute` is `true` (which is the default),
the node graph will consist of all nodes that are contained in the compute node which contains `node_id` and the compute node itself.
Otherwise, the subgraph will consist of all nodes that are contained in the node denoted by `node_id` and the node itself.

In addition, node that are connected to node that are part of the contained subgraph will have their `establish` relationship operations executed during scale out
and their `unlink` relationship operations executed during scale in.


**Workflow parameters:**

  - *node_id*: The ID of the node to apply the scaling logic on.
  - *delta*: The scale factor. (Default: `1`)
    - For `delta > 0`: If the current number of instances is `N`, scale out to `N + delta`.
    - For `delta < 0`: If the current number of instances is `N`, scale in to `N - |delta|`.
    - For `delta == 0`, leave things as they are.
  - *scale_compute*: should `scale` apply on the compute compute node containing the node denoted by `node_id`. (Default: `true`)
    - If `scale_compute` is set to `false`, the subgraph will consist of all the nodes that
      are contained in the node denoted by `node_id` and the node denoted by `node_id` itself.
    - Otherwise, the subgraph will consist of all nodes that are contained in the compute node that contains the node denoted by `node_id`
      and the compute node itself.
    - If the node denoted by `node_id` is not contained in a compute node, it is as if this parameters was set
      to `false`.

**Workflow high-level pseudo-code:**

  1. Retrieve the scaled node, based on `node_id` and `scale_compute` parameters.
  2. Start deployment modification, adding or removing node instances and relationship instances.
  3. If `delta > 0`:
      - Execute install lifecycle operations (`create`, `configure`, `start`) on added node instances.
      - Execute the `establish` relationship lifecycle operation for all affected relationships.
  4. If `delta < 0`:
      - Execute the `unlink` relationship lifecycle operation for all affected relationships.
      - Execute uninstall lifecycle operations (`stop`, `delete`) on removed node instances.

{%note title=Note%}
Detailed description of the terms *graph* and *sub-graph* that are used in this section, can be found in the [Heal](#heal) workflow section.
{%endnote%}
