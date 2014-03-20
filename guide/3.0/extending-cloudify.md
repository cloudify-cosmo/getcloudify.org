---
layout: bt_wiki
title: Extending Cloudify
category: CLoudify Development
publish: false
abstract: "Explains how to develop extensions to Cloudify: Plugins, Policies, Workflows"
pageord: 500
--- 
{%summary%} {{page.abstract}}{%endsummary%}

# adding custom types
Custom `node` & `relationship` types are needed in one of the following cases:
* User wats to add a new implementation (meaning the new type will use a new plugin)
* User wants to refine an existing type and use it with many type implementations instead of overriding a property in any type implementation (less error prone)

Adding a type is easy! you just need to import a yaml file with a map named `types` where each type is a key-value entry. for example:

{% highlight YAML %}
types:
    my_type:
        derived_from: cloudify.openstack.server
        properties:
            install_agent:false
        # omitted for brevity

{% endhighlight %}

In the above example the `cloudify.openstack.server` is refined in order to not have Cloudify install an agent on each instance.

Note: you can decalre first level properties schema in a type. This will ensure that type implementation will have to include this property
for example, the `cloudify.openstack.server` type declares the `server` property that any instance must have. this property is a map where all instance properties should be decalred by the instance (type implementation)


{% highlight YAML %}
cloudify.openstack.server:
        derived_from: cloudify.types.host
        properties:
            - server
            - management_network_name: ''
            - nova_config: {}
            - neutron_config: {}
        interfaces:
            cloudify.interfaces.lifecycle:
                - start: nova_plugin.server.start
                - stop: nova_plugin.server.stop
                - delete: nova_plugin.server.delete
            cloudify.interfaces.host:
                - get_state: nova_plugin.server.get_state

{% endhighlight %}


You can always contribute types to the community by submitting a pull request.

# Adding custom interfaces
You can add custom interfaces with additional hooks in order to create a new automation process. In order to use this interface, you will need a workflow that will invoke the operations and plugin(s) that will implement the operations.
you can add an interface in custom type by adding a new entry to the `interfaces` map

# Developing Plugins

## Overview

Plugins are Cloudify integration with different tools. Whenever you need a new integration, you will need to add a plugin that will implement the lifecycle interface, the relationship.lifecycle interface or other existing or custom interfaces. 

## Project Dependencies & Structure

Plugins are python modules packed as pip packages. You will need to have a `setup.py` file with all the dependencies of your module. 
One dependency that all plugins have is [cloudify-celery-commons library](https://github.com/CloudifySource/cosmo-celery-common/archive/develop.zip) You will need to add it to your project dependencies.

Other dependenies are typically the python API libraries you use. If you have non-python dependencies you should pack them in the zip or get have the plugin code install them from an accessible URL

## Coding the Plugin
A plugin has functions that can be invoked by the agent - the same functions you mapped to the interface in your type. These finctions are marked as operations using the `@operation` [python decorator](https://wiki.python.org/moin/PythonDecorators). In order to use this decorator and the related `context` object, add to your source the following statement: 
{% highlight python %}
from cloudify.decorators import operation

{% endhighlight %}

Any operation function has the following signature:
{% highlight python %}
@operation
def myfunction(ctx, **kwargs):
# function body

{% endhighlight %}

The `ctx` argument is an instance of `CloudifyContext`. This class exposes several key properties to the developer:

* `node_id` - unique id for the currenrt node
* `node_name` - node name in the blueprint
* `properties` - the node properties as specified in the blueprint YAML files (Read only)
* `runtime_properties` - runtime properties map for retrieving runtime information to the manager and share with other nodes (read only)

* `capabilities` -  dependency nodes runtime properties for example db connection string if the current node has relationship to a db

* `related` - The related node (targer node) in a relationship.
* `logger` - the logger to use (enriches log entires with relevant context and writes to RabbitMQ)
* `blueprint_id` - The blueprint id the plugin invocation belongs to.
* `deployment_id` - The deployment id the plugin invocation belongs to
* `execution_id` -  The workflow execution id the plugin invocation was requested from.
  This is a unique value which identifies a specific workflow execution.
 * `workflow_id` - The workflow id the plugin invocation was requested from.
        For example:
            'install', 'uninstall' etc...
* `task_id` - The plugin's task invocation unique id.
* `task_name` - The full task name of the invoked task.
* `task_target` - The task target (RabbitMQ queue name).
* `plugin` - The plugin name of the invoked task."
* `operation` - The node operation name which is mapped to this task invocation.
        For example: cloudify.interfaces.lifecycle.start
        
### Getting properties
Use the `properties` to get access to node:

{% highlight python %}
if 'scripts' in ctx.properties:
    scripts = ctx.properties['scripts']
        
{% endhighlight %}

### Reporting Runtime Properties
Use the context as a map to write runtime properties.
In this example a property of ip is added to a host node.

{% highlight python %}
ctx['ip'] = manager_network_ip
{% endhighlight %}

### Getting access to files
In case your blueprint included files that you need to access during plugin runtime use the following method:

{% highlight python %}
sh = ctx.get_resource(scripts[operation_simple_name])
        
{% endhighlight %}

### Dealing with Start detection
In most cases a successful task execution of the `start` operation is considered node is up and running. However, there are cases where you can't use a blocking API call or you don't want to. Them most notable case is while creating a VM. This typically takes few minutes with most virtualized environments. For these cases there is an additional interface `cloudify.interfaces.host` with operation `get_state` to implement using a plugin. 


## Using Your Plugin
In order to use your plugin you need to decalre it with the types. Note that the plugin name refers to the module name and not to the project name

{% highlight YAML %}
lugins:
    nova_plugin:
        derived_from: cloudify.plugins.manager_plugin
        properties:
            url: https://github.com/CloudifySource/cloudify-openstack-plugin/archive/develop.zip

{% endhighlight %}

Note that there are two types of plugins:

* `manager_plugin` - for plugins that are installed on the manager side agent
* `agent_plugin` - for plugins that will be installed on application VM agents




# Developing Agent Installer Plugin


<!--# Integrating External Monitoring Systems
## Nagios
## Statsd / Collectd 
## Ganglia
## Logstash

# Developing Custom Policies-->

# Developing Custom Workflows

