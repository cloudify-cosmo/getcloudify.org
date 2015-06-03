---
layout: bt_wiki
title: Authoring Guide
category: Manager Blueprints
publish: true
abstract: "A guide to authoring Manager Blueprints"
pageord: 600
---

{%summary%}This guide explains how to create custom [manager blueprints](reference-terminology.html#manager-blueprints) or edit existing ones{%endsummary%}


{%note title=Note%}
This section is aimed at advanced users. Before reading it, make sure you have a good understanding of [Cloudify blueprints DSL](dsl-spec-general.html), the [Fabric plugin](plugin-fabric.html) and the [Cloudify Manager node type reference](reference-types.html).
{%endnote%}


# Writing a Manager Blueprint

Manager blueprints are standard Cloudify [blueprints](reference-terminology.html#blueprint), that simply use a built-in node type and task to bootstrap a Cloudify Manager.
While they are standard blueprints and may be used like any other blueprint, Manager blueprints are the only ones that can be run using the CLI's `cfy bootstrap` and `cfy teardown` command.
Which run the `install` and `uninstall` workflow respectively.

A manager blueprint consists of the following:

* A **single** node whose type is `cloudify.nodes.CloudifyManager` (which is defined in the [built-in types](reference-types.html#cloudifymanager-type)).
Note that this node represents the Cloudify Manager middleware, but not a host in which it resides.

* A task mapping of the `cloudify.interfaces.lifecycle` operations to the built-in [CLI Tasks](cli-tasks.html) using the Fabric plugin.
This task will SSH into the Manager's host and install the Cloudify Manager docker containers.
  For example, this mapping may look like this:

  {% highlight yaml %}
  node_templates:
    manager:
      type: cloudify.nodes.CloudifyManager
      ...
      interfaces:
        cloudify.interfaces.lifecycle:
          start:
            implementation: fabric.fabric_plugin.tasks.run_module_task
            inputs:
              task_mapping: cloudify_cli.bootstrap.tasks.bootstrap_docker
              task_properties:
                cloudify_packages: { get_property: [manager, cloudify_packages] }
                agent_local_key_path: { get_property: [agent_keypair, private_key_path] }
                provider_context: { get_attribute: [manager, provider_context] }
              fabric_env:
                user: { get_input: manager_server_user }
                key_filename: { get_property: [management_keypair, private_key_path] }
                host_string: { get_attribute: [manager_server_ip, floating_ip_address] }
          stop:
            implementation: fabric.fabric_plugin.tasks.run_module_task
            inputs:
              task_mapping: cloudify_cli.bootstrap.tasks.stop_manager_container
              fabric_env:
                user: { get_input: manager_server_user }
                key_filename: { get_property: [management_keypair, private_key_path] }
                host_string: { get_attribute: [manager_server_ip, floating_ip_address] }
          delete:
            implementation: fabric.fabric_plugin.tasks.run_module_task
            inputs:
              task_mapping: cloudify_cli.bootstrap.tasks.stop_docker_service
              fabric_env:
                user: { get_input: manager_server_user }
                key_filename: { get_property: [management_keypair, private_key_path] }
                host_string: { get_attribute: [manager_server_ip, floating_ip_address] }
      ...
  {%endhighlight%}


{%note title=Note%}
It is still possible to bootstrap using the old *cloudify_cli.bootstrap.tasks.bootstrap* task that installs cloudify from packages.
In this case, the only relevant mapping should be the *start* operation, and it would look like so:
  {% highlight yaml %}
  node_templates:
    manager:
      type: cloudify.nodes.CloudifyManager
      ...
      interfaces:
        cloudify.interfaces.lifecycle:
          start:
            implementation: fabric.fabric_plugin.tasks.run_module_task
            inputs:
              task_mapping: cloudify_cli.bootstrap.tasks.bootstrap
              task_properties:
                cloudify_packages: { get_property: [manager, cloudify_packages] }
                agent_local_key_path: { get_property: [agent_keypair, private_key_path] }
                provider_context: { get_attribute: [manager, provider_context] }
              fabric_env:
                user: { get_input: manager_server_user }
                key_filename: { get_property: [management_keypair, private_key_path] }
                host_string: { get_attribute: [manager_server_ip, floating_ip_address] }
      ...
  {%endhighlight%}
{%endnote%}

The bootstrap task takes several parameters which are passed via the `task_properties` input.
You can find their documentation in the [Bootstrap Docker Task API reference](cli-tasks.html#bootstrapdocker).



# Conventions

There are a few conventions for writing Manager blueprints which, while not being mandatory, are encouraged to use:

* A Manager blueprint should have a single output named `manager_ip`, with its value being the Manager's host *public* IP address.

* If a Manager blueprint has inputs, the blueprint should be provided alongside a file named `inputs.yaml.template`, which contains the required and optional inputs, where the optional inputs' default values are pre-written in the file. This allows for users of the blueprint to use it without having to even peek inside the blueprint itself.

* The bootstrap task should be mapped to the `cloudify.interfaces.lifecycle.start` operation of the *manager* node.



# Tips

* Use the [Simple Manager reference](reference-simple-manager.html) as a reference. This blueprint contains very little beyond what's completely necessary for any Manager blueprint, and thus it serves as a good example to learn from as to what a basic Manager blueprint should look like.

* In many cases, there might be a need to set up the Manager environment in one way or another before the bootstrap task is executed, e.g. uploading files to the Manager machine. This is often done by simply mapping an additional task before the bootstrap task on the *manager* node,
so for example if the bootstrap task is mapped to the *manager* node's `cloudify.interfaces.lifecycle.start` operation, the configuring task can be mapped to the `cloudify.interfaces.lifecycle.configure` operation.



# Pitfalls

* As the note in the [bootstrap task API reference](cli-tasks.html#bootstrap) mentions, the Manager's private IP is also somewhat of a parameter to the task. Avoid the potential problems mentioned there by explicitly setting the target host using the `host_string` parameter. See more information [here](plugin-fabric.html#ssh-configuration).

* In all likelyhood, you'll set the *manager* node in your Manager blueprint as a node which is contained in a [host node](reference-terminology.html#host-node). Since the default for host nodes is to get installed along with a Cloudify agent, it is important to remember to turn this off by setting the `install_agent` property of the host node to `false`.

  Setting it off is needed because a Cloudify Manager doesn't require an explicit installation of an agent on it, and in any case an attempt to do so would fail as the plugins which install the agent are likely to be missing (unless explicitly installed beforehand)

* Since the bootstrap task requires the Fabric plugin, this plugin has to be imported by the blueprint. Make sure you have it in your imports section.

* The bootstrap task, [among other things](cli-tasks.html#overview), pushes the [*provider context*](reference-terminology.html#provider-context) to the newly-formed Manager, as well as sets several runtime properties on the *manager* node instance
for the CLI to later extract data from (for configuration of the local working environment).
This means that while the bootstrap task is often the last task to take place in a Manager blueprint execution, if you do happen to map additional tasks which come after it,
make sure not to update the *provider context* any further, and be wary of overriding [existing runtime properties of the *manager* node instance](cli-tasks.html#internals).
