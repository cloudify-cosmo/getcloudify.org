---
layout: bt_wiki
title: Monitoring
category: User Interface
publish: true
abstract: Monitoring guide page
pageord: 100

grafana: http://grafana.org
grafana_getting_started: http://grafana.org/docs/features/intro/
grafana_graphing: http://grafana.org/docs/features/graphing/
grafana_annotations: http://grafana.org/docs/features/annotations/
grafana_time_range_controls: http://grafana.org/docs/features/time_range/
grafana_search_features: http://grafana.org/docs/features/search/
grafana_templated_dashboards: http://grafana.org/docs/features/templated_dashboards/
grafana_playlist: http://grafana.org/docs/features/playlist/
grafana_export_and_import: http://grafana.org/docs/features/export_import/
cloudify_nodecellar_example: https://github.com/cloudify-cosmo/cloudify-nodecellar-example
terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Monitoring
The Cloudify's monitoring using [Grafana]({{page.grafana}}) dashboard to help you track your VM's.  
The monitoring can be found on each deployment page in the user interface:  
![The monitoring section button](/guide/images/ui/ui-monitoring-tab.jpg)

Once you open the monitoring section you can found a default dashboard with six graphs.  
You can also custom your dashboard however you wish for and save it on a JSON file or on your browser local-storage.

![The monitoring](/guide/images/ui/ui_monitoring.jpg)

### Default Dashboard:
The default dashboard is a set of graphs that Cloudify will initialize if dashboard is not already exist.  
the present common system metrics and our good start from which you can customize your dashboard.  
the default dashboard includes the following metrics:

* CPU Utilization - System
* CPU Utilization - User
* Physical Memory
* Disk IO
* Network IO - RX
* Network IO - TX

# Setting up your blueprint for monitoring
The Default dashboard will be filled only if the blueprint is configured to deliver data of the default metrics.  
For example of configured blueprint, go to [cloudify-nodecellar-example]({{page.cloudify_nodecellar_example}}).

# Example - Customize your dashboard
To start customize your graph, click on the panel's title and then 'Edit' to open a panel in edit mode:  
![The monitoring panel edit mode](/guide/images/ui/ui-monitoring-title-edit.jpg)

Once you in edit mode, you can edit or add new metrics under 'metrics' section:  
![The monitoring panel edit mode of metrics](/guide/images/ui/ui-monitoring-edit-metrics.jpg)

To change the title / span / height of the panel click on 'General' in edit mode:  
![The monitoring panel general edit mode](/guide/images/ui/ui-monitoring-edit-general.jpg)

To change the axes and grid of the panel click on 'Axes & Grid' in edit mode:  
![The monitoring panel edit mode of axes and grid](/guide/images/ui/ui-monitoring-edit-axes-grid.jpg)

To change colors and styles of the panel click on 'Display Styles' in edit mode:  
![The monitoring panel edit mode of styles](/guide/images/ui/ui-monitoring-edit-styles.jpg)

# Grafana Feature Guides
The [Grafana]({{page.grafana}}) guide will help you get started and acquainted with the monitoring user interface:

* [Getting started]({{page.grafana_getting_started}})
* [Graphing]({{page.grafana_graphing}})
* [Annotations]({{page.grafana_annotations}})
* [Time range controls]({{page.grafana_time_range_controls}})
* [Search features]({{page.grafana_search_features}})
* [Templated Dashboards]({{page.grafana_templated_dashboards}})
* [Playlist]({{page.grafana_playlist}})
* [Export and Import]({{page.grafana_export_and_import}})

### Tips and shortcuts (from the [Grafana]({{page.grafana}}) documentation)
* Click the graph title and in the dropdown menu quickly change span or duplicate the panel.
* Ctrl+S Saves the current dashboard
* Ctrl+F Opens the dashboard finder / search
* Ctrl+H Hides all controls (good for tv displays)
* Hit Escape to exit graph when in fullscreen or edit mode
* Click the colored icon in the legend to select series color
* Click series name in the legend to hide series
* Ctrl/Shift/Meta + Click legend name to hide other series
* Click the Save icon in the menu to save the dashboard with a new name
* Click the Save icon in the menu and then advanced to export the dashboard to json file, or set it as your default dashboard.
