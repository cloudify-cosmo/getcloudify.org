---
layout: bt_wiki
title: The Logs & Events Page
category: Web Interface
publish: true
abstract: Logs & Events Page Reference
pageord: 140

terminology_link: reference-terminology.html
---
{%summary%}This is a view of all events in Cloudify's User Interface{%endsummary%}.

# Overview
When clicking on the `Logs & Events` tab, you will be able to view the last 50 events aggregated from all `Blueprints` and `Deployments`:<br/>
![Logs&EventsPage]({{ site.baseurl }}/guide/images/ui/ui-logsNevents-overview.png)


You can control which events are displayed by filtering by:

# Blueprints
See the definition [here]({{page.terminology_link}}#blueprint).<br/>
![Blueprints]({{ site.baseurl }}/guide/images/ui/ui-logsNevents-blueprint-selection.png)

# Deployments
See the definition [here]({{page.terminology_link}}#deployment).<br/>
This list is affected by the selection of blueprints. <br/>
If the blueprints selection consists only of undeployed blueprints, this dropdown will not be visible.<br/>
Likewise, it will not include a deployment if the blueprint it is based on wasn't selected.<br/>
Not selecting any deployments is equivalent to selecting all deployments in the list.<br/>
![Deployments]({{ site.baseurl }}/guide/images/ui/ui-logsNevents-deployment-selection.png)

# Timeframe
A list of timeframes. This selection will affect how far back in history the events will be shown.<br/>
You can choose a timeframe as short as 5 minutes or as long as 5 days, with increments in between in the minute, hour and day range.<br/>
![Timeframe]({{ site.baseurl }}/guide/images/ui/ui-logsNevents-timeframe-selection.png)

# Applying the filter
This page is not filtered live. You should click on the `Show` button to apply the filter.<br/>
![Show]({{ site.baseurl }}/guide/images/ui/ui-logsNevents-show.png)

