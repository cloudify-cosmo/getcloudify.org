---
layout: bt_wiki
title: Fabric Plugin (Alpha)
category: Plugins
publish: true
abstract: "Cloudify Fabric plugin description and configuration"
pageord: 300

yaml_link: http://getcloudify.org/spec/fabric-plugin/1.1/plugin.yaml
fabric_link: http://docs.fabfile.org
---

{%warning title=Disclaimer%}This plugin is in Alpha and has not been thoroughly tested yet.{%endwarning%}

{%summary%} The [Fabric]({{page.fabric_link}}) plugin can be used to map node life cycle operations to ssh commands or Fabric tasks that are included in your blueprint. {%endsummary%}
The plugin provides an agent-less method for running operations on destination hosts.

{%note title=Note%}
The Fabric plugin automatically retrieves the IP for the destination host a node is configured to be hosted in so there's no need to retrieve it.
{%endnote%}

## Execution Methods

There are 2 modes for working with this plugin.

* Executing a list of `commands` explicitly specified in the blueprint.
* Executing a Fabric task from a `tasks_file` which contains the commands to be executed for a specific lifecycle opreation.

## Built-In Types

There are 5 types per execution method.

The predefined types are:

### Command based
* `cloudify.types.fabric_cmd.web_server`
* `cloudify.types.fabric_cmd.app_server`
* `cloudify.types.fabric_cmd.db_server`
* `cloudify.types.fabric_cmd.message_bus_server`
* `cloudify.types.fabric_cmd.app_module`

### Task based
* `cloudify.types.fabric_task.web_server`
* `cloudify.types.fabric_task.app_server`
* `cloudify.types.fabric_task.db_server`
* `cloudify.types.fabric_task.message_bus_server`
* `cloudify.types.fabric_task.app_module`

These types are all derived from their Cloudify corresponding base types.

# Running commands

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

blueprint:
  name: example
  nodes:
    - name: example_node
      type: cloudify.types.fabric_cmd.web_server
      properties:
        commands:
          start:
            - echo "source ~/myfile" >> ~/.bashrc
            - apt-get install -y python-dev git
            - pip install my_module
{%endhighlight%}

Here, we use the `fabric_cmd` type and map the `create` operation of the `cloudify.interfaces.lifecycle` node interface to a matching list of commands.

The mapping itself is done under the `commands` property of the node.


# Running tasks

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.fabric_task.web_server
      properties:
        tasks_file: /url/of/tasks_file.py
{%endhighlight%}

Here, we specify the url from which the tasks file should be downloaded.
The tasks file should contain tasks with names corresponding to the lifecycle operation's name (e.g. `create`, `stop`, etc...)

{%note title=Note%}
Each task in the tasks file receives the ctx contexual object as its sole parameter. You can use it to perform parameter-based actions.
{%endnote%}

{%note title=Note%}
It is not mandatory to map all operations to commands or to implement all operations in a tasks file. It is perfectly valid, for example, to only implement the `start` operation in a tasks file.
{%endnote%}

an example of a tasks file would be:

{% highlight python %}
#tasks_file.py
from fabric.api import run, put

def create(ctx):
    # install nginx
    run('sudo apt-get install nginx')


def configure(ctx):
    # configure the webserver to run with our premade configuration file
    # the configuration file's url is supplied in the properties sub-dict.
    conf_file = ctx.download_resource(ctx.properties['nginx_config_file'])
    put(conf_file, '/etc/nginx/conf.d/')


def start(ctx):
    # start the webserver
    run('sudo service nginx restart')
{%endhighlight%}

{%tip title=Tip%}
Using a tasks file instead of a list of commands will allow you to use python code above your commands. In addition, you would be able to use the `ctx` object to perform actions based on contextual data as mentioned above.

Using a list of commands might be a good solution for very simple cases in which you wouldn't want to maintain a tasks file.

{%endtip%}
