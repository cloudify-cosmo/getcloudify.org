---
layout: bt_wiki
title: Getting Started
category: none
publish: true
abstract: A quick tutorial for getting started with Cloudify and deploying your first blueprint
pageord: 11
---
{%summary%}{{page.abstract}}{%endsummary%}

# What is Cloudify?
Cloudify is a Cloud Application Orchestrator. It automates any process you need to perform with regard to your applications over any cloud. Starting with environment setup and application installation, going forward to application upgrade, infrastructure upgrade, continuous deployments, auto-healing and auto-scaling.

Cloudify can work on any environment: IaaS, virtualized or even non-virtualized. Cloudify executes automation processes using any tool you choose. From shell to Chef, Puppet, etc. Cloudify monitors your application with any monitoring tool you choose; installing it for you if you like and interfacing with your monitoring tools to get events and metrics into Cloudify’s Policy Engine.

# Overview

In this tutorial you will start a Cloudify manager within a Vagrant box on your laptop, and install a sample Cloudify 3.0 blueprint on it. Unlike a real cloud deployment, this example will use the Vagrant VM to install the application components. If you'd like to install an application on an actual cloud, please refer to the [deploying your first application on OpenStack](quickstart-openstack.html) tutorial.
The [blueprint](https://github.com/cloudify-cosmo/cloudify-nodecellar-singlehost/blob/master/blueprint.yaml) describes a nodejs application that connects to a MongoDB database and presents a wine catalog. To learn more about blueprint syntax and elements please refer to the [Blueprints Tutorial](blueprint-guide.html).

# Before You Begin

Before you can deploy this application using Cloudify, you'll need to have the following setup in your environment:

* [Oracle VirtualBox](https://www.virtualbox.org/) (this box has been tested with version 4.3 or higher, but earlier versions should work as well).
* [Vagrant](http://www.vagrantup.com) (1.5+)

# Step by Step Walkthrough  

## Step 1: Download and Up your Vagrant Box

The first thing you'll need to do is download the Vagrant box which contains the Cloudify manager and CLI and the Vagrantfile to run it.

First, download this [Vagrantfile](http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_6/Vagrantfile) to your local directory. Then, run
```
vagrant box add http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_6/cloudify_3.0.0_virtualbox.box --name=cloudify
```
which will add the vagrant box to your local machine.

Note that this downloads a full featured Ubuntu OS with Cloudify and its components installed so this may take some time to add.

After the box is added, run:
```
vagrant up
```

## Step 2: SSH to the Vagrant Box and Connect to the Running Manager

Once you've started the Vagrant box, you now have to ssh to it. In your terminal, type:
```
vagrant ssh
```

Next, you can use the Cloudify CLI to connect and interact with the manager.

## Step 3: Upload the Blueprint and Create a Deployment

Next, we'll upload the sample blueprint and create a deployment based on it.

You can find a directory called `cloudify-nodecellar-simple` under the `blueprints` folder in your current directory. cd to this directory. You can see the blueprint file (named `blueprint.yaml`) alongside other resources related to this blueprint.

To upload the blueprint type the following command:

```
cfy blueprints upload -b nodecellar1 blueprint.yaml
```

The `-b` parameter is the unique name we've given to this blueprint on the Cloudify manager. A blueprint is a template of an application stack. Blueprints cannot be materialized on their own. For that you will need to create a deployment, which is essentially an instance of the blueprint (kind of like what an instance is to a class in an OO model). But first let's go back to the web UI and see what this blueprint looks like. Point your browser to the manager URL again, and refresh the screen. You will see the nodecellar blueprint listed there.

![Blueprints table](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/blueprints_table.png)

Click the row with the blueprint. You will now see the topology of this blueprint. A topology consists of elements called nodes. In our case, we have the following nodes: a network, a subnet, a security group, two VMs, a nodejs server, a mongodb server, and a nodejs application called nodecellar (which is a nice sample nodejs application backed by mongodb).

![Nodecellar Blueprint](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/blueprint.png)

Next, we need to create a deployment so that we can create this topology in our local environment. To do so, type the following command:

```
cfy deployments create -b nodecellar1 -d nodecellar1
```

With this command we've created a deployment named `nodecellar1` from a blueprint with the same name. This deployment is not yet materialized, since we haven't issued any command to install it. If you click the "Deployments" icon in the left sidebar in the web UI, you will see that all nodes are labeled with 0/1, which means they weren't yet created.

## Step 4: Install the Deployment

In Cloudify, everything that is executed for a certain deployment is done in the context of a workflow. A workflow is essentially a set of steps, executed by Cloudify agents (which are essentially Celery workers). So whenever a workflow is triggered, it sends a set of tasks to the Cloudify agents, which then execute them and report back the results. For example, the `install` workflows which we're going to trigger, will send tasks to create the various resources, and then install and start the application components on them. By default, the Cloudify manager will create one agent per deployment, on the management VM. When application VM's are created by the default `install` workflow (in our case there are two of them), this workflow also installs an agent on each of these VM's, and subsequent tasks to configure these VM's and install application components are executed by these agents.
In our context, no VM's are created but rather the stack is installed locally.
To trigger the `install` workflow, type the following command in your terminal:

```
cfy deployments execute -d nodecellar1 install
```

These will take a couple of minutes, during which the resources will be created and configured. To track the progress of the installation, you can look at the events emitted to the terminal windows. Each event is labeled with its time, the deployment name and the node in our topology that it relates to, e.g.

```
2014-05-07T12:10:10 CFY <nodecellar1> [neutron_subnet_1100c] Creating node
```

You can also view the events in the deployment screen in the web UI.

![Events](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/events.png)

## Step 5: Test Drive the Application

To test the application, you will need to access it using its public IP address. Go to 11.0.0.7:8080 to access it from your web browser. You should see the nodecellar application. Click the "Browse wines" button to verify that the application was installed suceesfully and can access the mongodb database to read the list of wines.

![Nodecellar](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/nodecellar.png)

## Step 6: Uninstall the Deployment

Uninstalling the deployment is just a matter of running another workflow, which will teardown all the resources that were provisionined by the `install` workflow. To run the uninstallation workflow, type the following command:

```
cfy deployments execute -d nodecellar1 uninstall
```

Similarly to the `install` workflow, you can track the progress of the uninstallation in the CLI or the web UI using the events that are displayed in both. Once the workflow is completed, you can verify that the resources were indeed destroyed.
In a real cloud deployment, each and every resource provisioned by the deployment will be destroyed. In our case, there aren't any external resources, only application related ones.

## Step 7: Teardown the Manager

Next, you can also teardown the manager if you have no use for it anymore. This can be done by issuing the following command:

```
cfy teardown -f --ignore-deployments
```

In a real cloud deployment, this will terminate the manager VM and delete the resources associated with it. In our case, since the manager is installed on the same machine the CLI is installed on, it will not teardown the machine.

# What's Next

TBD
