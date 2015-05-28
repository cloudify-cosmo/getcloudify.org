---
layout: bt_wiki
title: The Deployments Page
category: Web Interface
publish: true
abstract: Deployment Page Reference
pageord: 130

terminology_link: reference-terminology.html
node_types_link: dsl-spec-node-types.html
relationships_link: dsl-spec-relationships.html
---
{%summary%}This is a view of a single blueprint in Cloudify's User Interface{%endsummary%}.

When clicking on the `Deployments` tab and choosing a deployment you will be able to choose one of the following:

# Topology
The [Topology]({{page.terminology_link}}#topology) is an application’s graph of nodes and their relationships, which describes the lifecycle events or other operations that each node and relationship exposes for use in workflows.<br>
Each of the blueprint nodes is displayed as a square container, which can contain another nodes. Each of the nodes has a title describing its name, and an icon to indicate the [node type]({{page.node_types_link}}).<br>
[Relationships]({{page.relationships_link}}) between nodes are marked with arrows, starts from the connected node and ends in the target node.<br>
The topology view shows only the application nodes and not the network nodes. If a node has network dependency, it will be displayed as a bullet icon in the node title.<br>
[Host nodes]({{page.terminology_link}}#host-node) are shown with number bullet beside the node type icon, which indicates the number of [instances]({{page.terminology_link}}#node-instance) and number of initiated instances. Contained nodes are shown with status bullet beside the node type icon, which indicates the node status by bullet icon & color.
The contained nodes bullet indicates the status of all instances of the specific node. For example, if at least one instance raised an error, the bullet will be colored in red.
The bullet color indicates the node current status:<br>

![Loading status](/guide/images/ui/ui-node-status-process.png) - Node is in loading process<br>
![Error status](/guide/images/ui/ui-node-status-error.png) - An error occurred while running the node<br>
![Warning status](/guide/images/ui/ui-node-status-warning.png) - Warning raised while running the node<br>
![Success status](/guide/images/ui/ui-node-status-success.png) - Node was initiated successfully<br>

![Deployment topology](/guide/images/ui/ui-deployment-ready.jpg)

Clicking a node's title will open a side panel with [runtime properties]({{page.terminology_link}}#runtime-properties) of the selected node. The floating panel allows the user to select which instance details to show.<br>

![Deployment node details](/guide/images/ui/ui-deployment-floating-panel.png)

# Network
A map of networks topologies according to the blueprint's topology contains internal and external networks, hosts, routers.<br/>
The network's name is displayed as a grey title, each network contains sub-networks displayed as colored lines underneath.
Network devices, such as hosts & routers, are displayed as icons, each icon indicates the device's type.
Connections between sub-networks and devices are marked with a colored line, by the color of the connected sub-network.<br>
Clicking a device will open a side panel with details of the selected device.<br>

![Deployment networks](/guide/images/ui/ui-deployment-networks.jpg)

# Nodes
A list of nodes according to the blueprint's topology.<br/>
For every node, its type, number of instance, and relationships are shown. By clicking the magnifier icon, a side panel will be opened with the selected node's details.
![Deployment nodes](/guide/images/ui/ui-deployment-nodes.jpg)

# Executions
Running instances of a workflow. See the definition [here]({{page.terminology_link}}#execution).<br/>
![Deployment execution](/guide/images/ui/ui-deployment-execution.jpg)

# Monitoring
See the definition [here](webui-graphing-metrics.html).
