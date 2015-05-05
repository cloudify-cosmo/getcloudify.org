---
layout: bt_wiki
title: Executing a Workflow
category: Getting Started
publish: true
abstract: Deployment Executions Topology Badge Reference
pageord: 500

terminology_topology: http://getcloudify.org/guide/3.1/reference-terminology.html#sts=Topology
---
{%summary%} {{page.abstract}}{%endsummary%}
{%summary%}This is an overview of a single blueprint topology view badge states in Cloudify's User Interface{%endsummary%}.


# Overview

Once a Deployment is created, a process is required to perform the actual application's manifestation in your chosen environment.
This process is called a Workflow.

A Workflow is a Python code which describes the flow of performing differnet actions on your deployment.

The first workflow a user will stumble upon is called the Install Workflow and is the default workflow provided by Cloudify for deploying your application.

A user can create workflows for different types of action such as deploying code, changing infrastructure state and so forth.


# Executing a Workflow

## CLI

To execute a workflow using Cloudify's CLI execute:

{%highlight bash%}
cfy executions start -w <WORKFLOW_NAME> -d <DEPLOYMENT_NAME>
{%endhighlight%}


## UI

When executing a `Workflow` for a `Deployment` (e.g. the `install` workflow), the topology nodes show badges that reflect the workflow execution state.

# Badges
See the `Topology` terminology definition [here]({{page.terminology_topology}}).<br/>

* Install state - The workflow execution is in progress for this node
* Done state - The workflow execution was completed successfully for this node
* Alerts state - The workflow execution was partially completed for this node
* Failed state - The workflow execution failed for this node

![Deployment Topology Node Badges](/guide/images/ui/ui-deployment-topology-badges.png)

# Workflow states represented by badges
A deployment before any workflow was executed
![Deployment Topology](/guide/images/ui/ui-deployment-topology-1.png)

A deployment with a workflow execution in progress
![Deployment Topology Execution In Progress](/guide/images/ui/ui-deployment-topology-2.png)

A deployment with a workflow execution in progress, partially completed
![Deployment Topology Execution Partially Completed](/guide/images/ui/ui-deployment-topology-3.png)

A deployment with a workflow execution completed successfully
![Deployment Topology Execution Completed Successfully](/guide/images/ui/ui-deployment-topology-4.png)

A deployment with a workflow execution partially completed successfully with some alerts
![Deployment Topology Execution Completed Partially Alerts](/guide/images/ui/ui-deployment-topology-5.png)

A deployment with a workflow execution that partially failed
![Deployment Topology Execution Completed Partially Errors](/guide/images/ui/ui-deployment-topology-6.png)

A deployment with a workflow execution that failed
![Deployment Topology Execution Completed Errors](/guide/images/ui/ui-deployment-topology-7.png)


