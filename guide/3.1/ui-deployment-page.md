---
layout: bt_wiki
title: The Deployments Page
category: User Interface
publish: true
abstract: Using the Deployment Details Page 
pageord: 130

terminology_topology: http://getcloudify.org/guide/3.1/reference-terminology.html#sts=Topology
terminology_execution: http://getcloudify.org/guide/3.1/reference-terminology.html#sts=Execution
ui_monitoring: http://getcloudify.org/guide/3.1/ui-monitoring.html
terminology_link: reference-terminology.html
terminology_deployment: http://getcloudify.org/guide/3.1/reference-terminology.html#deployment
---
{%summary%} {{page.abstract}}{%endsummary%}

The Deployment page shows you the details of a single Cloudify [deployment]({{page.terminology_deployment}}) 
The page is split into several tabs, each showing a different part of the deployment.

# Topology
A graphical view of the deployment [topology]({{page.terminology_topology}}).<br/>
![Deployment topology](/guide/images/ui/ui-deployment-ready.jpg)

# Network
A graphical view of the network elements contained in the blueprint. Typical elements shown here are internal and external networks, hosts, routers and ports.<br/>
![Deployment networks](/guide/images/ui/ui-deployment-networks.jpg)

# Nodes
The list of nodes defined in this deployment.<br/>
![Deployment nodes](/guide/images/ui/ui-deployment-nodes.jpg)

# Executions
List of [executions]({{page.terminology_execution}}) performed by this deployment.<br/>
![Deployment execution](/guide/images/ui/ui-deployment-execution.jpg)

# Monitoring
[Monitoring]({{page.ui_monitoring}}) information collected for this deployment.
![Deployment monitorin](/guide/images/ui/ui_monitoring.jpg)

