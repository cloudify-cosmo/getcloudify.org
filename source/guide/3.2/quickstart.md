---
layout: bt_wiki
title: A Quick Tutorial
category: none
publish: true
abstract: A quick tutorial for getting started with Cloudify and deploying your first blueprint
pageord: 200

quickstart_link: getting-started.html
blueprint_file_link: https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-example/3.2.1/singlehost-blueprint.yaml
virtualbox_link: https://www.virtualbox.org/
vagrant_link: http://www.vagrantup.com
vagrant_file_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.2.1/ga-RELEASE/Vagrantfile
terminology_link: reference-terminology.html
workflows_link: workflows-built-in.html
blueprint_guide_link: understanding-blueprints.html
installation_general_link: installation.html

---
{%summary%}{{page.abstract}}{%endsummary%}

<!--{%tip title=Try Instantly%}
You can take Cloudify for an instant test drive with an [online trial.](http://getcloudify.org/widget.html)
{%endtip%}-->

{%tip title=Tip%}
This is documentation for an older version of Cloudify. Go now to the [latest docs](http://docs.getcloudify.org/latest/intro/what-is-cloudify).
{%endtip%}

# Overview

In this tutorial you will start a Cloudify Manager within a Vagrant box on your laptop, and install a sample blueprint on it.

If you'd like to install an [application]({{page.terminology_link}}#application) on an actual cloud,
please refer to the [Cloudify Getting Started Guide]({{page.quickstart_link}}).

The [blueprint]({{page.blueprint_file_link}}) that you'll be deploying describes a nodejs application that connects to a MongoDB database and presents a wine catalog.

To learn more about blueprint syntax and elements please refer to the [Blueprints Guide]({{page.blueprint_guide_link}}).

{%tip title=Tip%}
The [Terminology Reference Page]({{page.terminology_link}}) will help you understand some of the terms stated in this guide. For your convenience, links are supplied throughout the guide to point you to the right term definition in the terminology page.
{%endtip%}

# IMPORTANT: Before You Begin

You'll need to have the following setup in your environment:

* [Oracle VirtualBox]({{page.virtualbox_link}}) (this box has been tested with version 4.3 or higher, but earlier versions should work as well).
* [Vagrant]({{page.vagrant_link}}) (Make sure that you are using version 1.5 or above!).
* At least 2GB of free RAM

{%note title=Running inside a VM%}
Your Hypervisor must support nested virtualization in order to run Virtualbox inside a VM. Unless you know you can run a VM inside a VM, please run the box from either your laptop or on a bare metal server.
{%endnote%}

{%note title=Notes for Windows users%}
* Do not run the command prompt as Administrator (privilege escalation).
* Hyper-V & Virtualbox [do not play nice together](https://docs.vagrantup.com/v2/hyperv/index.html). Disabling Hyper-V is
possible by running the `bcdedit /set hypervisorlaunchtype off` command (reboot is needed).
{%endnote%}

# Step by Step Walkthrough

## Step 1: Download Vagrantfile and run VM

The first thing you'll need to do is download the Vagrantfile that Vagrant will use to create a virtual machine with the Cloudify manager and CLI pre installed.

Download this [Vagrantfile]({{page.vagrant_file_link}}) to your local directory. Then, run this command:

{%highlight bash%}
vagrant up
{%endhighlight%}

Once the Cloudify Vagrant box is up, you can access the manager web console through your local browser by pointing the browser to [http://10.10.1.10/](http://10.10.1.10/).

## Step 2: SSH to the Vagrant Box and Connect to the Running Manager

To connect to the newly Up'd box, type:

{%highlight bash%}
vagrant ssh
{%endhighlight%}

...after which Cloudify's CLI will be at your disposal.

## Step 3: Download the blueprint

Cloudify uses [blueprints]({{page.terminology_link}}#blueprint) to describe the overall application orchestration, including the application nodes, workflows, and relationships.

You'll have to clone a sample blueprint from our Github repository from the Vagrant box.

{%highlight bash%}
cd blueprints
git clone https://github.com/cloudify-cosmo/cloudify-nodecellar-example
cd cloudify-nodecellar-example/
git checkout tags/3.2.1
{%endhighlight%}

## Step 4: Upload the Blueprint and Create a Deployment

Now, we upload a sample [blueprint]({{page.terminology_link}}#blueprint) to the Cloudify manager and create a [deployment]({{page.terminology_link}}#deployment) based on it.

In the `cloudify-nodecellar-example` directory that you just cloned, you can see a blueprint file (named `singlehost-blueprint.yaml`) alongside other resources related to this blueprint.

To upload the blueprint run:

{%highlight bash%}
cfy blueprints upload -b nodecellar -p singlehost-blueprint.yaml
{%endhighlight%}

{%note title=DNS address%}
The DNS address used by cloudify in the getting-started box is set to 8.8.8.8.
{%endnote%}

The `-b` flag specifies the unique name we've assigned to this blueprint on the Cloudify manager.
Before creating a deployment, let's see what this blueprint looks like.

Point your browser at the manager's URL again and refresh the screen. You will see the nodecellar blueprint listed there.

![Blueprints table]({{ site.baseurl }}/guide/images3/guide/quickstart/blueprints_table.png)

Click the blueprint. You can see its topology. A [topology]({{page.terminology_link}}#topology) consists of elements called [nodes]({{page.terminology_link}}#node).

In our case, we have the following nodes:

* One VM
* A nodejs server
* A MongoDB database
* A nodejs application called nodecellar (which is a nice sample nodejs application backed by mongodb).

![Nodecellar Blueprint]({{ site.baseurl }}/guide/images3/guide/quickstart/nodecellar_singlehost_topology.png)

This blueprint defines some input parameters:

![Nodecellar Inputs]({{ site.baseurl }}/guide/images3/guide/quickstart/nodecellar_singlehost_inputs.png)

The inputs values are located at ~/cloudify/blueprints/inputs/nodecellar-singlehost.yaml.

These are the values relevant for our example:

{%highlight yaml%}
agent_private_key_path: /root/.ssh/id_rsa
agent_user: vagrant
host_ip: 10.10.1.10
{%endhighlight%}

{%note title=Limitations%}
Because the Vagrant box is a self-contained example, these values cannot be changed, and are presented here only for the sake of clarity.
{%endnote%}

Now, we need to create a deployment.

In Cloudify, a [deployment]({{page.terminology_link}}#deployment) represents a virtual environment on your Cloudify manager with all of the software components needed to execute the application lifecycle described in a blueprint, based on the inputs provided in the `cfy deployments create` command.

To create a deployment, type the following command:

{%highlight bash%}
cfy deployments create -b nodecellar -d nodecellar --inputs ../inputs/nodecellar-singlehost.yaml
{%endhighlight%}

We've now created a deployment named `nodecellar` based on a blueprint with the same name.

This deployment is not yet materialized, since we haven't issued an installation command. If you click the "Deployments" icon in the left sidebar in the web UI, you will see that all nodes are labeled with 0/1, which means they're pending creation.

![Nodecellar Deployment]({{ site.baseurl }}/guide/images3/guide/quickstart/nodecellar_deployment.png)

## Step 5: Install the Deployment

In Cloudify, installing a certain `deployment` is done by executing the [install]({{page.workflows_link}}#install) [workflow]({{page.terminology_link}}#workflow).

Type the following command in your terminal:

{%highlight bash%}
cfy executions start -w install -d nodecellar
{%endhighlight%}

This will take a couple of minutes, during which the resources will be created and configured.

You can track the installation progress in the web console or in your terminal application. In your terminal, you will see that each [event]({{page.terminology_link}}#event) is labeled with its time, the deployment name, and the node in our topology that it relates to, e.g.

{% highlight bash %}
2014-12-02T09:46:05 CFY <nodecellar> [nodejs_d36c8] Creating node
{% endhighlight %}

In the Web UI, you can checkout the Logs/Events page for an overview of all logs and events in your manager.

![Events]({{ site.baseurl }}/guide/images3/guide/quickstart/events.png)

<br>

Alternatively, click on a specific deployment in the deployment tab. A list containing events and logs for the deployment will be shown.

You can also have a look at the Monitoring tab and see some default metrics:

![Metrics]({{ site.baseurl }}/guide/images3/guide/default_dashboard.png)

{%note title=Note%}
The blueprint we installed actually defines a custom collector for the Mongo database. To add mongo related graphs to the dashboard, have a look at [Adding Custom Graphs](webui-graphing-metrics.html).
{%endnote%}

## Step 6: Test Drive the Application

To test the application, you will need to access it using its public IP address. Go to [http://10.10.1.10:8080](http://10.10.1.10:8080) to access it from your web browser. The marvelous nodecellar application should be up on your screen. Click the "Browse wines" button to verify that the application was installed successfully and can access the mongodb database to read the list of wines.

![Nodecellar]({{ site.baseurl }}/guide/images3/guide/quickstart/nodecellar.png)

## Step 7: Uninstall the Deployment

Uninstalling the deployment is just a matter of running another workflow. In our nodecellar example, this will teardown all the resources provisioned by the `install` workflow.

To run the [uninstall]({{page.workflows_link}}#uninstall) workflow, type the following command:

{%highlight bash%}
cfy executions start -w uninstall -d nodecellar
{%endhighlight%}

Like with the `install` workflow, you can track the progress of the uninstall process in the CLI or the web UI using the events that are displayed in both.

Once the workflow is completed, you can verify that the resources were indeed destroyed.

In a real cloud deployment, each and every resource provisioned by the deployment will be destroyed. Since this is a single host example, there aren't any external resources, only application related ones.

## Step 8: Delete the Deployment

The next step is deleting the deployment. Assuming the uninstallation went fine, all of the application resources will have been removed.

The deployment itself still has record on the manager. All of its static and runtime properties are still stored in the manager's database. To clean up the deployment's information on the manager, delete the deployment by running this command:

{%highlight bash%}
cfy deployments delete -d nodecellar
{%endhighlight%}

## Step 9: Tear down the Manager

If you have no use for it, you can tear down the manager. This can be done by issuing the following command:

{%highlight bash%}
cfy teardown -f
{%endhighlight%}

In a real cloud deployment, this will terminate the Manager VM and delete the resources associated with it.

In our case, since the manager is installed on the same machine the CLI is installed on, it will not teardown the machine.

Once you're done, you can exit the ssh session.

If you want to destroy the machine, run:

{%highlight bash%}
vagrant destroy -f
{%endhighlight%}

If you want to start the same machine again, just "Up" it. If you want to completely remove the box from your machine, run:

{%highlight bash%}
vagrant box remove cloudify-box
{%endhighlight%}

# What's Next

* Understand the requirements for bootstrapping your very own Cloudify Manager by reading [this]({{page.installation_general_link}}).

* Try to install the same application on a real cloud provider by following the [Cloudify Getting Started Guide]({{page.quickstart_link}}).

* Learn more about blueprints by following the [Blueprints Tutorial]({{page.blueprint_guide_link}}).
