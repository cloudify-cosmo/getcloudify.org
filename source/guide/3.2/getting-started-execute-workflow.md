---
layout: bt_wiki
title: Executing Workflows
category: Getting Started
publish: true
abstract: Executing Cloudify Workflows (and more specifically, the Install and Uninstall Workflows)
pageord: 500

terminology_link: reference-terminology.html
workflows_link: workflows-built-in.html
---
{%summary%} {{page.abstract}}{%endsummary%}


# Overview

Once a [Deployment is created](getting-started-create-deployment.html), we must execute a process that will perform the application's actual manifestation in your chosen environment.
This process is called a [Workflow]({{page.terminology_link}}#workflow).

A [Workflow]({{page.terminology_link}}#workflow) is Python code which describes the flow of performing different actions on your deployment.

The first workflow a user will stumble upon is called the [Install Workflow]({{page.workflows_link}}#install) and is the default workflow provided by Cloudify for deploying your application.

A user can create workflows for different types of actions such as deploying code, changing infrastructure state and even for overriding the default Install Workflow.


## Executing a Workflow via the CLI

To execute a workflow using Cloudify's CLI execute:

{%highlight bash%}
cfy executions start -w <WORKFLOW_NAME> -d <DEPLOYMENT_NAME>
{%endhighlight%}


## Executing a Workflow via the Web UI

When executing a `Workflow` for a `Deployment` (e.g. the `install` workflow), the topology nodes show badges that reflect the workflow execution state.

## Badges
See the `Topology` terminology definition [here]({{page.terminology_topology}}).<br/>

* Install state - The workflow execution is in progress for this node
* Done state - The workflow execution was completed successfully for this node
* Alerts state - The workflow execution was partially completed for this node
* Failed state - The workflow execution failed for this node

![Deployment Topology Node Badges](/guide/images/ui/ui-deployment-topology-badges.png)

## Workflow states represented by badges
A deployment before any workflow was executed
![Deployment Topology](/guide/images/ui/ui-deployment-topology-1.png)

A deployment with a workflow execution in progress
![Deployment Topology Execution In Progress](/guide/images/ui/ui-deployment-topology-2.png)

A deployment with a workflow execution in progress, partially completed
![Deployment Topology Execution Partially Completed](/guide/images/ui/ui-deployment-topology-3.png)

A deployment with a workflow execution completed successfully
![Deployment Topology Execution Completed Successfully](/guide/images/ui/ui-deployment-topology-4.png)

A deployment with a workflow execution partially completed successfully with some alerts
![Deployment Topology Execution Completed Partially Alerts](/guide/images/ui/ui-deployment-topology-5.png)

A deployment with a workflow execution that partially failed
![Deployment Topology Execution Completed Partially Errors](/guide/images/ui/ui-deployment-topology-6.png)

A deployment with a workflow execution that failed
![Deployment Topology Execution Completed Errors](/guide/images/ui/ui-deployment-topology-7.png)


# Actionable: Install the Application

We'll now execute the Install Workflow from our [Nodecellar deployment](getting-started-create-deployment.html#actionable-create-a-deployment):

Type the following command in your terminal:

{%highlight bash%}
cfy executions start -w install -d nodecellar
{%endhighlight%}

This will take some time (depending on the IaaS provider), during which the resources will be created and configured.

To track the progress of the installation, you can look at the events emitted to the terminal window.

Each [event]({{page.terminology_link}}#event) is labeled with its time,
the deployment name and the node in our topology that it relates to, e.g.

{% highlight bash %}
2014-12-02T09:46:05 CFY <nodecellar> [nodejs_d36c8] Creating node
{% endhighlight %}

In the Web UI, you can checkout the Logs/Events page for an overview of all Logs and Events in a specific Manager.

![Events](/guide/images3/guide/quickstart-openstack/events.png)

<br>

You can also have a look at the Monitoring tab and see some default metrics once the application has been installed:

![Metrics](/guide/images3/guide/default_dashboard.png)

{%note title=Note%}
The blueprint we installed actually defines a custom collector for the Mongo database.
To add mongo related graphs to the dashboard, have a look at [Adding Custom Graphs](/guide/3.1/ui-monitoring.html#example---customize-your-dashboard).
{%endnote%}

# Actionable: Test Drive the application

Once the workflow execution is complete, we can view the application endpoint by running:
{%highlight bash%}
cfy deployments outputs -d nodecellar
{%endhighlight%}
Hit that URL to see the application running.

The nodecellar application should be up on your screen.

Click the "Browse wines" button to verify that the application was installed successfully
and can access the mongodb database to read the list of wines.

![Nodecellar](/guide/images3/guide/quickstart-openstack/nodecellar.png)

# Actionable: Uninstall the application

Uninstalling the deployment is just a matter of running another workflow, which will teardown all the resources provisioned by the `install` workflow.
To run the [uninstall]({{page.workflows_link}}#uninstall) workflow, type the following command:

{%highlight bash%}
cfy executions start -w uninstall -d nodecellar
{%endhighlight%}

Similarly to the `install` workflow, you can track the progress of the
uninstall process in the CLI or the web UI using the events that are displayed in both.
Once the workflow is completed, you can verify that the resources were indeed destroyed.

# What's Next

Now that the uninstallation process is complete, you can [delete the deployment](getting-started-delete-deployment.html).
