---
layout: bt_wiki
title: Getting Started
category: none
publish: false
abstract: How to get started
pageord: 200

openstack_blueprint_file_link: https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-example/3.1/openstack-blueprint.yaml
softlayer_blueprint_file_link: https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-example/master/softlayer-blueprint.yaml
aws_ec2_blueprint_file_link: https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-example/master/aws-ec2-blueprint.yaml
vcloud_blueprint_file_link: https://raw.githubusercontent.com/achirko/cloudify-nodecellar-example/vcloud-plugin/vcloud-blueprint.yaml
terminology_link: reference-terminology.html
workflows_link: reference-builtin-workflows.html

---

{%summary%}{{page.abstract}}{%endsummary%}

{%tip title=Try Instantly%}
You can take Cloudify for an instant test drive with an [online trial.](http://getcloudify.org/widget.html)
{%endtip%}


# Overview

Cloudify is mainly comprised of three main entities:

* A Command-Line Interface (The client)
* A Management Environment (The brain)
* Agent(s) (The workers)

This Getting Started section will walk you through bootstrapping a Cloudify Management Environment in an IaaS environment using Cloudify's CLI and installing a sample Cloudify blueprint on it. Agents will be installed on the provisioned machines.

You can choose to bootstrap on one of the following IaaS providers:

  - [OpenStack](plugin-openstack.html)
  - [Softlayer](plugin-softlayer.html)
  - [AWS EC2](plugin-aws.html)
  - [vCloud](plugin-vsphere.html)

The blueprint you'll be deploying describes a nodejs application that connects to a MongoDB database and presents a wine catalog.

  - [OpenStack nodecellar blueprint]({{page.openstack_blueprint_file_link}})
  - [SoftLayer nodecellar blueprint]({{page.softlayer_blueprint_file_link}})
  - [AWS EC2 nodecellar blueprint]({{page.aws_ec2_blueprint_file_link}})
  - [vCloud nodecellar blueprint]({{page.vcloud_blueprint_file_link}})

To learn more about blueprint syntax and elements please refer to the [DSL Specification](dsl-spec-general.html).

# Before You Begin

It is recommended that you try the [Demo Tutorial](quickstart.html) first to familiarize
yourself with Cloudify and its concepts.
To complete this tutorial you'll need to have a cloud environment of your choice and credentials on top of verifying that the [prerequisites for bootstrapping](getting-started-prerequisites.html) are met.

If you hadn't already installed Cloudify's CLI, now would be the time to do so.
To install the CLI follow the steps described in the [CLI Installation guide](installation.html).

The CLI allows you to upload blueprints, create deployments, and execute workflows between many other useful functions.
For more information on the CLI's functions check the [CLI Reference](cfy-reference.html).


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
- the [Softlayer Manager Reference](reference-softlayer-manager.html).
- the [AWS EC2 Reference](reference-aws-ec2-manager.html).
- the [vCloud Reference](reference-vcloud-manager.html).
