---
layout: bt_wiki
title: Deleting a Deployment
category: Getting Started
publish: true
abstract: Deleting a Cloudify Deployment
pageord: 600

terminology_topology: http://getcloudify.org/guide/3.1/reference-terminology.html#sts=Topology
---
{%summary%} {{page.abstract}}{%endsummary%}
{%summary%}This is an overview of a single blueprint topology view badge states in Cloudify's User Interface{%endsummary%}.


# Overview

After uninstalling the application you can now delete it from the Management Environment. Deleting a deployment has no functional value per se, but it does clean up the environment from excess artifacts. For example, all of its static and runtime properties are still stored in the manager's database.

# Delete the Deployment

Assuming the un-installation went fine,
all of the application resources should have been removed.



To clean up all the information related to the deployment on the manager, delete the deployment as follows:

{%highlight bash%}
cfy deployments delete -d nodecellar
{%endhighlight%}