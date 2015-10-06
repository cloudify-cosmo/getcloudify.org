---
layout: bt_wiki
title: Ansible Plugin
category: Contributed Plugins
publish: true
abstract: Cloudify Ansible Plugin description and usage
pageord: 650
---

{%summary%}The Ansible plugin allows users to assign lifecycle operations to an a ansible playbooks. The manager agent (central deployment agent) will execute the ansible-playbook command against one or more playbooks. By default, the inventory executed against is the containing host Compute node.
{%endsummary%}

# Plugin Requirements

* Python Versions:
  * 2.7.x

# Compatibility

* Uses the Ansible Version 1.8.2

# Operations

Currently two tasks are supported:

## configure

* Required arguments: None
* Possible arguments: 
  * user # The user that you will try to log into your agents as.
  * key # The key that you would like to use to log into your agents.

This operation creates a .ansible.cfg file in the manager agent's home directory. It adds this configuration:

{% highlight yaml %}
[defaults]
host_key_checking=False
private_key_file= #agent_key_path
{%endhighlight%}

agent_key_path is either a supplied path to a key file, or it is the agent_key from the provider bootstrap context.

## ansible_playbook

* Required arguments:
  * playbooks # A list of playbooks included in your blueprint archive.
* Possible arguments: 
  * inventory # A list of hosts that you would like to run a playbook against. This defaults to a list containing the host_ip of the Compute node containing the application.

This operation runs a list of playbooks against against one or more hosts (listed in an inventory).

# Example Node Templates

This example shows a node that runs single playbook. We are trusting the plugin to correctly identify the desired target host.

{% highlight yaml %}
  my_app:
    type: cloudify.nodes.ApplicationModule
    interfaces:
      cloudify.interfaces.lifecycle:
        configure:
          implementation: ansible.ansible_plugin.tasks.configure
          inputs:
            user: ubuntu
            key: ~/.ssh/agent_key.pem
        start:
          implementation: ansible.ansible_plugin.tasks.ansible_playbook
          inputs:
            playbooks:
             - resources/playbook.yaml
{%endhighlight%}

The next example shows us explicitely stating the target hosts and running several playbooks against them.

{% highlight yaml %}
  my_app:
    type: cloudify.nodes.ApplicationModule
    interfaces:
      cloudify.interfaces.lifecycle:
        configure:
          implementation: ansible.ansible_plugin.tasks.configure
          inputs:
            user: root
            key: ~/.ssh/centos.myapp.pem
        start:
          implementation: ansible.ansible_plugin.tasks.ansible_playbook
          inputs:
            inventory:
              - node1.app.com
              - node2.app.com
              - { get_property: [ some_compute_node, ip ] }
            playbooks:
              - resources/nodejs.yaml
              - resources/app.yaml
{%endhighlight%}
