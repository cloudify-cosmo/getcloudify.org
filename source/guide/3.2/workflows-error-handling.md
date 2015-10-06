---
layout: bt_wiki
title: Workflow Error Handling
category: Workflows
publish: true
abstract: Handling Errors of executed Workflows
pageord: 400

---

{%summary%}{{page.abstract}}{%endsummary%}


When an error is raised from the workflow itself, the workflow execution will fail - it will end with `failed` status, and should have an error message under its `error` field. There is no built-in retry mechanism for the entire workflow.

However, there's a retry mechanism for task execution within a workflow.
Two types of errors can occur during task execution: *Recoverable* and *NonRecoverable*. **By default, all errors originating from tasks are *Recoverable***.

If a *NonRecoverable* error occurs, the workflow execution will fail, similarly to the way described for when an error is raised from the workflow itself.

If a *Recoverable* error occurs, the task execution might be attempted again from its start. This depends on the configuration of the `task_retries` parameter, which determines how many retry attempts will be given by default to any failed task execution.

The `task_retries` parameter can be set in one of the following manners:

* When bootstrapping using the [Cloudify CLI](manager-blueprints-bootstrapping.html), the `task_retries` parameter is a configuration parameter under `cloudify`.`workflows`.

* If Cloudify wasn't bootstrapped using Cloudify's CLI, the `task_retries` parameter may be set via a REST call to the management server that creates a provider context object, but this call is not yet documented.

If the parameter was not set, it will default to the value of `-1`, which means *infinite retries*.

In addition to the `task_retries` parameter, there's also the `retry_interval` parameter, which determines the minimum amount of wait time (in seconds) after a task execution fails before it is retried. It can be set in the very same way `task_retries` is set. If it isn't set, it will default to the value of `30`.
