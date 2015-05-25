---
layout: bt_wiki
title: Cancelling Workflow Executions
category: Workflows
publish: true
abstract: How to cancel an Execution of a running Workflow
pageord: 300


types_yaml_link: reference-types.html

default_workflows_source_link: https://github.com/cloudify-cosmo/cloudify-plugins-common/blob/3.1/cloudify/plugins/workflows.py
---

{%summary%}{{page.abstract}}{%endsummary%}


It is possible to cancel an execution whose [status](workflows-statuses.html) is either `pending` or `started`.

There are two types of execution cancellations:

* Standard cancellation - This type means that a cancel request is posted for the execution. The execution's status will become `cancelling`. However, the actions to take upon such a request are up to the workflow that's being executed: It might try and stop, perform a full rollback, or even ignore the request completely and continue executing.

  Usually, this is the recommended way to cancel an execution, since while it doesn't make any guarantees, it allows for a workflow to cancel its execution gracefully - whether by performing a rollback, cleaning up resources, or any other actions that it may take before stopping.


* Force cancellation - This type also means a cancel request is posted for the execution (with the execution's status becoming `force_cancelling`), yet in this case it is not up to the workflow to act on this request - instead, the Cloudify workflow engine will simply terminate the process running the workflow immediately.

  This type of cancellation may be used over an execution which is already in `cancelling` status, and indeed, its main purpose is to be used for workflows which don't support Standard cancellation or when the Standard cancellation is stuck or is taking too long. It may also be used when it's needed to simply stop an execution immediately.


{%warning title=Warning%}
When the execution's status changes to `cancelled`, it means the workflow execution has completed, meaning no new tasks will be started; However, tasks that have already been started might still be executing on agents. This is true for both Standard and Forced cancellations.
{%endwarning%}

<br>
Cancelling an execution whose ID is `SOME_EXECUTION_ID` from the CLI can be done using the following command:

`cfy executions cancel -e SOME_EXECUTION_ID`

To use force-cancellation instead, simply add the `force` flag. For a syntax reference, see the [CLI commands reference](cli-cfy-reference.html).

{%note title=Note%}
When the CLI completes a cancel execution command, it does not mean the execution has finished cancelling, even if force cancellation was used. The execution will be in either a `cancelling` or `force_cancelling` status (depending on the cancellation type that was used) until the cancellation has finished, at which time its status will change to `cancelled`, and the execution will be over (with the Warning above still applying).
{%endnote%}

