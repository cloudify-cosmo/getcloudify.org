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

The Blueprint Composer is an editor for composing the blueprint.yaml dynamically using a modern Drag and Drop Interface.
This guide will quickly walk you through the use of the Blueprint Composer.

{%tip title=Tip%}
The [Terminology Reference Page]({{page.terminology_link}}) will help you understand some of the terms stated in this guide.
For your convenience, links are supplied throughout the guide to point you to the right term definition in the terminology page.
{%endtip%}

# Blueprint Composer Components Overview

## Login

### Composer Users

Upon first use of the Blueprint Composer the user will be asked to enter a user-name.
After first login, the user will be automatically route to the Blueprint Composer UI unless a logout was performed.
Currently each user can only save one blueprint, modifying that blueprint and saving changes will overwrite that single stored blueprint.

## Composer

### Topology

The Topology page contains draggable nodes, each node represent an actual component (software/hardware/network components).

![Blueprint Composer topology](/guide/images/ui/composer/topology.png)

Each of the nodes has an editable name and may contain [properties]({{page.terminology_link}}#properties), [interfaces]({{page.terminology_link}}#interface) and [relationships]({{page.terminology_link}}#relationship-type).
The Blueprint Composer interface allows selecting only one node at a time, a selected node gets highlighted and its details displayed on a side properties pane.

![Blueprint Composer topology](/guide/images/ui/composer/sidepane.png)

### Inputs

The inputs page contains an option to add inputs to a blueprint.yaml.
The 'Name' field is mandatory and cannot be duplicated.

![Blueprint Composer inputs](/guide/images/ui/composer/inputs.png)

### Source

The source page contains the current displayed blueprint on its YAML format.
At this phase the source is readonly.
Currently the blueprint.yaml is generated with some out of the box list of plugins.

![Blueprint Composer source](/guide/images/ui/composer/source.png)

## More Actions

![Blueprint Composer source](/guide/images/ui/composer/actions-bar.png)

### Save

Clicking save will operate 2 actions:

-  Saving the displayed blueprint.yaml.
-  Running a validation check on the blueprint.yaml.

### Download

Clicking download will download the last saved blueprint.yaml.

### Validate

Clicking validate will execute a call to a DSL parser which will parse the displayed blueprint and validate that it is a valid blueprint.yaml.

### Logout

Clicking the logout button will route the user back to login page.


{%note title= Fun Exercise !%}
- Start composing a blueprint by dragging a 'Compute' node to the editor, rename the node to 'host'.
- Drag an 'Application Server' node and locate it into the 'Compute' node, rename the node to 'appSrv'.
- Drag a 'Database' node and locate it into the 'Compute' node as well, rename the node to 'DB'.
- Drag an 'Application Module' node and locate it into the 'App Server' node, rename the node to 'app'.
- Hover over the 'Database' node and pull a connector towards the 'Application Module'.
- Save the blueprint.
- Download the blueprint.yaml and use it with Cloudify!
{%endnote%}