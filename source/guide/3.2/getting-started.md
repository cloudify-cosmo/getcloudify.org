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

It is recommended that you try the [Quick Tutorial](quickstart.html) first to familiarize
yourself with Cloudify and its concepts.

To complete the following section you'll need to have a cloud environment of your choice and credentials on top of verifying that the [prerequisites for bootstrapping](getting-started-prerequisites.html) are met.

If you hadn't already installed Cloudify's CLI, now would be the time to do so.
To install the CLI follow the steps described in the [CLI Installation guide](installation.html).

The CLI allows you to upload blueprints, create deployments, and execute workflows between many other useful functions.
For more information on the CLI's functions check the [CLI Reference](cfy-reference.html).


# Getting Started with Cloudify

Cloudify is mainly comprised of three main entities:

* A Command-Line Interface (The client)
* A Manager (The brain)
* Agent(s) (The workers)

This Getting Started section will walk you through bootstrapping a Cloudify Manager in an IaaS environment using Cloudify's CLI and installing a sample Cloudify blueprint on it. Agents will be installed on the provisioned machines.
Once everything up and and runnning, you will also be able to teardown the entire thing.

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
