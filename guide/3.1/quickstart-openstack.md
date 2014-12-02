---
layout: bt_wiki
title: Getting Started with OpenStack
category: none
publish: true
abstract: A quick tutorial for getting started with Cloudify and deploying your first blueprint on OpenStack
pageord: 200

reference_openstack_manager_link: reference-openstack-manager.html
---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

In this tutorial you will bootstrap a Cloudify manager in your OpenStack environment and install a sample Cloudify blueprint on it.
The [blueprint](https://github.com/cloudify-cosmo/cloudify-nodecellar-example/blob/master/openstack-blueprint.yaml) describes a nodejs application that connects to a MongoDB database and presents a wine catalog. To learn more about blueprint syntax and elements please refer to the [Blueprints Tutorial](guide-blueprint.html).

# Before You Begin

It is recommended that you try the [standalone tutorial](quickstart.html) first to get yourself familiar with Cloudify and its concepts. Also, to complete this tutorial you'll need to have an OpenStack cloud environment and credentials.

# Step by Step Walkthrough

## Step 1: Install the Cloudify CLI

The first thing you'll need to do is install the Cloudify CLI, which will let you upload blueprints, create deployments from them and execute workflows on these deployments.
To do so follow the steps described in the [CLI installation guide](installation-cli.html).

The easiest way to install cloudify would be to create a [virtualenv](http://virtualenv.readthedocs.org/en/latest/):

{% highlight bash %}
pip install virtualenv # might require sudo
virtualenv cloudify
source cloudify/bin/activate
{% endhighlight %}

and then install Cloudify using [pip]():

{% highlight bash %}
pip install cloudify
{% endhighlight %}

## Step 2: Download the Manager Blueprint for OpenStack

Next, let's create a cloudify dir and download the OpenStack Manager Blueprint.

{% highlight bash %}
mkdir -p ~/cloudify
cd ~/cloudify
git clone https://github.com/cloudify-cosmo/cloudify-manager-blueprints
{% endhighlight %}

{% highlight bash %}
cfy init
{% endhighlight %}

This will initialize a local Cloudify environment in the current directory (by creating a folder named `.cloudify` to save the current context for the Cloudify CLI, but you shouldn't care about that for now).

Now let's move on to bootstrap configuration.

### Configuring your Manager Blueprint for HP OpenStack

[HP Cloud](http://www.hpcloud.com/) is a public OpenStack cloud. As such it provides a fairly easy starting point for experiencing a fully operational OpenStack environment.
To use HP Cloud you need to [setup an account on the HP Helion Cloud](https://horizon.hpcloud.com/).

The inputs.json file allows us to provide inputs to a blueprint from outside the yaml file.
In this instance, we need to configure our OpenStack environment's configuration for the manager blueprint to know where and how to bootstrap Cloudify.

The inputs.json file for the OpenStack Manager Blueprint looks somewhat like this:

{% highlight json %}

{
    "keystone_username": "",
    "keystone_password": "",
    "keystone_tenant_name": "",
    "keystone_url": "",
    "region": "",
    "manager_public_key_name": "",
    "agent_public_key_name": "",
    "image_id": "",
    "flavor_id": "",
    "external_network_name": "",

    "use_existing_manager_keypair": false,
    "use_existing_agent_keypair": false,
    "manager_server_name": "cloudify-management-server",
    "manager_server_user": "ubuntu",
    "manager_server_user_home": "/home/ubuntu",
    "manager_private_key_path": "~/.ssh/cloudify-manager-kp.pem",
    "agent_private_key_path": "~/.ssh/cloudify-agent-kp.pem",
    "agents_user": "ubuntu",
    "nova_url": "",
    "neutron_url": "",
    "resources_prefix": ""
}

{% endhighlight %}

You can find information on how to setup the HP authentiation URL [here](https://docs.hpcloud.com/api/v13/identity/#2.Account-levelView).

You can choose the follwoing `auth_url` value to connect to HP Cloud's east region authentication service.

{% highlight yaml %}

   auth_url: "https://region-b.geo-1.identity.hpcloudsvc.com:35357/v2.0/"

{% endhighlight %}

You will also need to set the region and image id elements under the compute section.
The region value can be US-West (region-a.geo-1) or US-East (region-b.geo-1). You can use the HP image commands to list to possible options for image IDs. In our case we use image id `75d47d10-fef8-473b-9dd1-fe2f7649cb41` which is an Ubuntu Server 12.04 LTS (amd64 20140606) image.

{% highlight yaml %}

    region: region-b.geo-1
    image: 75d47d10-fef8-473b-9dd1-fe2f7649cb41

{% endhighlight %}

If your running multiple users under the same tenant you may need to add prefix to each resource in the default configuration file.

{% highlight yaml %}

    #cloudify:
    #  # You would probably want a prefix that ends with underscore or dash
        resources_prefix: <user specific prefix>

{% endhighlight %}


## Step 3: Boostrap the Cloudify Management Environment
Now you're ready to bootstrap your Cloudify manager. To do so type the following command in your shell:

{% highlight bash %}
cfy bootstrap -v -p cloudify-manager-blueprints/simple/simple.yaml -i inputs.json --install-plugins
{% endhighlight %}

This should take a few minutes to complete. After validating the configuration, `cfy` will list all of the resources created, create the management VM and related networks and security groups (the latter two will not be created if they already exist), download the relevant Cloudify manager packages from the internet and install all of the components. At the end of this process you should see the following message:

{% highlight bash %}
bootstrapping complete
management server is up at <YOUR MANAGER IP ADDRESS> (is now set as the default management server)
{% endhighlight %}

To validate this installation, point your web browser to the manager IP address (port 80). You should see the Cloudify web UI. At this point there's nothing much to see since you haven't uploaded any blueprints yet.


## Step 4: Upload the Blueprint and Create a Deployment

Next, we'll upload the sample blueprint and create a deployment based on it. You will first need to clone this repository into your local file system. To do so type the following command:

{% highlight bash %}
git clone https://github.com/cloudify-cosmo/cloudify-nodecellar-example
cd cloudify-nodecellar-example/
git checkout tags/3.1
{% endhighlight %}

This will create a directory called `cloudify-nodecellar-example` in your current directory. You can see the blueprint file (named `openstack-blueprint.yaml`) alongside other resources related to this blueprint.
To upload the blueprint, type the following command:

{%highlight bash%}
cfy blueprints upload -b nodecellar1 -p openstack-blueprint.yaml​
{%endhighlight%}

The `-b` parameter is the unique name we've given to this blueprint on the Cloudify manager. A blueprint is a template of an application stack. Blueprints cannot be materialized on their own. For that you will need to create a deployment, which is essentially an instance of this blueprint (kind of like what an instance is to a class in an OO model). But first let's go back to the web UI and see what this blueprint looks like. Point your browser to the manager URL again, and refresh the screen. You will see the nodecellar blueprint listed there.

![Blueprints table](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/blueprints_table.png)

Click the row with the blueprint. You will now see the topology of this blueprint. A topology consists of elements called nodes. In our case, we have the following nodes: a network, a subnet, a security group, two VMs, a nodejs server, a mongodb server, and a nodejs application called nodecellar (which is a nice sample nodejs application backed by mongodb).

![Nodecellar Blueprint](/guide/images3/guide/nodecellar_topology.png)

Next, we need to create a deployment so we can create this topology in our OpenStack cloud.
Before creating the deployment itself, we'll have to fill in the inputs.json.template found in the blueprint's folder.

FILL IN HERE!!!

Now that the inputs file is ready, we can create the deployment:

{%highlight bash%}
cfy deployments create -b nodecellar1 -d nodecellar1 --inputs inputs.json
{%endhighlight%}

With this command we've created a deployment named `nodecellar1` from a blueprint with the same name. This deployment is not yet materialized, since we haven't issued any command to install it. If you click the "Deployments" icon in the left sidebar in the web UI, you will see that all nodes are labeled with 0/1, which means they weren't yet created.

## Step 5: Install the Deployment

In Cloudify, every thing that is executed for a certain deployment is done in the context of a workflow. A workflow is essentially a set of steps, executed by Cloudify agents (which are basically [Celery](http://www.celeryproject.org/) workers). So whenever a workflow is triggered, it sends a set of tasks to the Cloudify agents, which then execute them and report back the results. For example, the `install` workflows which we're going to trigger, will send tasks to create the various OpenStack resources, and then install and start the application components on them. By default, the Cloudify manager will create one agent per deployment, on the management VM. When application VMs are created by the default `install` workflow (in our case there's two of them), this workflow also installs an agent on each of these VMs, and subsequent tasks to configure these VMs and install application componets are executed by these agents.
To trigger the `install` workflow, type the following command in your terminal:

{%highlight bash%}
cfy executions start -d nodecellar1 -w install
{%endhighlight%}

These will take a couple of minutes, during which the OpenStack resources and VM's will be created and configured. To track the progress of the installation, you can look at the events emitted to the terminal window. Each event is labeled with its time, the deployment name and the node in our topology that it relates to, e.g.

{% highlight bash %}
2014-07-21T15:37:31 CFY <nodecellar1> [mongod_vm_41765] Starting node
{% endhighlight %}

You can also view the events in the deployment screen in the web UI.

![Events](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/events.png)

## Step 7: Test Drive the Application

To test the application, you will need to access it using its public IP address. Locate the VM that runs the nodejs server in your OpenStack dashboard, and use port 8080 to access it from your web browser. You should see the nodecellar application. Click the "Browse wines" button to verify that the application was installed suceesfully and can access the mongodb database to read the list of wines.

![Nodecellar](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/nodecellar.png)

## Step 8: Uninstall the Deployment

Uninstalling the deployment is just a matter of running another workflow, which will teardown all the resources that were provisionined by the `install` workflow. To run the uninstallation workflow, type the following command:

{% highlight bash %}
cfy executions start -d nodecellar1 -w uninstall
{% endhighlight %}

Similarly to the `install` workflow, you can track the progress of the uninstallation in the CLI or the web UI using the events that are displayed in both. Once the workflow completes, you can verify that the VMs were indeed destroyed and the other application related resources have also been removed.

## Step 9: Delete the Deployment

The next step is deleting the deployment. Assuming the uninstallation went fine, all of the application resources should have been removed. However, the deployment itself is still recorded on the manager. For example, all of its static and runtime properties are still stored in the manager's database. To clean up all the information related to the deployment on the manager, delete the deploymet as follows:

{%highlight bash%}
cfy deployments delete -d nodecellar1
{%endhighlight%}


## Step 10: Teardown the Manager

Next, you can also teardown the manager if you have no use for it anymore. This can be done by issuing the following command:

{% highlight bash %}
cfy teardown -f --ignore-deployments
{% endhighlight %}

This will terminate the manager VM and delete the resources associated with it.

# What's Next

For a more elaborate installation tutorial, please refer to the [Openstack Installation Guide]({{page.reference_openstack_manager_link}}).
