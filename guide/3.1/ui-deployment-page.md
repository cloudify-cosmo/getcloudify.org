---
layout: bt_wiki
title: The Deployments Page
category: User Interface
publish: true
abstract: Deployment Page Reference
pageord: 100

terminology_topology: http://getcloudify.org/guide/3.1/reference-terminology.html#sts=Topology
terminology_execution: http://getcloudify.org/guide/3.1/reference-terminology.html#sts=Execution
ui_monitoring: http://getcloudify.org/guide/3.1/ui-monitoring.html
terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}
{%summary%}This is a view of a single blueprint in Cloudify's User Interface{%endsummary%}.

When clicking on the `Deployments` tab and choosing a deployment you will be able to choose one of the following:

# Topology
See the definition [here]({{page.terminology_topology}}).<br/>
![Deployment topology](/guide/images/ui/ui-deployment-ready.jpg)

# Network
A map of networks according to the blueprint's topology containing internal and external networks, hosts, routers and ports.<br/>
![Deployment networks](/guide/images/ui/ui-deployment-networks.jpg)

# Nodes
A list of nodes according to the blueprint's topology.<br/>
![Deployment nodes](/guide/images/ui/ui-deployment-nodes.jpg)

# Executions
Running instances of a workflow. See the definition [here]({{page.terminology_execution}}).<br/>
![Deployment execution](/guide/images/ui/ui-deployment-execution.jpg)

# Monitoring
See the definition [here]({{page.ui_monitoring}}).
