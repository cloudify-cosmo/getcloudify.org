---
layout: bt_wiki
title: Deleting a Deployment
category: Getting Started
publish: true
abstract: Removing artifacts created during the deployment creation process
pageord: 600
---
{%summary%} {{page.abstract}}{%endsummary%}


# Overview

After uninstalling the application you can now delete it from the Management Environment. Deleting a deployment has no functional value per se, but it does clean up the environment from excess artifacts. For example, all of its static and runtime properties are still stored in the manager's database.


# Delete the Deployment

Assuming the un-installation process completely successfully, all of the application resources should have been removed.

To clean up all the information related to the deployment on the management environment, execute the following:

{%highlight bash%}
cfy deployments delete -d nodecellar
{%endhighlight%}