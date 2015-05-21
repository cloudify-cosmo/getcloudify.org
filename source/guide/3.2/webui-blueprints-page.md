---
layout: bt_wiki
title: The Blueprints Page
category: Web Interface
publish: true
abstract: Blueprint Page Reference
pageord: 110

terminology_link: reference-terminology.html
---
{%summary%}{{page.abstract}}{%endsummary%}
{%summary%}This is a view of a single blueprint in Cloudify's User Interface{%endsummary%}.

When clicking on the `Blueprints` tab and choosing a blueprint you will be able to choose one of the following:

# Topology
See the definition [here]({{page.terminology_link}}#topology).<br/>
![Blueprint topology](/guide/images/ui/ui-blueprint-topology.png)

# Network
A map of networks topology according to the blueprint topology contained internal and external networks, hosts, routers and ports.<br/>
![Blueprint networks](/guide/images/ui/ui-deployment-networks.jpg)

# Nodes
A list of nodes according to the blueprint topology.<br/>
![Blueprint nodes](/guide/images/ui/ui-deployment-nodes.jpg)

# Source
Displays highlight blueprint source code, Python plugins and other text files includes in your blueprint package.<br/>
![Blueprint source code](/guide/images/ui/ui-blueprint-sourcecode.jpg)
