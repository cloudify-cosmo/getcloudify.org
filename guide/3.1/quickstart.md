---
layout: bt_wiki
title: Getting Started
category: none
publish: true
abstract: A quick tutorial for getting started with Cloudify and deploying your first blueprint
pageord: 100

quickstart_openstack_link: quickstart-openstack.html
blueprint_file_link: https://github.com/cloudify-cosmo/cloudify-nodecellar-singlehost/blob/master/blueprint.yaml
virtualbox_link: https://www.virtualbox.org/
vagrant_link: http://www.vagrantup.com
vagrant_file_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_6/Vagrantfile
vagrant_box_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_6/cloudify_3.0.0_virtualbox.box
terminology_link: reference-terminology.html
workflows_link: reference-builtin-workflows.html
blueprint_guide_link: guide-blueprint.html
installation_general_link: installation-general.html
---
{%summary%}{{page.abstract}}{%endsummary%}

# What is Cloudify?

Cloudify is a Cloud Application Orchestrator. It automates any process you need to perform with regard to your applications over any cloud.
Cloudify provides:

* Infrastructure Setup
* Application Installation
* Application Upgrades
* Infrastructure Upgrades
* Continuous Deployments
* Auto-healing
* Auto-scaling
* Cloudify can work on any environment: IaaS, virtualized or even non-virtualized.
* Cloudify executes automation processes using any tool you choose. From shell to Chef, Puppet, etc.
* Cloudify monitors your application with any monitoring tool you choose; installing it for you if you like and interfacing with your monitoring tools to get events and metrics into Cloudify’s Policy Engine.

# Overview

In this tutorial you will start a Cloudify manager within a Vagrant box on your laptop, and install a sample Cloudify 3.0 blueprint on it.

