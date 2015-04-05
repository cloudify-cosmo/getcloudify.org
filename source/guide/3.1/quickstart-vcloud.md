---
layout: bt_wiki
title: Getting Started with vCloud
category: none
publish: true
abstract: A quick tutorial for getting started with Cloudify and deploying your first blueprint on vCloud
pageord: 200

blueprint_file_link: https://raw.githubusercontent.com/achirko/cloudify-nodecellar-example/vcloud-plugin/vcloud-blueprint.yaml
reference_vcloud_manager_link: reference-vcloud-manager.html

---
{%summary%}{{page.abstract}}{%endsummary%}

{%tip title=Try Instantly%}
You can take Cloudify for an instant test drive with an [online trial](http://getcloudify.org/widget.html)
{%endtip%}

{%warning title=Disclaimer%}vCloud plugin is under development.{%endwarning%}


# Overview

In this tutorial you will bootstrap a Cloudify manager in your vCloud environment
and install a sample Cloudify blueprint on it.

The [blueprint]({{page.blueprint_file_link}}) you'll be deploying,
describes a nodejs application that connects to a MongoDB database and presents a wine catalog.
To learn more about blueprint syntax and elements please refer to the [Blueprints Guide]({{blueprint_guide_link}}).

# Before You Begin

It is recommended that you try the [Getting started](quickstart.html) first familiarize
yourself with Cloudify and its concepts.
Also, to complete this tutorial you'll need to have an vCloud cloud environment and credentials.

# Step by Step Walkthrough

## Step 1: Install the Cloudify CLI

The first thing you'll need to do is install the Cloudify CLI,
which will let you upload blueprints, create deployments, and execute workflows.
To do so follow the steps described in the [CLI installation guide](installation-cli.html).

## Step 2: Download the Manager Blueprint for vCloud

Next, let's create a cloudify-manager dir and download the vCloud Manager Blueprint.

{% highlight bash %}
git clone https://github.com/cloudify-cosmo/tosca-vcloud-plugin/tree/develop
{% endhighlight %}

Now let's initialize a local Cloudify working environment:

{% highlight bash %}
cfy init
{% endhighlight %}

This will create a folder named `.cloudify` to save the current context for the Cloudify CLI,
but you shouldn't care about that for now.

Now let's move on to bootstrap configuration.

### Configuring your Manager Blueprint

This blueprint defines quite a few input parameters we need to fill out.

Let's make a copy of the inputs template already provided and edit it:

{% highlight bash %}
cd tosca-vcloud-plugin/manager_blueprint
cp inputs.json.template inputs.json
{% endhighlight %}

The inputs.json file should look somewhat like this:

{% highlight json %}

{
    "vcloud_username": "your_vcloud_username",
    "vcloud_password": "your_vcloud_password",
    "vcloud_url": "https://vchs.vmware.com",
    "vcloud_service": "service_name",
    "vcloud_vdc": "virtual_datacenter_name",
    "manager_server_name": "your_manager",
    "manager_server_catalog": "templates_catalog",
    "manager_server_template": "template",
    "edge_gateway": "gateway_name",
    "floating_ip_public_ip": "",
    "management_network_name": "management",
    "manager_private_key_path": "~/.ssh/vcloud_template.pem",
    "agent_private_key_path": "~/.ssh/vcloud_template.pem"
}

{% endhighlight %}

## Step 3: Bootstrap the Cloudify Management Environment

Now you're ready to bootstrap your Cloudify manager.
To do so type the following command in your shell:

{% highlight bash %}
cfy bootstrap --install-plugins -p vcloud.yaml -i inputs.json
{% endhighlight %}

{%note title=Note%}

Ths *install-plugins* functionality only works if you are running from within a virtualenv.
If this is not the case, installing plugins will require sudo permissions and can be done like so:

{% highlight sh %}
cfy local create-requirements -o requirements.txt -p vcloud.yaml
sudo pip install -r requirements.txt
{%endhighlight%}

{%endnote%}


This should take a few minutes to complete.
After validating the configuration, `cfy` will create the management VM, related
networks (the latter will not be created if it's already exist) and floating ip (Edge Gateway NAT rules),
download the relevant Cloudify manager packages from the internet and install all of the components.
At the end of this process you should see the following message:

{% highlight bash %}
bootstrapping complete
management server is up at <YOUR MANAGER IP ADDRESS>
{% endhighlight %}

To validate this installation, point your web browser to the manager IP address (port 80).
You should see Cloudify's Web UI.
At this point there's nothing much to see since you haven't uploaded any blueprints yet.

## Step 4: Upload the Blueprint and Create a Deployment

Next, you'll upload a sample [blueprint]({{page.terminology_link}}#blueprint) and create a [deployment]({{page.terminology_link}}#deployment) based on it.

In the `cloudify-nodecellar-example` directory you just cloned, you can see a blueprint file (named `singlehost-blueprint.yaml`) alongside other resources related to this blueprint.

To upload the blueprint run:

{%highlight bash%}
cfy blueprints upload -b nodecellar -p vcloud-blueprint.yaml​
{%endhighlight%}

The `-b` flag assigns a unique name to this blueprint on the Cloudify manager.
Before creating a deployment though, let's see what this blueprint looks like.
Point your browser at the manager's URL again and refresh the screen. You will see the nodecellar blueprint listed there.

![Blueprints table](/guide/images3/guide/quickstart/blueprints_table.png)

Click the blueprint, and you can see its topology. A [topology]({{page.terminology_link}}#topology) consists of elements called [nodes]({{page.terminology_link}}#node).

In our case, we have the following nodes:

* Two VM's (one for mongo and one for nodejs)
* A nodejs server
* A MongoDB database
* A nodejs application called nodecellar (which is a nice sample nodejs application backed by mongodb).

![Nodecellar Blueprint](/guide/images3/guide/quickstart-openstack/nodecellar_openstack_topology.png)

Let's make a copy of the inputs template already provided and edit it:

{% highlight bash %}
cd cloudify-nodecellar-example/inputs
cp vcloud.json.template inputs.json
{% endhighlight %}

The inputs.json file should look somewhat like this:

{%highlight json%}
{
    "vcloud_username": "username",
    "vcloud_password": "password",
    "vcloud_url": "https://vchs.vmware.com",
    "vcloud_service": "service",
    "vcloud_vcd": "vdc",
    "catalog": "catalog",
    "template": "template",
    "floating_ip_gateway": "edge_gateway",
    "nodecellar_public_ip": "",
    "management_network_name": "management",
    "agent_user": "ubuntu"
}
{%endhighlight%}

Next, we need to create a deployment. To do so, type the following command:

{%highlight bash%}
cfy deployments create -b nodecellar -d nodecellar --inputs inputs.json
{%endhighlight%}

We've now created a deployment named `nodecellar` based on a blueprint with the same name. This deployment is not yet materialized, since we haven't issued an installation command. If you click the "Deployments" icon in the left sidebar in the web UI, you will see that all nodes are labeled with 0/1, which means they're pending creation.

![Nodecellar Deployment](/guide/images3/guide/quickstart-openstack/nodecellar_deployment.png)

## Step 5: Install the Deployment

In Cloudify, installing a certain `deployment` is done by executing
the a [install]({{page.workflows_link}}#install) [workflow]({{page.terminology_link}}#workflow).
type the following command in your terminal:

{%highlight bash%}
cfy executions start -w install -d nodecellar
{%endhighlight%}

This will take a couple of minutes, during which the resources will be created and configured.

To track the progress of the installation, you can look at the events emitted to the terminal window.
Each [event]({{page.terminology_link}}#event) is labeled with its time,
the deployment name and the node in our topology that it relates to, e.g.

{% highlight bash %}
2014-12-02T09:46:05 CFY <nodecellar> [nodejs_d36c8] Creating node
{% endhighlight %}

In the Web UI, you can checkout the Logs/Events page for an overview of all Logs and Events in a specific Manager.

![Events](/guide/images3/guide/quickstart-openstack/events.png)

<br>

You can also have a look at the Monitoring tab and see some default metrics:

![Metrics](/guide/images3/guide/default_dashboard.png)

## Step 6: Test Drive the Application

To test the application, you will need to access it using its public IP address.
Just go to [http://<public ip>:8080] to access it from your web browser.
The marvelous nodecellar application should be up on your screen.
Click the "Browse wines" button to verify that the application was installed successfully
and can access the mongodb database to read the list of wines.

![Nodecellar](/guide/images3/guide/quickstart-openstack/nodecellar.png)

## Step 7: Uninstall the Deployment

Uninstalling the deployment is just a matter of running another workflow,
which will teardown all the resources provisioned by the `install` workflow.
To run the [uninstall]({{page.workflows_link}}#uninstall) workflow, type the following command:

{%highlight bash%}
cfy executions start -w uninstall -d nodecellar
{%endhighlight%}

Similarly to the `install` workflow, you can track the progress of the
uninstall process in the CLI or the web UI using the events that are displayed in both.
Once the workflow is completed, you can verify that the resources were indeed destroyed.

In a real cloud deployment, each and every resource provisioned by the deployment will be destroyed.
In our case, there aren't any external resources, only application related ones.

## Step 8: Delete the Deployment

The next step is deleting the deployment.
Assuming the un-installation went fine,
all of the application resources should have been removed.
However, the deployment itself still has record on the manager.
For example, all of its static and runtime properties are still stored in the manager's database.
To clean up all the information related to the deployment on the manager, delete the deployment as follows:

{%highlight bash%}
cfy deployments delete -d nodecellar
{%endhighlight%}


## Step 10: Teardown the Manager

Next, you can also teardown the manager if you have no use for it anymore. This can be done by issuing the following command:

{% highlight bash %}
cfy teardown -f
{% endhighlight %}

This will terminate the manager VM and delete the resources associated with it.

# What's Next

For a more elaborate installation tutorial, please refer to the [vCloud Manager Guide]({{page.reference_vcloud_manager_link}}).
