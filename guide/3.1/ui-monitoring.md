---
layout: bt_wiki
title: Monitoring
category: User Interface
publish: true
abstract: Monitoring guide page
pageord: 100

grafana_getting_started: http://grafana.org/docs/features/intro/
grafana_graphing: http://grafana.org/docs/features/graphing/
grafana_annotations: http://grafana.org/docs/features/annotations/
grafana_time_range_controls: http://grafana.org/docs/features/time_range/
grafana_search_features: http://grafana.org/docs/features/search/
grafana_templated_dashboards: http://grafana.org/docs/features/templated_dashboards/
grafana_playlist: http://grafana.org/docs/features/playlist/
grafana_export_and_import: http://grafana.org/docs/features/export_import/
terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Monitoring
Our monitoring system using Grafana to display dashboard with graphs which help you to track your VM's.  
You can read more on [Grafana Guide]({{page.grafana_getting_started}}).

## Grafana Feature Guides
* [Getting started]({{page.grafana_getting_started}})
* [Graphing]({{page.grafana_graphing}})
* [Annotations]({{page.grafana_annotations}})
* [Time range controls]({{page.grafana_time_range_controls}})
* [Search features]({{page.grafana_search_features}})
* [Templated Dashboards]({{page.grafana_templated_dashboards}})
* [Playlist]({{page.grafana_playlist}})
* [Export and Import]({{page.grafana_export_and_import}})

# Default Dashboard
The default dashboard comes with 6 graphs.  
You can custom your dashboard for each deployment however you wish for and save it on a JSON file or on your browser local-storage.

![The monitoring](/guide/images/ui/ui_monitoring.jpg)

### Default graphs:
* CPU Utilization - System
* CPU Utilization - User
* Physical Memory
* Disk IO
* Network IO - RX
* Network IO - TX

# Tips and shortcuts
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
