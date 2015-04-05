---
layout: bt_wiki
title: Getting Started On A Real Cloud
category: none
publish: true
abstract: A quick tutorial for getting started with Cloudify and deploying your first blueprint
pageord: 200

openstack_blueprint_file_link: https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-example/3.1/openstack-blueprint.yaml
softlayer_blueprint_file_link: https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-example/master/softlayer-blueprint.yaml
terminology_link: reference-terminology.html
workflows_link: reference-builtin-workflows.html

---

{%summary%}{{page.abstract}}{%endsummary%}

# Overview

In this tutorial you will bootstrap a Cloudify manager on a cloud environment and install a sample Cloudify blueprint on it.

This tutorial shows how to bootstrap a Cloudify manager on:

  - [OpenStack](plugin-openstack.html)
  - [Softlayer](softlayer-openstack.html)

The blueprint you'll be deploying describes a nodejs application that connects to a MongoDB database and presents a wine catalog.

  - [openstack nodecellar blueprint]({{page.openstack_blueprint_file_link}})
  - [softlayer nodecellar blueprint]({{page.softlayer_blueprint_file_link}})

To learn more about blueprint syntax and elements please refer to the [Blueprint Authoring Guide](guide-blueprint.html).

# Before You Begin

It is recommended that you try the [Getting started guide](quickstart.html) first familiarize
yourself with Cloudify and its concepts.
Also, to complete this tutorial you'll need to have a cloud environment of yout choice and credentials.

# Step by Step Walkthrough

## Step 1: Install the Cloudify CLI

The first thing you'll need to do is install the Cloudify CLI,
which will let you upload blueprints, create deployments, and execute workflows.
To do so follow the steps described in the [CLI installation guide](installation-cli.html).

## Step 2: Download the Manager Blueprint

Next, let's create a cloudify-manager dir and download the Manager Blueprint.

{% highlight bash %}
mkdir -p ~/cloudify-manager
cd ~/cloudify-manager
git clone https://github.com/cloudify-cosmo/cloudify-manager-blueprints
{% endhighlight %}

Now let's initialize a local Cloudify working environment:

{% highlight bash %}
cfy init
{% endhighlight %}

This will create a folder named `.cloudify` to save the current context for the Cloudify CLI,
but you shouldn't care about that for now.

Now let's move on to bootstrap configuration.

{% togglecloak id=1 %}**Configuring your Manager Blueprint**{% endtogglecloak %}

{% gcloak 1 %}

{% inittab %}

{% tabcontent OpenStack %}

