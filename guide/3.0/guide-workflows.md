---
layout: bt_wiki
title: Workflows Guide
category: Guides
publish: true
abstract: "A guide to Cloudify Workflows"
pageord: 100


types_yaml_link: http://getcloudify.org/spec/cloudify/3.0/types.yaml

# TODO: change develop --> 3.0 right before the release, it is currently develop because there is no 3.0 tag yet
default_workflows_source_link: https://github.com/cloudify-cosmo/cloudify-manager/blob/develop/workflows/workflows/default.py
---

{%summary%} This guide will explain what are workflows and how to use them {%endsummary%}


# Introduction to workflows
Workflows are automation process algorithms. They describe the flow of the automation by determining which tasks will be executed and when. A task may be an operation (implemented by a plugin), but it may also be other actions, including arbitrary code. Workflows are written in Python, using dedicated APIs and framework.

Workflows are per deployment. Every deployment has its own set of workflows (declared in the Blueprint), and executions of a workflow are in the context of that deployment.

Controlling workflows (i.e. executing, cancelling, etc.) is done via REST calls to the management server. In this guide, the examples will be shown using Cloudify CLI commands.


# Executing workflows
Workflows are executed directly. Executing workflows from the CLI is done as so:

`cfy deployments execute my_workflow -d my_deployment`

this would execute the `my_workflow` workflow on the `my_deployment` deployment.

Workflows run on deployment-dedicated workers on the management server, on top of the Cloudify workflow engine.

When a workflow is executed, an Execution object is created for the deployment, containing both static and dynamic information about the workflow's execution run. One dynamic field in the Execution object is `status`, which conveys the state the execution is at.

