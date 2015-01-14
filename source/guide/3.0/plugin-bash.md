---
layout: bt_wiki
title: Bash Plugin
category: Plugins
publish: true
abstract: "Cloudify bash plugin description and configuration"
pageord: 100

yaml_link: http://getcloudify.org/spec/bash-plugin/1.0/plugin.yaml
---

{%summary%} The bash plugin can be used to map node life cycle operations to bash shell scripts that are included in your blueprint. {%endsummary%}

# Configuration

There are 2 modes for working with this plugin.

* In the first mode, the nodes in the blueprint will derive from one of the predefined bash types.
* In the second mode, you have a node that is not derived from a bash type and you map a specific interface operation to a bash shell script.

The plugin definition and predefined types can be found at:

[{{page.yaml_link}}]({{page.yaml_link}})

## Types (Mode 1)

The predefined types are:

* `cloudify.types.bash.app_module`
* `cloudify.types.bash.app_server`
* `cloudify.types.bash.db_server`
* `cloudify.types.bash.message_bus_server`
* `cloudify.types.bash.web_server`

###  Usage example with `cloudify.types.bash.web_server`

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.bash.web_server
      properties:
        scripts:
          create: scripts/create.sh
          configure: scripts/configure.sh
          start: scripts/start.sh
          stop: scripts/stop.sh
          delete: scripts/delete.sh
{%endhighlight%}

In this example, it is assumed that the blueprint folder has a `scripts` folder in it.

Here, we map the `create, configure, start, stop, delete` of the `cloudify.interfaces.lifecycle` node interface to a matching script.

The mapping itself is done under the `scripts` property of the node.

{%note title=Note%}
It is not mandatory to map all operations to scripts. It is perfectly valid, for example, to only map the `start` operation to a script.
{%endnote%}

## Interface mapping (Mode 2)

If you have already have a node in your blueprint, and this node does not derive from one of the predefined bash types, you can directly map an interface operation to a script.

### Example mapping a node's `start` life cycle operation

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

types:
  my_custom_type:
    derived_from: cloudify.types.web_server
    interfaces:
      cloudify.interfaces.lifecycle:
        - start: bash_runner.tasks.run
    properties:
        - scripts

blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: my_custom_type
      properties:
        scripts:
          start: scripts/start.sh
{%endhighlight%}

In this example, we define a custom type `my_custom_type` and map its `cloudify.interfaces.lifecycle.start` operation to the bash plugin's single operation: `bash_runner.tasks.run`.

Next, we add the property `scripts` to the type schema so that script mapping can be configured by nodes using this type.

Finally, we map the `start` operation to a script located in `scripts/start.sh` of the blueprint folder. Similar to the way we would have done it using one of the predefined types as described in [Types](#types-mode-1).

{%note title=Note%}
The property name under the `scripts` property of the node should be the same as the interface operation name, `start`, in the case of the example above.
{%endnote%}

# Scripts API

## Environment Variables

The node properties are flattened as enviroment variables when the scripts are executed.

Say the node properties are:
{% highlight yaml %}
blueprint:
  name: example
  nodes:
    - name: some node
      type: some_type
      properties:
        some_prop: some_value
        some_map:
            prop1: value1
            prop2: value2
{%endhighlight%}

The following properties will be available to scripts:

{% highlight bash %}
echo "some_prop is ${some_prop}"
echo "some_map_prop1 is ${some_map_prop1}"
echo "some_map_prop2 is ${some_map_prop2}"
{%endhighlight%}

Output:
{% highlight bash %}
some_prop is some_value
some_map_prop1 is value1
some_map_prop2 is value2
{%endhighlight%}


In addition, the following environment variables are also available:

* `CLOUDIFY_NODE_ID` The node instance id for which this script is run for
* `CLOUDIFY_BLUEPRINT_ID` The blueprint id
* `CLOUDIFY_DEPLOYMENT_ID` The deployment id
* `CLOUDIFY_MANAGER_IP` The manager management network ip address
* `CLOUDIFY_EXECUTION_ID` The current workflow execution id
* `CLOUDIFY_LOGGING` Path to helper logging functions (see below)
* `CLOUDIFY_FILE_SERVER` Path to helper blueprint resource access functions (see below)
* `CLOUDIFY_FILE_SERVER_BLUEPRINT_ROOT` Base URI to the blueprint folder resources on the management file server

## Helper Functions

### Logging

You can source the `CLOUDIFY_LOGGING` environment variable in your script.
{% highlight bash %}
source ${CLOUDIFY_LOGGING}
{%endhighlight%}

This will put into scope the functions `cfy_info` and `cfy_error` that can be used to send output to be managed and accessed later.

Using them is pretty straightforward
{% highlight bash %}
cfy_info "This is some info message. The blueprint id is ${CLOUDIFY_BLUEPRINT_ID}"
cfy_error "This is some error message. The deployment id is ${CLOUDIFY_DEPLOYMENT_ID}"
{%endhighlight%}

### Download Blueprint Resources
You can source the `CLOUDIFY_FILE_SERVER` environment variable in your script.
{% highlight bash %}
source ${CLOUDIFY_FILE_SERVER}
{%endhighlight%}

This will put into scope the function `cfy_download_resource` which can be used to download resources that were included in the blueprint folder.

Say we have a folder named `images` in our blueprint folder and in it, a file named `flower.png`.

We can download this file to the current working directory, like this:
{% highlight bash %}
cfy_download_resource "images/flower.png"
{%endhighlight%}

If you want more control over the downloaded resource, you can get your resource URL by appending it to the `CLOUDIFY_FILE_SERVER_BLUEPRINT_ROOT` environment variable: `${CLOUDIFY_FILE_SERVER_BLUEPRINT_ROOT}/images/flower.png`.

In fact, this is exactly what `cfy_download_resource` does.
{% highlight bash %}
function cfy_download_resource()
{
    # This only serves as an example. The actual implementation might be different.
    wget ${CLOUDIFY_FILE_SERVER_BLUEPRINT_ROOT}/$@
}
{%endhighlight%}
