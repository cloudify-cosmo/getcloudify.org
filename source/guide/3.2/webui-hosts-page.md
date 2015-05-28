---
layout: bt_wiki
title: The Hosts Page
category: Web Interface
publish: true
abstract: Hosts Page Reference
pageord: 150

terminology_link: reference-terminology.html
---
{%summary%}This is a view of all hosts for a given deployment in Cloudify's User Interface{%endsummary%}.

# Overview
When clicking on the `Hosts` tab, you will be able to view all the hosts that are related to a `Deployment`:<br/>
![Hosts Overview](/guide/images/ui/ui-hosts-overview.png)


You can control which hosts are displayed by filtering by:

# Blueprints
See the definition [here]({{page.terminology_link}}#blueprint).<br/>
![Blueprints](/guide/images/ui/ui-hosts-blueprints-selection.png)

# Deployments
See the definition [here]({{page.terminology_link}}#deployment).<br/>
This list is affected by the selection of blueprints. <br/>
If the blueprints selection is consisted only of undeployed blueprints, this dropdown will not be visible.<br/>
Likewise, it will not include a deployment if the blueprint it is based on wasn't selected.<br/>
Not selecting any deployments is equivalent to selecting all deployments in the list.<br/>
![Deployments](/guide/images/ui/ui-hosts-deployments-selection.png)

# Applying the filter
This page is not filtered live. You should click on the `Show` button to apply the filter.<br/>
![Show](/guide/images/ui/ui-hosts-show.png)

And the filter result is displayed
![Show Results](/guide/images/ui/ui-hosts-show-results.png)

# Search hosts
This page allows live search of the hosts list.<br/>
As you type in the search box, the items in the hosts list will be updated to reflect the search criteria.<br/>
*Note, that all fields of the table are searched*
![Search](/guide/images/ui/ui-hosts-search.png)

