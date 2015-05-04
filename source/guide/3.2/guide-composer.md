---
layout: bt_wiki
title: Blueprint Composer User Guide
category: Guides
publish: true
abstract:
pageord: 800


---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

The Blueprint Composer is an editor for composing blueprint yaml files dynamically using a modern Drag and Drop Interface.
This guide will quickly walk you through the use of the Composer.

{%note title=Note%}
The [Terminology Reference Page]({{page.terminology_link}}) will help you understand some of the terms stated in this guide.
For your convenience, links are supplied throughout the guide to point you to the right term definition in the terminology page.
{%endnote%}

# Composer Components Overview

## Login

### Composer Users

Upon first use of the Blueprint Composer the user will be asked to enter a username.
After first login, the user will be automatically routed to the Composer UI unless a logout was performed.
Currently each user can only save one blueprint, modifying that blueprint and saving changes will overwrite that single stored blueprint.

## Composer

### Topology

The topology section allows you to add and remove nodes from the blueprint. Simply choose a node type on the left and drag it to the canvas on the right. This will add the node to the blueprint. To delete it, click on the node to open the properties panel and click on Delete button.

![Blueprint Composer topology](/guide/images/ui/composer/topology.png)

Each of the nodes has an editable name and may contain [properties]({{page.terminology_link}}#properties), [interfaces]({{page.terminology_link}}#interface) and [relationships]({{page.terminology_link}}#relationship-type).
The Composer interface allows selecting one node at a time, to see the node properties simply click the node and a panel will appear.

![Blueprint Composer topology](/guide/images/ui/composer/sidepane.png)

### Inputs

The inputs page contains an option to add inputs to a blueprint.yaml.
The 'Name' field is mandatory and must be unique.

![Blueprint Composer inputs](/guide/images/ui/composer/inputs.png)

### Source

The source page contains a read only presentation of the generated blueprint file.
The blueprint is generated with some out of the box list of plugins.

![Blueprint Composer source](/guide/images/ui/composer/source.png)

## More Actions

![Blueprint Composer source](/guide/images/ui/composer/actions-bar.png)

### Save

Save will trigger two actions:

-  Saving the displayed blueprint.
-  Running a validation check on the blueprint.yaml.

### Download

Downloads the last saved blueprint.yaml.

### Validate

Validates the displayed blueprint.

### Logout

Will route the user back to login page.


{%note title= Fun Exercise !%}
- Start composing a blueprint by dragging a 'Compute' node to the editor, rename the node to 'host'.
- Drag an 'Application Server' node and locate it in the 'Compute' node, rename the node to 'appSrv'.
- Drag a 'Database' node and locate it in the 'Compute' node as well, rename the node to 'DB'.
- Drag an 'Application Module' node and locate it in the 'App Server' node, rename the node to 'app'.
- Hover over the 'Database' node and pull a connector towards the 'Application Module'.
- Save the blueprint.
- Download the blueprint.yaml and use it with Cloudify!
{%endnote%}