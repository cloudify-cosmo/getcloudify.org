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
You can take Cloudify for an instant test drive with an [online trial](http://getcloudify.org/widget.html).
{%endtip%}


# Before You Begin

First, verify that you have met the [prerequisites for bootstrapping](getting-started-prerequisites.html).

Also, you need to have an IaaS environment (a cloud) and credentials to complete the following section.

If you hadn't already installed Cloudify's CLI, now would be the time to do so. To install the CLI, follow the steps described in the [CLI Installation guide](installation.html). The CLI allows you to upload blueprints, create deployments, and execute workflows, as well as many other useful functions. For more information on the CLI's functions check the [CLI Reference](cfy-reference.html).

Finally, it is recommended that you try the [Quick Tutorial](quickstart.html) first to familiarize
yourself with Cloudify and its concepts.

# Getting Started with Cloudify

Cloudify comprises three distinct entities:

* a command-line interface (the client)
* a manager (the brain)
* agent(s) (the workers)

This Getting Started section will walk you through bootstrapping a Cloudify Manager in the cloud of your choice using Cloudify's CLI. You will then install a sample Cloudify blueprint on it. During execution, agents will be installed on the provisioned machines.

Once everything up and and runnning, we will show you how to tear down the entire thing.

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


# What's Next

Let's start by [bootstrapping a Cloudify Manager](getting-started-bootstrapping.html).
