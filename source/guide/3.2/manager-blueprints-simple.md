---
layout: bt_wiki
title: Simple Manager Blueprint Reference
category: Manager Blueprints
publish: true
abstract: "Reference on how to bootstrap a Cloudify manager on an existing machine"
pageord: 1000
---

{%summary%} This page serves as a reference to the "simple" manager blueprint, which is used for bootstrapping Cloudify on an existing machine {%endsummary%}


# Inputs

## Required inputs

* `public_ip` The IP used to SSH into the VM.
* `private_ip` The IP that will be used by services in the manager network to connect to its services (RabbitMQ, etc...).
* `ssh_key_filename` The path to the key file used to SSH into the VM.
* `ssh_user` The username to SSH into the VM with.

## Optional inputs

* `agents_user` The default username to be used when connecting into applications' agent VMs (for agent installtion).
* `resources_prefix` Resource prefix to be attached to cloud resources' names.


# Topology

The topology consists merely of a single host, on which the Cloudify manager will be installed.


# Nodes

The "simple manager" blueprint contains the following nodes:

  - *manager_host* - The machine on which the Cloudify manager will be installed.
  - *manager* - The node which represents the manager. You may find more information about this node in the [Types Reference](#reference-types.html#cloudifymanager-type) section as well as in the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).

{%note title=Bootstap on a Vagrant VM (VirtualBox)%}
When bootstrapping a manager on a [Vagrant](https://www.vagrantup.com) based VM using the (default) VirtualBox provider, make sure to increase the memory of the VM to at least 2GB.

It should look like this:
{%highlight ruby%}
Vagrant.configure('2') do |config|
  config.vm.provider :virtualbox do |vb|
    vb.customize ['modifyvm', :id, '--memory', '2048']
  end
end
{%endhighlight%}
{%endnote%}
