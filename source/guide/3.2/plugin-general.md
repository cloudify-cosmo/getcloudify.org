---
layout: bt_wiki
title: Cloudify Plugins
category: Plugins
publish: false
abstract: "What are Cloudify Plugins"
pageord: 100

---

# Overview

While Cloudify itself provides a framework for orchestrating applications, the actual work of interacting with IaaS APIs and running scripts, Configuration Management tools, Monitoring tools and any other tools used when managing applications is done by what we call Plugins.

Much like Workflows, Plugins are Python code which provide an abstraction for using a certain tool by configuring its usage pattern within your Blueprint or for using a certain API for creating and configuring resources on a certain IaaS provider.

Let's take Cloudify's AWS Plugin for instance. The plugin allows you to configure nodes in your blueprint that will be mapped to different resources on AWS. You can declare Instances, Key-Pairs, Security Groups with rules, Elastic IPs and any other resource the plugin supports in your blueprint, and by running a workflow (namely, the Install Workflow), the resources will be created and configured (and potentially, stopped and deleted) when executing workflows.

To cover the two major types of plugins (IaaS and Management tools), let's also take the Docker plugin as an example in the context of the resources created using the AWS plugin. The Docker plugin will allow you to pull images and run containers on your provisioned instances.


# What's Next

Cloudify' Team provides a set of Official Plugins you can use. [Go check them out](plugin-official-general.html). You can also check the [Community Plugins](plugin-contrib-general.html) available which provide a different level of support.

You should also check the [Plugins Authoring Guide](guide-plugin-creation.html) if you want to write your own plugin for your chosen tool or IaaS provider.