[HP Cloud](http://www.hpcloud.com/) is a public OpenStack cloud.
As such it provides a fairly easy starting point for experiencing a fully operational OpenStack environment.
To use HP Cloud you need to [Setup an account on the HP Helion Cloud](https://horizon.hpcloud.com/).

This blueprint defines quite a few input parameters we need to fill out.

Let's make a copy of the inputs template already provided and edit it:

{% highlight bash %}
cd cloudify-manager-blueprints/openstack
cp inputs.yaml.template inputs.yaml
{% endhighlight %}

The inputs.yaml file should look somewhat like this:

{% highlight yaml %}
keystone_username: your_openstack_username
keystone_password: your_openstack_password
keystone_tenant_name: your_openstack_tenant
keystone_url: https://region-b.geo-1.identity.hpcloudsvc.com:35357/v2.0/
region: region-b.geo-1
manager_public_key_name: manager-kp
agent_public_key_name: agent-kp
image_id: 8c096c29-a666-4b82-99c4-c77dc70cfb40
flavor_id: 102
external_network_name: Ext-Net

use_existing_manager_keypair: false
use_existing_agent_keypair: false
manager_server_name: cloudify-management-server
manager_server_user: ubuntu
manager_server_user_home: /home/ubuntu
manager_private_key_path: ~/.ssh/cloudify-manager-kp.pem
agent_private_key_path: ~/.ssh/cloudify-agent-kp.pem
agents_user: ubuntu
nova_url: ''
neutron_url: ''
resources_prefix: cloudify
{% endhighlight %}

You will, at the very least, have to provide the following:

* `keystone_username`
* `keystone_password`
* `keystone_tenant_name`

In case you are using a different openstack environment, you should also change the following values:

* `image_id`
* `flavor_id`
* `external_network_name`

to fit your specific openstack installation.

Notice that the `resources_prefix` parameter is set to "cloudify" so that all resources provisioned during
this guide are prefixed for easy identification.

{% endtabcontent %}

{% tabcontent SoftLayer %}

This blueprint defines quite a few input parameters we need to fill out.

Let's make a copy of the inputs template already provided and edit it:

{% highlight bash %}
cd cloudify-manager-blueprints/softlayer
cp inputs.yaml.template inputs.yaml
{% endhighlight %}

The inputs.yaml file should look somewhat like this:

{% highlight yaml %}
# mandatory
username: ''
api_key: ''
endpoint_url: ''
location: ''
domain: ''
ram: ''
cpu: ''
disk: ''
os: ''
ssh_keys: []
ssh_key_filename: ''

# optional
hostname: ''
image_template_global_id: ''
image_template_id: ''
private_network_only: false
port_speed: 187
private_vlan: ''
public_vlan: ''
provision_scripts: []
agents_user: root
resources_prefix: ''
{% endhighlight %}

You will, at the very least, have to provide the mandatory inputs.

{%info%}
This tutorial uses softlayer manager blueprint on Docker and it requires:

  * The `os` input should be *4668* - the item id of *Ubuntu Linux 14.04 LTS Trusty Tahr - Minimal Install (64 bit)*
  * A link to a script that installs curl must be specified (needed for the Docket installation) in the `provision_scripts` input.
	* for example: [a script that installs curl](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-softlayer-plugin/master/softlayer_plugin/scripts/postprov.sh)
	* Alternatively, create an image id of a server on SoftLayer that have curl or docker installed on it, and specify the `image_template_id` instead of the `os` input.
{%endinfo%}

For more information see the [SoftLyaer Manager Reference](reference-softlayer-manager.html).

{% endtabcontent %}

{% endinittab %}

{% endgcloak %}

## Step 3: Bootstrap the Cloudify Management Environment

Now you're ready to bootstrap your Cloudify manager.

To do so type the following command in your shell:

{% inittab %}
{% tabcontent OpenStack%}
{% highlight bash %}
cfy bootstrap --install-plugins -p openstack.yaml -i inputs.yaml
{% endhighlight %}
{% endtabcontent %}
{% tabcontent SoftLayer%}
{% highlight bash %}
cfy bootstrap --install-plugins -p softlayer.yaml -i inputs.yaml --task-retries 25
{% endhighlight %}
{% endtabcontent %}
{% endinittab %}


{%note title=Note%}
Ths *install-plugins* functionality only works if you are running from within a virtualenv.
If this is not the case, installing plugins will require sudo permissions and can be done like so:

{% inittab %}

{% tabcontent OpenStack%}
{% highlight sh %}
cfy local create-requirements -o requirements.txt -p openstack.yaml
sudo pip install -r requirements.txt
{%endhighlight%}
{% endtabcontent %}

{% tabcontent SoftLayer%}
{% highlight sh %}
cfy local create-requirements -o requirements.txt -p softlayer.yaml
sudo pip install -r requirements.txt
{%endhighlight%}
{% endtabcontent %}

{% endinittab %}

{%endnote%}


This should take a few minutes to complete (depending on how responsive your Cloud environment is).
After validating the configuration, `cfy` will create the management VM, related
networks and security groups (the latter two will not be created if they already exist),
download the relevant Cloudify manager packages and install all of the components.
At the end of this process you should see the following message:

{% highlight bash %}
bootstrapping complete
management server is up at <YOUR MANAGER IP ADDRESS>
{% endhighlight %}

To validate this installation, point your web browser to the manager IP address (port 80).
You should see Cloudify's Web UI (if you're using the commercial version).
At this point there's nothing much to see since you haven't uploaded any blueprints yet.

## Step 4: Upload the Blueprint and Create a Deployment

Next, you'll upload a sample [blueprint]({{page.terminology_link}}#blueprint) and create a [deployment]({{page.terminology_link}}#deployment) based on it.

{% highlight bash %}
cd ~/cloudify-manager
git clone https://github.com/cloudify-cosmo/cloudify-nodecellar-example.git
cd cloudify-nodecellar-example
use -t <YOUR MANAGER IP ADDRESS>
{% endhighlight %}

In the `cloudify-nodecellar-example` directory you just cloned, you can see blueprint files alongside other resources related to this blueprint.

To upload the blueprint run:

{% inittab %}

{% tabcontent OpenStack%}
{%highlight bash%}
cfy blueprints upload -b nodecellar -p openstack-blueprint.yaml​
{%endhighlight%}
{% endtabcontent %}

{% tabcontent SoftLayer%}
{%highlight bash%}
cfy blueprints upload -b nodecellar -p softlayer-blueprint.yaml​
{%endhighlight%}
{% endtabcontent %}

{% endinittab %}

The `-b` flag assigns a unique name to this blueprint on the Cloudify manager.
Before creating a deployment though, let's see what this blueprint looks like.

Point your browser at the manager's URL again and refresh the screen, you will see the nodecellar blueprint listed there.

![Blueprints table](/guide/images3/guide/quickstart/blueprints_table.png)

Click the blueprint, and you can see its topology.

A [topology]({{page.terminology_link}}#topology) consists of elements called [nodes]({{page.terminology_link}}#node).

In our case, we have the following nodes:

* Two VM's (one for mongo and one for nodejs)
* A nodejs server
* A MongoDB database
* A nodejs application called nodecellar (which is a nice sample nodejs application backed by mongodb).

![Nodecellar Blueprint](/guide/images3/guide/quickstart-openstack/nodecellar_openstack_topology.png)


{% togglecloak id=2 %}
**Define inputs for this blueprint**
{% endtogglecloak %}

{% gcloak 2 %}

{% inittab %}

{% tabcontent OpenStack%}

{%highlight yaml%}
inputs:

  image:
    description: >
      Image to be used when launching agent VM's
  flavor:
    description: >
      Flavor of the agent VM's
  agent_user:
    description: >
      User for connecting to agent VM's
{%endhighlight%}

Let's make a copy of the inputs template already provided and edit it:
{% highlight bash %}
cd cloudify-nodecellar-example/inputs/openstack.yaml.template
cp openstack.yaml.template inputs.yaml
{% endhighlight %}
The inputs.yaml file should look somewhat like this:
{%highlight yaml%}
image: 8c096c29-a666-4b82-99c4-c77dc70cfb40
flavor: 102
agent_user: ubuntu
{%endhighlight%}

{% endtabcontent %}

{% tabcontent SoftLayer%}

{% highlight yaml %}
inputs:

  location:
    description: >
      Location of the data center
      Default value is the location id of Hong kong 2
    default: 352494
  domain:
    description: The domain
    default: nodecellar.cloudify.org
  ram:
    description: >
      Item id of the ram
      Default value is the item id of 16 GB
    default: 1017
  cpu:
    description: >
      Item id of the cpu
      Default value is the item id of 4 x 2.0 GHz Cores
    default: 859
  disk:
    description: >
      Item id of the disk
      Default value is the item id of 25 GB (SAN)
    default: 1178
  os:
    description: >
      Item id of the operating system
      Default value is the item id of Ubuntu Linux 12.04
    default: 4174
{%endhighlight%}

All inputs have default values so no input file is needed.

To specify differnet values for one or more inputs, create inputs.yaml file with the wanted inputs, for example:
{% highlight bash %}
echo -e "domain: 'my_domain.org'\nlocation: '168642'" > inputs.yaml
{% endhighlight %}
The inputs.yaml file will look like this:
{% highlight yaml %}
domain: 'my_domain.org'
location: '168642'
{% endhighlight %}

{% endtabcontent %}

{% endinittab %}

{% endgcloak %}

Next, we need to create a deployment.

To do so, type the following command:

{%highlight bash%}
cfy deployments create -b nodecellar -d nodecellar --inputs inputs.yaml
{%endhighlight%}

We've now created a deployment named `nodecellar` based on a blueprint with the same name.

This deployment is not yet materialized, since we haven't issued an installation command.

If you click the "Deployments" icon in the left sidebar in the web UI, you will see that all nodes are labeled with 0/1, which means they're pending creation.

![Nodecellar Deployment](/guide/images3/guide/quickstart-openstack/nodecellar_deployment.png)

## Step 5: Install the Deployment

In Cloudify, installing a certain `deployment` is done by executing
the a [install]({{page.workflows_link}}#install) [workflow]({{page.terminology_link}}#workflow).

Type the following command in your terminal:

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

{%note title=Note%}
The blueprint we installed actually defines a custom collector for the Mongo database.
To add mongo related graphs to the dashboard, have a look at [Adding Custom Graphs](/guide/3.1/ui-monitoring.html#example---customize-your-dashboard).
{%endnote%}

## Step 6: Test Drive the Application

Once the workflow execution is complete, we can view the application endpoint by running:
{%highlight bash%}
cfy deployments outputs -d nodecellar
{%endhighlight%}
Hit that URL to see the application running.

The nodecellar application should be up on your screen.

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

Next, you can also teardown the manager if you have no use for it anymore.

This can be done by issuing the following command:

{% highlight bash %}
cfy teardown -f
{% endhighlight %}

This will terminate the manager VM and delete the resources associated with it.


# What's Next

For a more elaborate installation tutorial, please refer to

- the [Openstack Manager Reference](reference-openstack-manager.html).
- the [SoftLyaer Manager Reference](reference-softlayer-manager.html).