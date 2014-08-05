---
layout: bt_wiki
title: Workflows Authoring Guide
category: Guides
publish: true
abstract: "A guide to authoring Cloudify Workflows"
pageord: 600
---

{%summary%}This guide explains how to create your own custom workflows{%endsummary%}


{%note title=Note%}
This section is aimed at advanced users. Before reading it, make sure you have a good understanding of [Cloudify terminology](reference-terminology.html), [Workflows](guide-workflows.html), [Blueprints](guide-blueprint.html), and [Plugin authoring](guide-plugin-creation.html).
{%endnote%}


# Introduction to Implementing Workflows

Workflows implementation shares several similarities with plugins implementation:

* Workflows are also implemented as Python functions.
* A workflow method is decorated with `@workflow`, a decorator from the `cloudify.decorators` module of the `cloudify-plugins-common` package.
* A workflow method receives a `ctx` parameter, which offers access to context data and various system services. While sharing some resemblence, this `ctx` object is not of the same type as the one received by a plugin method.

*Example: A typical workflow method's signature*
{% highlight python %}
from cloudify.decorators import workflow

@workflow
def my_workflow(ctx, **kwargs):
    pass
{%endhighlight%}


Workflow parameters are received by the method as named parameters, and so if a workflow uses parameters they should usually appear in the method signature as well (or they'll end up under `kwargs`).

{%tip title=Tip%}
It's recommended not to have default values for parameters in the workflow method's signature. Instead, the default values should be provided in the workflow's parameters declaration in the blueprint - That way, the parameter and its default value are visible to the user both in the blueprint and via CLI commands, and the user is also able to override the default value by simply editing the blueprint, without modifying code. For more information on workflow parameters declaration, refer to the [Blueprint mapping section](#blueprint-mapping).
{%endtip%}


There are two approaches to implementing workflows:

* ***Standard workflows*** - workflows which simply use the [APIs](#apis) to execute and manage tasks.
* ***Graph-based workflows*** - workflows which use the APIs on top of the [Graph framework](#graph-framework), a framework which offers a simplified process of scheduling and creating dependencies among tasks, as well as built-in support for some of the common aspects of workflows (e.g. [cancellation support](#cancellation-support)).


# Tasks

Work in progress

## Task Handlers

Work in progress


# APIs

{%note title=Note%}
This section is documented rather lightly since it is expected be replaced with auto-generated documentation soon. In the meanwhile, more documentation is available within the code in the `cloudify.workflows.workflow_context` module.
{%endnote%}

The context object received by every workflow method is of type `CloudifyWorkflowContext`. It offers access to context data and various services. Additionally, any node, node instance, relationship or relationship instance objects returned by the context object (or from objects returned by the context object) will be wrapped in types which offer additional context data and services.

More specific information of the API offered by each type is available below:

{% togglecloak id=11 %} CloudifyWorkflowContext {% endtogglecloak %}
{% gcloak 11 %}
The context object received by every workflow method is of this type.

{% inittab %}
{% tabcontent Properties %}
* **nodes**: iterator over the nodes
* **deployment_id**: the deployment ID
* **blueprint_id**: the blueprint ID
* **execution_id**: the execution ID
* **workflow_id**: the workflow ID
* **logger**: A logger for the workflow
{% endtabcontent %}
{% tabcontent Methods %}
* **graph_mode**: switches the workflow context into graph mode
* **send_event**: sends a workflow event
* **execute_task**: executes a task
* **local_task**: creates a LocalTask
* **remote_task**: creates a RemoteTask
{% endtabcontent %}
{% endinittab %}

{% endgcloak %}

{% togglecloak id=12 %} CloudifyWorkflowNode {% endtogglecloak %}
{% gcloak 12 %}
A node object wrapper.

{% inittab %}
{% tabcontent Properties %}
* **id**: the node ID
* **type**: the node type
* **type_hirarchy**: the node type hierarchy
* **properties**: the node properties
* **plugins_to_install**: the plugins to install in this node (Only relevant for host nodes)
* **relationships**: the node relationships
* **operations**: the node operations
* **instances**: the node instances
{% endtabcontent %}
{% tabcontent Methods %}
* **get_relationship**: get a relationship by its target ID
{% endtabcontent %}
{% endinittab %}

{% endgcloak %}


{% togglecloak id=13 %} CloudifyWorkflowNodeInstance {% endtogglecloak %}
{% gcloak 13 %}
A node instance object wrapper.

{% inittab %}
{% tabcontent Properties %}
* **id**: the node instance ID
* **node_id**: the node id
* **relationships**: the node instance relationship instances
* **node**: the instance's node object
* **logger**: a logger for this workflow node
{% endtabcontent %}
{% tabcontent Methods %}
* **set_state**: set the node state (and optionally its runtime properties as well)
* **get_state**: get the node state
* **send_event**: Send a workflow node event
* **execute_operation**: Execute a node operation
{% endtabcontent %}
{% endinittab %}

{% endgcloak %}


{% togglecloak id=14 %} CloudifyWorkflowRelationship {% endtogglecloak %}
{% gcloak 14 %}
A relationship object wrapper.

{% inittab %}
{% tabcontent Properties %}
* **target_id**: the relationship target node ID
* **target_node**: the relationship target node
* **source_operations**: the relationship source operations
* **target_operations**: the relationship target operations
{% endtabcontent %}
{% tabcontent Methods %}
None available
{% endtabcontent %}
{% endinittab %}

{% endgcloak %}


{% togglecloak id=15 %} CloudifyWorkflowRelationshipInstance {% endtogglecloak %}
{% gcloak 15 %}
A relationship instance object wrapper.

{% inittab %}
{% tabcontent Properties %}
* **target_id**: the relationship target node ID
* **target_node_instance**: the relationship target node instance
* **relationship**: the instance's relationship
{% endtabcontent %}
{% tabcontent Methods %}
* **execute_source_operation**: execute a node relationship source operation
* **execute_target_operation**: execute a node relationship target operation
{% endtabcontent %}
{% endinittab %}

{% endgcloak %}


# Graph Framework

Work in progress


# Blueprint Mapping

As is the case with plugins, it's the workflow author's responsilibity to write a yaml file (named `plugin.yaml` by convention) which will contain both the workflow mapping as well as the workflow's plugin declaration.

Mapping a workflow names to a workflow implementation in the blueprint is done in a similar fashion to the way plugin operations are mapped, i.e. in one of two ways:

* Simple mapping - this should be used to map a workflow name to a workflow implementation which requires no parameters.

  *Example: Mapping `my_workflow` to be implemented by the `my_workflow_method_name` method in the `my_workflow_module_name` module in the `my_workflow_plugin_name` plugin*
  {% highlight yaml %}
workflows:
    my_workflow: my_workflow_plugin_name.my_workflow_module_name.my_workflow_method_name
  {%endhighlight%}

* Mapping with parameters - this should be used to map a workflow name to a workflow implementation which uses parameters.

  Workflow parameters declaration is done in a similar manner to the way type properties are declared: It's structured as a list, where each element is one of two:

  * A string - representing a mandatory parameter.
  * An object containing a single key-value pair - representing an optional parameter, where the key and value are the parameter name and default value, respectively.

  *Example: Making the same mapping yet with parameters declaration - A single mandatory parameter named `mandatory_parameter`, and two optional parameters with default values (one of which is a complex value)*
  {% highlight yaml %}
workflows:
    my_workflow:
	    mapping: my_workflow_plugin_name.my_workflow_module_name.my_workflow_method_name
	    parameters:
	        - optional_parameter: optional_parameter_default_value
	        - mandatory_parameter
	        - nested_parameter:
	              key1: value1
	              key2: value2
  {%endhighlight%}

<br>
The workflows implementations are considered as *workflows plugins*. As such, they are joined to the blueprint using the exact same mapping that's used to join regular plugins, e.g.:
{% highlight yaml %}
plugins:
    my_workflow_plugin_name:
        derived_from: "cloudify.plugins.manager_plugin"
        properties:
            url: "ENTER-PLUGIN-URL-HERE"
{%endhighlight%}


{%note title=Note%}
It's currently impossible to override a workflow mapping in the blueprint.
{%endnote%}


# Cancellation Support

A workflow should have support for graceful (AKA *Standard*) cancellation. It is up to the workflow author to decide the sematnics of *graceful* in this regard (and document them properly) - One workflow may merely stop the execution, while another may perform a rollback, and so on.

*Standard workflows* which don't implement such support will simply ignore the cancellation request and continue executing the workflow. To implement cancellation support for *standard workflows*, some constructs from the `cloudify.workflows.workflows_api` module need to be used.

Importing the module is done as so:

`from cloudify.workflows import api`

Then, `api.has_cancel_request()` can be used to determine whether the workflow execution should be cancelled due to a standard cancellation request. If it returns `True`, the workflow should take whichever actions its author deems as a proper graceful cancellation, and then raise an `api.ExecutionCancelled` error.

{%note title=Note%}
Waiting for a task to end by calling the method `get` of a `WorkflowTaskResult` object will make the execution go into blocking mode which responds to cancel requests by raising an `api.ExecutionCancelled` error. This means that *standard workflows* which use this method will in fact respond to a cancel request, even if that request was sent before the `get` method was called.

Further more - when a *standard workflow*'s code has finished running, the execution doesn't actually end until all tasks that have been launched have completed as well. This is implemented by iterating over all tasks whose `get` method hasn't yet been called and calling `get` on each one, and therefore if a cancel request was issued and any task was used in the workflow, yet hadn't been called with `get` before the cancel request was received, then the workflow will respond to the cancel request at this final waiting phase by ending (no longer waiting for the rest of the tasks [if any] to end), and doing so with a `cancelled` status.
{%endnote%}


*Graph-based workflows* have inherent support for graceful cancellation. Upon receiving such a request once the graph's `execute` method has been called, the defined behavior is for the workflow execution to simply end - yet any tasks related to the execution which might have been running at the moment of cancellation will continue to run until they're over.

Once the graph execution ends, the `tasks_graph`'s method `execute` will return the `api.EXECUTION_CANCELLED_RESULT` VALUE (equivalent to raising the `api.ExecutionCancelled` error), which is why *graph-based workflows* must return the value returned from the `execute` method.


For both types of workflows, it's of course possible to catch `api.ExecutionCancelled` errors that may have been raised, thus allowing to perform any sort of cleanup or custom behavior before re-raising the error.


{%note title=Note%}
Neither *standard workflows* nor *graph-based workflows* have any control over force-cancellation requests. Any workflow execution which was issued with such a request will be terminated immediately, while any tasks related to the execution which might have been running at the moment of termination will continue to run until they're over.
{%endnote%}



# Step by Step Tutorial

In this tutorial we will create from scratch a custom graph-based workflow whose purpose is to execute plugin operations.

The tutorial will offer some guidance and reference about the following:

* [Graph framework](#graph-framework)
  * Adding tasks
  * Creating dependencies between tasks
  * Using the `TaskSequence` construct
  * Using the `forkjoin` construct
* [Workflow APIs](#apis)
  * Executing node operations
  * Executing relationship operations
  * Sending events
  * Working with nodes, node instances, relationships and relationship instances
* Workflow parameters


## Requirements

Similarly to plugins, workflows require the [cloudify-plugins-common](https://github.com/cloudify-cosmo/cloudify-plugins-common) package to be able to use the Cloudify workflows API and framework.

## Implementing the Workflow

We'll be implementing the workflow one step at a time, where in each step we'll have a valid, working workflow, but with more features than the one in the previous step.

{% togglecloak id=1 %}Step 1: Basic implementation{% endtogglecloak %}
{% gcloak 1 %}
This is the basic implementation of the desired behavior as a graph-based workflow:

{% highlight python linenos%}
@workflow
def run_operation(ctx, **kwargs):
    graph = ctx.graph_mode()

    for node in ctx.nodes:
        for instance in node.instances:
            graph.add_task(instance.execute_operation('cloudify.interfaces.lifecycle.configure'))

    return graph.execute()
{%endhighlight%}

Step explanation:

* The first thing we do is to set the workflow to be in graph mode, indicating we'll be using the graph framework (line 3).
* Then, we iterate over all node instances, and add an execute operation task for each instance to the graph (lines 5-7).
* Finally, we tell the graph framework we're done building our tasks graph and that execution may commence (line 9).
{% endgcloak %}


{% togglecloak id=2 %}Step 2: Adding workflow parameters{% endtogglecloak %}
{% gcloak 2 %}
The basic workflow is great, if we always want to execute the exact same operation. How about we make it a bit more dynamic?

Lets add some workflow parameters:

{% highlight python linenos%}
@workflow
def run_operation(ctx, operation, type_name, operation_kwargs, **kwargs):
    graph = ctx.graph_mode()

    for node in ctx.nodes:
        if type_name in node.type_hierarchy:
            for instance in node.instances:
                graph.add_task(instance.execute_operation(operation, kwargs=operation_kwargs))

    return graph.execute()
{%endhighlight%}

Step explanation:

* The workflow method now receives three additional parameters: `operation`, `type_name` and `operation_kwargs` (line 2).
* The `operation` parameter is used to make the workflow able to execute operations dynamically, rather than hardcoded ones; The `operation_kwargs` parameter is used to pass parameters to the operation itself (line 8).
* Since the `operation` parameter value might be an operation which only exists for certain types, the `type_name` parameter is used to determine if the node at hand is of that type or from one derived from it (line 6).
{% endgcloak %}


{% togglecloak id=3 %}Step 3: Adding events{% endtogglecloak %}
{% gcloak 3 %}
The workflow's much more functional now, but we're pretty much in the dark when executing it. We'd like to know what's happening at every point in time.

We'll make the workflow more visible by sending out events:

{% highlight python linenos%}
@workflow
def run_operation(ctx, operation, type_name, operation_kwargs, **kwargs):
    graph = ctx.graph_mode()

    for node in ctx.nodes:
        if type_name in node.type_hierarchy:
            for instance in node.instances:

                sequence = graph.sequence()

                sequence.add(
                    instance.send_event('Starting to run operation'),
                    instance.execute_operation(operation, kwargs=operation_kwargs),
                    instance.send_event('Done running operation'))

    return graph.execute()
{%endhighlight%}

Step explanation:

* We create a `TaskSequence` object (named `sequence`) in the graph. We'll be using it to control the tasks' dependencies, ensuring the events are only sent when they should. Note that since this is done for each node instance separately, the sequences for the various node instances don't depend on one another, and will be able to run in parallel (line 9).
* Three tasks are inserted into the sequence - the original `execute_operation` task, wrapped by two `send_event` tasks. We used the `send_event` method of the instance (of type `CloudifyWorkflowNodeInstance`) rather than the `send_event` method of the ctx object (of type `CloudifyWorkflowContext`) since this way the event will contain node context information (lines 11-14).
{% endgcloak %}


{% togglecloak id=4 %}Step 4: Adding task dependencies{% endtogglecloak %}
{% gcloak 4 %}
Lets assume we wish for nodes to execute the operation in order, according to their relationships - each node should only execute the operation once all the nodes which it has relationships to are done executing the operations themselves.

{%note title=Note%}
This step's requirement, by its nature, might lead to deadlocks. To keep things simple, this example won't contain code for checking and handling such cases.
{%endnote%}

We'll achieve this behavior by adding task dependencies in the graph:

{% highlight python linenos%}
@workflow
def run_operation(ctx, operation, type_name, operation_kwargs, **kwargs):
    graph = ctx.graph_mode()

    send_event_starting_tasks = {}
    send_event_done_tasks = {}

    for node in ctx.nodes:
        if type_name in node.type_hierarchy:
            for instance in node.instances:
                send_event_starting_tasks[instance.id] = instance.send_event('Starting to run operation')
                send_event_done_tasks[instance.id] = instance.send_event('Done running operation')

    for node in ctx.nodes:
        if type_name in node.type_hierarchy:
            for instance in node.instances:

                sequence = graph.sequence()

                sequence.add(
                    send_event_starting_tasks[instance.id],
                    instance.execute_operation(operation, kwargs=operation_kwargs),
                    send_event_done_tasks[instance.id])

    for node in ctx.nodes:
        for instance in node.instances:
            for rel in instance.relationships:

                instance_starting_task = send_event_starting_tasks.get(instance.id)
                target_done_task = send_event_done_tasks.get(rel.target_id)

                if instance_starting_task and target_done_task:
                    graph.add_dependency(instance_starting_task, target_done_task)

    return graph.execute()
{%endhighlight%}

Step explanation:

* We aim to create task dependency between each node's first task (the `send_event` about starting the operation) and the last task (the `send_event` about finishing the operation) of each node it has a relationship to.
* First, we had to somewhat refactor the existing code - we need references for those tasks for creating the dependencies, and so we first created the tasks and stored them in two simple dictionaries which map each instance ID to that instance's relevant tasks(lines 5-12).
* When adding the tasks to the sequence, we add the tasks we've already created (lines 21 + 23)
* Finally, we have a new section in the code, in which we go over all instances' relationships, retrieve the source instance's first task and the target instance's last task, and if both exist (might not exist since the source and/or target node might not be be of type `type_name` or of a type which is derived from it) then a dependency is created between them (lines 25-33).
{% endgcloak %}


{% togglecloak id=5 %}Step 5: Adding support for relationship operations{% endtogglecloak %}
{% gcloak 5 %}
The workflow we've created thus far seems great for running node opeartions, but what about relationship operations?

Lets add support for those too:

{% highlight python linenos%}
@workflow
def run_operation(ctx, operation, type_name, operation_kwargs, is_node_operation, **kwargs):
    graph = ctx.graph_mode()

    send_event_starting_tasks = {}
    send_event_done_tasks = {}

    for node in ctx.nodes:
        if type_name in node.type_hierarchy:
            for instance in node.instances:
                send_event_starting_tasks[instance.id] = instance.send_event('Starting to run operation')
                send_event_done_tasks[instance.id] = instance.send_event('Done running operation')

    for node in ctx.nodes:
        if type_name in node.type_hierarchy:
            for instance in node.instances:

                sequence = graph.sequence()

                if is_node_operation:
                    operation_task = instance.execute_operation(operation, kwargs=operation_kwargs)
                else:
                    forkjoin_tasks = []
                    for relationship in instance.relationships:
                        forkjoin_tasks.append(relationship.execute_source_operation(operation))
                        forkjoin_tasks.append(relationship.execute_target_operation(operation))
                    operation_task = forkjoin(*forkjoin_tasks)

                sequence.add(
                    send_event_starting_tasks[instance.id],
                    operation_task,
                    send_event_done_tasks[instance.id])

    for node in ctx.nodes:
        for instance in node.instances:
            for rel in instance.relationships:

                instance_starting_task = send_event_starting_tasks.get(instance.id)
                target_done_task = send_event_done_tasks.get(rel.target_id)

                if instance_starting_task and target_done_task:
                    graph.add_dependency(instance_starting_task, target_done_task)

    return graph.execute()
{%endhighlight%}

Step explanation:

* The workflow now has a new parameter - `is_node_operation` - a boolean which represents whether the operation to execute is a node operation or a relationship operation (line 2).
* We had a tiny bit of refactoring done: If the operation is a node operation, we create the task somewhat earlier and store it in a variable named `operation_task`, which is later inserted into the graph in the sequence as before (lines 20-21 + 31)
* If the operation is a relationship operation, we first collect all tasks related to the current instance that should be executed, by going over all of the instance relationships and creating tasks for both source and target operations (lines 22-26)
* Finally, We create a single `forkjoin` task which contains all of the tasks we've collected, and store it in the `operation_task` variable so it'll later be inserted into the sequence. This will allow all of the relationship operations we've collected to run in parallel, while making sure none of them will run before the first sequence task (the `send_event` about starting the operation) completes and also ensuring they'll all complete before the last sequence task (the `send_event` about finishing the operation) is started (line 27).
* Note that in order to use the `forkjoin` construct we used in line 27, it's required to import it, which can be done like so: `from cloudify.workflows.tasks_graph import forkjoin`.
{% endgcloak %}

We could continue improving our workflow and extending its features, but in the scope of this tutorial, this last version of the workflow will be the one we'll be using throughout the remaining tutorial sections.


## Blueprint Mappings
The workflow plugin declaration will look like this:
{% highlight yaml %}
plugins:
    my_workflow_plugin_name:
        derived_from: "cloudify.plugins.manager_plugin"
        properties:
            url: "ENTER-PLUGIN-URL-HERE"
{%endhighlight%}
the `url` field should be filled with the url of wherever the plugin will be hosted at. If the plugin is used locally, the `folder` property may be used instead of `url`.


The workflow mapping may look like so:
{% highlight yaml %}
workflows:
    my_workflow:
        mapping: my_workflow_plugin_name.my_workflow_module_name.run_operation
        parameters:
            - opreation
            - type_name: cloudify.types.base
            - operation_kwargs: {}
            - is_node_operation: True
{%endhighlight%}

This will define a workflow named `my_workflow`, whose implementation is the `run_operation` workflow method we coded.

The workflow has four parameters declared:

* The mandatory `operation` parameter
* The optional `type_name` parameter, which defaults to `cloudify.types.base` (meaning the operation will run on all nodes if this value isn't overridden)
* The optional `operation_kwargs` parameter, which defaults to an empty dictionary.
* The optional `is_node_operation` parameter, which defaults to True.



## Testing the Workflow

Coming soon...


## Packaging the Workflow

Since workflows are joined to the blueprint the same way plugins do, they are also packaged the same way. Refer to the [Plugin creation guide](guide-plugin-creation.html#packaging-your-plugin) for more information.
