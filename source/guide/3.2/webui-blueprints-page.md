---
layout: bt_wiki
title: The Blueprints Page
category: Web Interface
publish: true
abstract: Blueprint Page Reference
pageord: 110

terminology_link: reference-terminology.html
---
{%summary%}This is a view of a single blueprint in Cloudify's User Interface{%endsummary%}.

When clicking on the `Blueprints` tab and choosing a blueprint you will be able to choose one of the following:

# Topology
The [Topology]({{page.terminology_link}}#topology) is an application’s graph of nodes and their relationships, which describes the lifecycle events or other operations that each node and relationship exposes for use in workflows.<br>
Each of the blueprint nodes is displayed as a square container, which can contain another nodes. Each of the nodes has a title describing its name, and an icon to indicate the node type.<br>
Relationships between nodes are marked with arrows, starts from the connected node and ends in the target node.<br>
The topology view shows only the application nodes and not the network nodes. If a node has network dependency, it will be displayed as a bullet icon in the node title.<br>
The number of node instances is marked in a bullet beside the node type icon.<br>
Pressing a node title will open a side panel with details of the selected node.<br>

![Blueprint topology](/guide/images/ui/ui-blueprint-topology.png)

Pressing a node title will open a side panel with details of the selected node.<br>

![Blueprint node details](/guide/images/ui/ui-blueprint-floating-panel.png)

# Network
A map of networks topology according to the blueprint topology contained internal and external networks, hosts, routers.<br/>
The network name is displayed as a grey title, each network contains sub-networks displayed as a colored lines underneath.
Network devices, such as hosts & routers, are displayed as icons, each icon indicates the device type.
Connections between sub-networks and devices are marked with colored line, by the color of the connected sub-network.<br>
Pressing a device will open a side panel with details of the selected device.<br>

![Blueprint networks](/guide/images/ui/ui-deployment-networks.jpg)

# Nodes
A list of nodes according to the blueprint topology.<br/>
![Blueprint nodes](/guide/images/ui/ui-deployment-nodes.jpg)

# Source
Displays highlight blueprint source code, Python plugins and other text files includes in your blueprint package.<br/>
![Blueprint source code](/guide/images/ui/ui-blueprint-sourcecode.jpg)
