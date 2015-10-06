---
layout: bt_wiki
title: Cloudify Workflows
category: Workflows
publish: false
abstract: What are Cloudify Workflows and how to use them
pageord: 500

---

{%summary%}{{page.abstract}}{%endsummary%}


# Overview

Workflows are automation process algorithms. They describe the flow of the automation by determining which tasks will be executed and when. A task may be an operation (implemented by a plugin), but it may also be other actions, including arbitrary code. Workflows are written in Python, using dedicated APIs and framework.

Workflows are deployment specific. Every deployment has its own set of workflows (declared in the Blueprint), and executions of a workflow are in the context of that deployment.

Controlling workflows (i.e. executing, cancelling, etc.) is done via REST calls to the management server. In this guide, the examples will be shown using Cloudify CLI commands which in turn call the above REST API calls.

# Executing Workflows

Workflows are executed directly. Executing workflows from the CLI is done as follows:

`cfy executions start -w my_workflow -d my_deployment`

this would execute the `my_workflow` workflow on the `my_deployment` deployment.

Workflows run on deployment-dedicated workers on the management server, on top of the Cloudify workflow engine.

When a workflow is executed, an Execution object is created for the deployment, containing both static and dynamic information about the workflow's execution run. An important dynamic field in the Execution object is the `status` field, which conveys the current state of the execution.

An execution is considered to be a *running execution* until it reaches one of the three final statuses: *terminated*, *failed* or *cancelled*. For more information, refer to the [workflow execution statuses](workflows-statuses.html) section in this page.

{%note title=Note%}
It is recommended to only have one *running execution* per deployment at any point in time. By default, an attempt to execute a workflow while another execution is running for the same deployment will raise an error. To override this behavior and allow for multiple executions to run in parallel, use the `force` flag for each execute command. For a syntax reference, see the [CLI commands reference](cli-cfy-reference.html).
{%endnote%}


# Writing a Custom Workflow

Advanced users may wish to write custom workflows.
To learn how to write a custom workflow, refer to the [Workflows Authoring Guide](workflows-authoring.html).
