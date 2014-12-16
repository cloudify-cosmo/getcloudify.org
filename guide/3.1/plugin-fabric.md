---
layout: bt_wiki
title: Fabric (SSH) Plugin
category: Plugins
publish: true
abstract: "Cloudify Fabric plugin description and configuration"
pageord: 300

repo_link: https://github.com/cloudify-cosmo/cloudify-fabric-plugin
yaml_link: http://www.getcloudify.org/spec/fabric-plugin/1.1/plugin.yaml
fabric_link: http://docs.fabfile.org
---

{%summary%} The [Fabric]({{page.fabric_link}}) plugin can be used to map operations to ssh commands or Fabric tasks that are included in your blueprint. {%endsummary%}
The plugin provides an agent-less method for running operations on destination hosts. The source code for this plugin can be found at [github]({{page.repo_link}}).


# Plugin Requirements:

* Python Versions:
  * 2.7.x


{%note title=Note%}
As the fabric plugin is used for remote execution, it should not make much difference if it supports a Python version other than version Cloudify's Manager is running on.
{%endnote%}


## Execution Methods

There are 3 modes for working with this plugin.

* Executing a list of `commands`.
* Executing a Fabric task from a `tasks_file` included in the blueprint's directory.
* Executing a Fabric task by specifying its path in the current python environment.

# Running commands

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

node_templates:
  example_node:
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle:
          start:
            implementation: fabric.fabric_plugin.tasks.run_commands
            inputs:
              commands:
                - echo "source ~/myfile" >> ~/.bashrc
                - apt-get install -y python-dev git
                - pip install my_module
{%endhighlight%}

Here, we use the `run_commands` plugin task and specify a list of commands to execute on the agent host.


# Running tasks

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

node_templates:
  example_node:
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle:
        start:
          implementation: fabric.fabric_plugin.tasks.run_task
          inputs:
            tasks_file: my_tasks/tasks.py
            task_name: install_nginx
            task_properties:
              important_prop1: very_important
              important_prop2: 300
{%endhighlight%}

Here, we specify the tasks file path relative to the blueprint's directory, the task's name in that file and (optional) task properties
that will be used when actually calling the task.

an example of a tasks file would be:

{% highlight python %}
#my_tasks/tasks.py
from fabric.api import run, put
from cloudify import ctx

def install_nginx(important_prop1, important_prop2):
    ctx.logger.info('Installing nginx. Some important props:'
                    ' prop1: {0}, prop2: {1}'
                    .format(important_prop1, important_prop2))
    run('sudo apt-get install nginx')


def configure_nginx(config_file_path):
    # configure the webserver to run with our premade configuration file.
    conf_file = ctx.download_resource(config_file_path)
    put(conf_file, '/etc/nginx/conf.d/')


def start_nginx(ctx):
    run('sudo service nginx restart')
{%endhighlight%}

# Running module tasks

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

node_templates:
  example_node:
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle:
        start:
          implementation: fabric.fabric_plugin.tasks.run_module_task
          inputs:
            task_mapping: some_package.some_module.install_nginx
            task_properties:
              important_prop1: very_important
              important_prop2: 300
{%endhighlight%}

This example is very similar to the previous one with the following difference. If the fabric task you want to execute is already installed in the python environment in which the operation will run, you can specify the python path to this function.

# SSH configuration
The fabric plugin will extract the correct host IP address based on the node's host. It will also use the username and key file path if they were set globally during the bootstrap process. However, it is possible to override these values and additional SSH configuration by passing `fabric_env` to operation inputs. This applies to `run_commands`, `run_task` and `run_module_task`. The `fabric_env` input is passed as is to the underlying [Fabric]({{page.fabric_link}}/en/latest/usage/env.html) library, so check their documentation for additional details.


An example that uses `fabric_env`:

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

node_templates:
  example_node:
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle:
        start:
          implementation: fabric.fabric_plugin.tasks.run_commands
          inputs:
            commands: [touch ~/my_file]
            fabric_env:
              host_string: 192.168.10.13
              user: some_username
              key_filename: /path/to/key/file
{%endhighlight%}

{%tip title=Tip%}
Using a tasks file instead of a list of commands will allow you to use python code to execute commands. In addition, you would be able to use the `ctx` object to perform actions based on contextual data.

Using a list of commands might be a good solution for very simple cases in which you wouldn't want to maintain a tasks file.

{%endtip%}
