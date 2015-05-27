---
layout: bt_wiki
title: The Deployments Page
category: Web Interface
publish: true
abstract: Deployment Page Reference
pageord: 130

terminology_link: reference-terminology.html
---
{%summary%}This is a view of a single blueprint in Cloudify's User Interface{%endsummary%}.

When clicking on the `Deployments` tab and choosing a deployment you will be able to choose one of the following:

# Topology
The [Topology]({{page.terminology_link}}#topology) is an application’s graph of nodes and their relationships, which describes the lifecycle events or other operations that each node and relationship exposes for use in workflows.<br>
Each of the blueprint nodes is displayed as a square container, which can contain another nodes. Each of the nodes has a title describing its name, and an icon to indicate the node type.<br>
Relationships between nodes are marked with arrows, starts from the connected node and ends in the target node.<br>
The topology view shows only the application nodes and not the network nodes. If a node has network dependency, it will be displayed as a bullet icon in the node title.<br>
The numbers of node instances and number of initiated instances are marked in a bullet beside the node type icon. The bullet color indicates the node current status:<br>
<ul>
<li>Black - Node is not running</li>
<li>Red - An error occurred while running the node</li>
<li>Yellow - Warning raised while running the node</li>
<li>Green - Node was initiated successfully</li>
</ul>
Pressing a node title will open a side panel with details of the selected node.<br>

![Deployment topology](/guide/images/ui/ui-deployment-ready.jpg)

# Network
A map of networks topology according to the blueprint topology contained internal and external networks, hosts, routers.<br/>
The network name is displayed as a grey title, each network contains sub-networks displayed as a colored lines underneath.
Network devices, such as hosts & routers, are displayed as icons, each icon indicates the device type.
Connections between sub-networks and devices are marked with colored line, by the color of the connected sub-network.<br>
Pressing a device will open a side panel with details of the selected device.<br>

![Deployment networks](/guide/images/ui/ui-deployment-networks.jpg)

# Nodes
A list of nodes according to the blueprint's topology.<br/>
![Deployment nodes](/guide/images/ui/ui-deployment-nodes.jpg)

# Executions
Running instances of a workflow. See the definition [here]({{page.terminology_link}}#execution).<br/>
![Deployment execution](/guide/images/ui/ui-deployment-execution.jpg)

# Monitoring
See the definition [here](webui-graphing-metrics.html).