An execution is considered to be a *running execution* until it reaches one of the three final statuses: *terminated*, *failed* or *cancelled*. For more information, see the section on [workflow execution statuses](#workflow-execution-statuses).


{%note title=Note%}
It is recommended to only have one *running execution* per deployment at any point in time. By default, an attempt to execute a workflow while another execution is running for the same deployment will raise an error. To override this behavior and allow for multiple executions to run in parallel, use the `force` flag for each execute command. For a syntax reference, see the [CFY CLI commands reference](reference-cfy.html#deployments-execute).
{%endnote%}



# Workflow and execution parameters
Workflows can have parameters. Workflow parameters are declared in the blueprint, where each parameter can be declared as either a mandatory parameter or an optional parameter with a default value. Since parameters declaration is only relevant for the workflow author, more information on the declaration of workflow parameters in the blueprint can be found in the [Workflows Authoring Guide](guide-authoring-workflows.html).

<br>
Viewing a workflow's parameters can be done in the CLI using the following command:

`cfy workflows get -d my_deployment -w my_workflow`

this would show information on the `my_workflow` workflow of the `my_deployment` deployment, including the workflow's mandatory parameters as well as the optional parameters and their default values.

*Example: Retrieving a workflow's parameters*
![Workflows Get CLI screenshot](images/guide/workflows-get.png)
*The workflow has a single mandatory parameter named* `mandatory_parameter`*, and two optional parameters, one named* `optional_parameter` *which has a default value of* `optional_parameter_default_value`*, and another named* `nested_parameter` *which has a complex default value.*

<br>
When executing a workflow, it's required to pass values for all mandatory parameters, and it's possible to override the default values for any of the optional parameters. Parameters are passed in the CLI with the `-p` flag, and in JSON form.

*Example: Executing a workflow with parameters*
![Execute with parameters CLI screenshot](images/guide/execute-with-parameters.png)
*Executing the workflow and passing the value* `mandatory_parameter_value` *for the* `mandatory_parameter` *parameter, and overriding the value of the* `nested_parameter` *parameter with a new complex value (though it could have been overridden with a non-complex value as well).*

<br>
Execution parameters are the actual parameters the execution was run with. To view those in the CLI, use the following command:

`cfy executions get -e my_execution`

{%note title=Note%}
Both workflows and executions are in the context of a deployment - The reason that a deployment is not specified in the above command is that every execution has a unique ID (in UUID format), while workflows are referred to by name which might not be unique across deployments.
{%endnote%}


*Example: Retrieving an execution's parameters*
![Executions Get CLI screenshot](images/guide/executions-get.png)
*The workflow was executed with three parameters with the presented values. It can be seen that the* `optional parameter` *parameter was assigned with its default value, while the* `nested_parameter` *parameter's value was overridden with the new complex value.*

<br>
It is also possible to pass custom parameters that weren't declared for the workflow in the blueprint. By default, providing such parameters will raise an error, to help avoid mistakes - but if the need for such parameters arises, they can be allowed on a per-execution basis by enabling the `allow-custom-parameters` flag. For a syntax reference, see the [CFY CLI commands reference](reference-cfy.html#deployments-execute).



# Cancelling workflows executions
It is possible to cancel an execution whose [status](#workflow-execution-statuses) is either `pending` or `started`.

There are two types of execution cancellations:

* Standard cancellation - This type means a cancel request is posted for the execution. The execution's status will become `cancelling`. However, the actions to take upon such a request are up to the workflow that's being executed: It might try and stop, perform a full rollback, or even ignore the request completely and continue executing.

  Usually, this is the recommended way to cancel an execution, since while it doesn't make any guarantees, it allows for a workflow to cancel its execution gracefully - whether it be performing a rollback, cleaning up resources, or any other actions that it may wish to take before stopping. 


* Force cancellation - This type also means a cancel request is posted for the execution (with the execution's status becoming `force_cancelling`), yet in this case it is not up to the workflow to act on this request - instead, the Cloudify workflow engine will simply terminate the process running the workflow immediately.
  
  This type of cancellation may be used over an execution which is already in `cancelling` status, and indeed, its main purpose is to be used for workflows which don't support Standard cancellation or when the Standard cancellation is stuck or is taking too long. It may also be used when it's needed to simply stop an execution immediately.


{%warning title=Warning%}
When the execution's status changes to `cancelled`, it means the workflow execution has completed, meaning no new tasks will be started; However, tasks that have already been started might still be executing on agents. This is true for both Standard and Force cancellations.
{%endwarning%}

<br>
Cancelling an execution whose ID is `my_execution` from the CLI can be done using the following command:

`cfy executions cancel -e my_execution`

To use force-cancellation instead, simply add the `force` flag. For a syntax reference, see the [CFY CLI commands reference](reference-cfy.html#executions-cancel).

{%note title=Note%}
When the CLI completes a cancel execution command, it does not mean the execution has finished cancelling, even if force cancellation was used. The execution will be in either a `cancelling` or `force_cancelling` status (depending on the cancellation type that was used) until the cancellation has finished, at which time its status will change to `cancelled`, and the execution will be over (with the Warning above still applying).
{%endnote%}



# Workflows error-handling
When an error is raised from the workflow itself, the workflow execution will fail - it will end with `failed` status, and should have an error message under its `error` field. There is no built-in retry mechanism for the entire workflow.

However, there's a retry mechanism for task execution within a workflow.
Two types of errors can occur during task execution: *Recoverable* and *Nonrecoverable*. **By default, all errors originating from tasks are *Recoverable***.

If a *Nonrecoverable* error occurs, the workflow execution will fail, similarly to the way described for when an error is raised from the workflow itself.

If a *Recoverable* error occurs, the task execution might be attempted again from its start. This depends on the configuration of the `task_retries` parameter, which determines how many retry attempts will be given by default to any failed task execution.

The `task_retries` parameter can be set in one of the following manners:

* When bootstrapping using the [Cloudify CLI and a Provider](guide-cli.html), the `task_retries` parameter is a configuration parameter under `cloudify`.`workflows`.

* If Cloudify was [bootstrapped manually](installation-manual.html), the `task_retries` parameter may be set via a REST call to the management server that creates a provider context object, but this call is not yet documented.

If the parameter was not set, it will default to the value of `-1`, which means *infinite retries*.

In addition to the `task_retries` parameter, there's also the `retry_interval` parameter, which determines the minimum amount of wait time (in seconds) after a task execution fails before it is retried. It can be set in the very same way `task_retries` is set. If it isn't set, it will default to the value of `30`.



# Workflow execution statuses
The workflow execution status is stored in the `status` field of the Execution object. These are the execution statuses which currently exist:

* **pending** - The execution is waiting for a worker to start it.
* **started** - The execution is currently running.
* **cancelling** - The execution is currently being cancelled.
* **force_cancelling** - The execution is currently being force-cancelled (see more information under [Cancelling workflows executions](#cancelling-workflows-executions)).
* **cancelled** - The execution has been cancelled.
* **terminated** - The execution has terminated successfully.
* **failed** - The execution has failed. An execution with this status should have an error message available under the execution object's `error` field.


# Built-in workflows
Cloudify comes with a couple of built-in workflows - these are the workflows for application *install* and *uninstall*.

Built-in workflows are declared and mapped in the blueprint in [`types.yaml`]({{page.types_yaml_link}}), which is usually imported either directly or indirectly via other imports.

{% highlight yaml %}
# snippet from types.yaml
workflows:
    install: workflows.default.install
    uninstall: workflows.default.uninstall
{% endhighlight %}


The `workflows.default.install` and `workflows.default.uninstall` implementations can be found at [`workflows/default.py`]({{page.default_workflows_source_link}}).

Built-in workflows are not special in any way - they use the same API and framework as any custom workflow is able to use, and one may replace them with different workflows with the same names.

For more information and detailed description of the built-in workflows, visit the [Built-in workflows reference](reference-builtin-workflows.html).


# Writing a custom workflow
Advanced users may wish to write custom workflows. 
To learn how to write a custom workflow, visit the [workflows authoring guide](guide-authoring-workflows.html).