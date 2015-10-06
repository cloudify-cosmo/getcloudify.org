---
layout: bt_wiki
title: The Blueprint Page
category: User Interface
publish: true
abstract: Using the Blueprint Details Screen
pageord: 110

terminology_topology: http://getcloudify.org/guide/3.1/reference-terminology.html#sts=Topology
terminology_execution: http://getcloudify.org/guide/3.1/reference-terminology.html#sts=Execution
ui_monitoring: http://getcloudify.org/guide/3.1/ui-monitoring.html
terminology_link: reference-terminology.html
---
{%summary%}{{page.abstract}}{%endsummary%}

The Blueprint screen shows you the details of a single blueprint. The details are split across several tabs, each highlighting a different part of the blueprint.

# Topology
A graphical view of the blueprint [topology]({{page.terminology_topology}}).<br/>
![Blueprint topology]({{ site.baseurl }}/guide/images/ui/ui-blueprint-topology.png)

# Network
A graphical view of the network elements contained in the blueprint. Typical elements shown here are internal and external networks, hosts, routers and ports.<br/>
![Blueprint networks]({{ site.baseurl }}/guide/images/ui/ui-deployment-networks.jpg)

# Nodes
The list of nodes defined in this blueprint.<br/>
![Blueprint nodes]({{ site.baseurl }}/guide/images/ui/ui-deployment-nodes.jpg)

# Source
Displays the files contained in this blueprint. A viewer for text files is included, and syntax highlighting is available for some file types, including yaml, shell and python scripts. <br/>
![Blueprint source code]({{ site.baseurl }}/guide/images/ui/ui-blueprint-sourcecode.jpg)