Unlike a real cloud deployment, this example will install the application's components on a Vagrant VM. If you'd like to install an `application`([?]({{page.terminology_link}}#application)) on an actual cloud, please refer to the [deploying your first application on OpenStack]({{page.quickstart_openstack_link}}) guide.

The [blueprint]({{page.blueprint_file_link}}) you'll be deploying, describes a nodejs application that connects to a MongoDB database and presents a wine catalog. To learn more about blueprint syntax and elements please refer to the [Blueprints Guide]({{blueprint_guide_link}}).

{%tip title=Tip%}
The [Terminology Reference Page]({{page.terminology_link}}) will help you understand some of the terms stated in this guide. For your convenience, links are supplied throughout the guide to point you to the right term definition in the terminology page.
{%endtip%}

# Before You Begin

We'll need to have the following setup in your environment:

* [Oracle VirtualBox]({{page.virtualbox_link}}) (this box has been tested with version 4.3 or higher, but earlier versions should work as well).
* [Vagrant]({{page.vagrant_link}}) (1.5+)
* At least 2GB of free RAM

{%note title=Notes for Windows users%}
* Do not run the command prompt as Administrator (privilege escalation).
* Hyper-V & Virtualbox [don't play nice together](https://docs.vagrantup.com/v2/hyperv/index.html). Disabling Hyper-V is
possible by running `bcdedit /set hypervisorlaunchtype off` command (reboot is needed).
{%endnote%}

# Step by Step Walkthrough

## Step 1: Download and "Up" your Vagrant Box

The first thing you'll need to do is download the Vagrant box which contains the Cloudify manager and CLI and the Vagrantfile to run it.

First, download this [Vagrantfile]({{page.vagrant_file_link}}) to your local directory. Then, run

{% highlight bash%}
vagrant box add {{page.vagrant_box_link}} --name=cloudify
{% endhighlight %}

which will add the vagrant box to your local machine.

Note that this downloads a full featured Ubuntu OS with Cloudify and its components installed so this may take some time to add.

After the box is added, run (from the same directory the Vagrantfile is in):

{%highlight bash%}
vagrant up
{%endhighlight%}

Once the cloudify box is up you can access the manager web console through your local browser by pointing the browser to http://11.0.0.7/.


## Step 2: SSH to the Vagrant Box and Connect to the Running Manager

To connect to the newly Up'd box, type:

{%highlight bash%}
vagrant ssh
{%endhighlight%}

after which Cloudify's CLI will be at your disposal.

## Step 3: Download the blueprint

Now you'll have to clone a sample blueprint repo. (Git is already supplied with the machine so there's no need to install it.)

{%highlight bash%}
cd ~/simple/blueprints
git clone https://github.com/cloudify-cosmo/cloudify-nodecellar-singlehost.git
cd cloudify-nodecellar-singlehost/
git checkout tags/3.0
{%endhighlight%}

## Step 4: Upload the Blueprint and Create a Deployment

Next, you'll upload a sample `blueprint`([?]({{page.terminology_link}}#blueprint)) and create a `deployment`([?]({{page.terminology_link}}#deployment)) based on it.

In the `cloudify-nodecellar-singlehost` directory you just cloned, you can see a blueprint file (named `blueprint.yaml`) alongside other resources related to this blueprint.

To upload the blueprint run:

{%highlight bash%}
cd ~/simple
cfy blueprints upload -b nodecellar1 blueprints/cloudify-nodecellar-singlehost/blueprint.yaml
{%endhighlight%}

The `-b` flag is the unique name we've assigned to this blueprint on the Cloudify manager. Before creating a deployment though, let's see what this blueprint looks like. Point your browser at the manager's URL again and refresh the screen. You will see the nodecellar blueprint listed there.

![Blueprints table](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/blueprints_table.png)

Click the blueprint, and you can see its topology. A `topology`([?]({{page.terminology_link}}#topology)) consists of elements called `nodes`([?]({{page.terminology_link}}#node)).

In our case, we have the following nodes:

* A Network
* A Subnet
* A Security Group
* Two VM's
* A nodejs server
* A MongoDB instance
* A nodejs application called nodecellar (which is a nice sample nodejs application backed by mongodb).

![Nodecellar Blueprint](/guide/images3/guide/nodecellar_topology.png)

Next, we need to create a deployment. To do so, type the following command:

{%highlight bash%}
cfy deployments create -b nodecellar1 -d nodecellar1
{%endhighlight%}

We've now created a deployment named `nodecellar1` based on a blueprint with the same name. This deployment is not yet materialized, since we haven't issued an installation command. If you click the "Deployments" icon in the left sidebar in the web UI, you will see that all nodes are labeled with 0/1, which means they're pending creation.

## Step 5: Install the Deployment

In Cloudify, everything that is executed in a context of a certain `deployment` is done via a `workflow`([?]({{page.terminology_link}}#workflow)).
To trigger the `install`([?]({{page.workflows_link}}#install)) workflow, type the following command in your terminal:

{%highlight bash%}
cfy deployments execute -d nodecellar1 install
{%endhighlight%}

This will take a couple of minutes, during which the resources will be created and configured.

To track the progress of the installation, you can look at the events emitted to the terminal window. Each `event`([?]({{page.terminology_link}}#event)) is labeled with its time, the deployment name and the node in our topology that it relates to, e.g.

{% highlight bash %}
2014-07-21T15:37:31 CFY <nodecellar1> [mongod_vm_41765] Starting node
{% endhighlight %}

In the Web UI, you can checkout the Logs/Events page for an overview of all Logs and Events in a specific Manager. Alternatively, open up a specific deployment and a sidebar containing events and logs for the corresponding deployment will be shown.

![Events](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/events.png)

## Step 6: Test Drive the Application

To test the application, you will need to access it using its public IP address. Go to http://11.0.0.7:8080 to access it from your web browser. The marvelous nodecellar application should be up on your screen. Click the "Browse wines" button to verify that the application was installed suceesfully and can access the mongodb database to read the list of wines.

![Nodecellar](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/nodecellar.png)

## Step 7: Uninstall the Deployment

Uninstalling the deployment is just a matter of running another workflow, which will teardown all the resources provisionined by the `install` workflow. To run the `uninstall`([?]({{page.workflows_link}}#uninstall)) workflow, type the following command:

{%highlight bash%}
cfy deployments execute -d nodecellar1 uninstall
{%endhighlight%}

Similarly to the `install` workflow, you can track the progress of the uninstall process in the CLI or the web UI using the events that are displayed in both. Once the workflow is completed, you can verify that the resources were indeed destroyed.

In a real cloud deployment, each and every resource provisioned by the deployment will be destroyed. In our case, there aren't any external resources, only application related ones.

## Step 8: Delete the Deployment

The next step is deleting the deployment. assuming the uninstallation went fine, all of the application resources should have been removed. However, the deployment itself still has record on the manager. For example, all of its static and runtime properties are still stored in the manager's database. To clean up all the information related to the deployment on the manager, delete the deploymet as follows:

{%highlight bash%}
cfy deployments delete -d nodecellar1
{%endhighlight%}

## Step 9: Teardown the Manager

Next, you can teardown the manager if you have no use for it. This can be done by issuing the following command:

{%highlight bash%}
cfy teardown -f --ignore-deployments
{%endhighlight%}

In a real cloud deployment, this will terminate the Manager VM and delete the resources associated with it. In our case, since the manager is installed on the same machine the CLI is installed on, it will not teardown the machine.

Once you're done, you can exit the ssh session.

If you want to destroy the machine, run:

{%highlight bash%}
vagrant destroy -f
{%endhighlight%}

If you want to start the same machine again, just "Up" it.
If you want to completely remove the box from your machine, run:

{%highlight bash%}
vagrant box remove cloudify
{%endhighlight%}

# What's Next

* Understand the requirements for bootstrapping your very own Cloudify Manager by reading [this]({{page.installation_general_link}}).
* Try to install the same application on OpenStack by following the [OpenStack Tutorial]({{page.quickstart_openstack_link}}).
* Learn more about blueprints by following the [Blueprints Tutorial]({{page.blueprint_guide_link}}).
