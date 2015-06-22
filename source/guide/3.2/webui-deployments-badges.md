---
layout: bt_wiki
title: Workflow execution in the UI
category: Web Interface
publish: true
abstract: Workflow badges Reference
pageord: 135

terminology_link: reference-terminology.html
execute_workflow_link: getting-started-execute-workflow.html
---
{%summary%}This is an overview of a blueprint workflow execution in Cloudify's User Interface{%endsummary%}.

When executing a `Workflow` for a `Deployment` (e.g. the `install` workflow), the topology nodes show badges that reflect the workflow execution state.<br/>
See more details on executing workflows [here]({{page.execute_workflow_link}}#topology).<br/>

## Badges
See the `Topology` terminology definition [here]({{page.terminology_link}}#topology).<br/>

* Install state - The workflow execution is in progress for this node
* Done state - The workflow execution was completed successfully for this node
* Alerts state - The workflow execution was partially completed for this node
* Failed state - The workflow execution failed for this node

![Deployment Topology Node Badges]({{ site.baseurl }}/guide/images/ui/ui-deployment-topology-badges.png)

## Workflow states represented by badges
A deployment before any workflow was executed
![Deployment Topology]({{ site.baseurl }}/guide/images/ui/ui-deployment-topology-1.png)

A deployment with a workflow execution in progress
![Deployment Topology Execution In Progress]({{ site.baseurl }}/guide/images/ui/ui-deployment-topology-2.png)

A deployment with a workflow execution in progress, partially completed
![Deployment Topology Execution Partially Completed]({{ site.baseurl }}/guide/images/ui/ui-deployment-topology-3.png)

A deployment with a workflow execution completed successfully
![Deployment Topology Execution Completed Successfully]({{ site.baseurl }}/guide/images/ui/ui-deployment-topology-4.png)

A deployment with a workflow execution partially completed successfully with some alerts
![Deployment Topology Execution Completed Partially Alerts]({{ site.baseurl }}/guide/images/ui/ui-deployment-topology-5.png)

A deployment with a workflow execution that partially failed
![Deployment Topology Execution Completed Partially Errors]({{ site.baseurl }}/guide/images/ui/ui-deployment-topology-6.png)

A deployment with a workflow execution that failed
![Deployment Topology Execution Completed Errors]({{ site.baseurl }}/guide/images/ui/ui-deployment-topology-7.png)

