---
layout: bt_wiki
title: Write-a-plugin Guide
category: Guides
publish: true
abstract: Plugin creation guide
pageord: 200

plugin_link: https://github.com/cloudify-cosmo/cloudify-python-plugin
template_link: https://github.com/cloudify-cosmo/cloudify-plugin-template
blueprint_guide_link: guide-blueprint.html
plugins_common_link: https://github.com/cloudify-cosmo/cloudify-plugins-common
plugins_common_ref_link: reference-plugins-common.html
architecture_link: overview-architecture.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

To understand what a plugin represents, please refer to the plugins section in the [Architecture Overview]({{page.architecture_link}}).

In this tutorial we will create a plugin whose sole purpose is to run a python script. We will base the creation process on our home made [Python Plugin]({{page.plugin_link}}).


# Requirements

To write the plugin, we will use 2 objects that allow us to interact with Cloudify.
Both objects are imported from [plugins-common]({{page.plugins_common_link}}), a Cloudify-specific python module which provides commonly used methods to use in different plugins. A reference to the plugins-common module can be found [here]({{page.plugins_common_link}}).

{%note title=Note%}
The plugins-common module is a **mandantory** module for writing a Cloudify plugin and must be included in its dependencies.
{%endnote%}

The two objects are:

### Operation

The `Operation` decorator is used to allow a plugin to assign a logical operation (used in a blueprint) to a function.
To understand how to map operations to scripts (or actions, depending on the plugin), please see the [Blueprint Guide]({{page.blueprint_guide_link}}).

### Context

The `ctx` context object contains contextual parameters mirrored from the blueprint along-side additional functionality:

#### Properties context objects

* `ctx.id` - The unique ID of the node's intance.
* `ctx.properties` - The properties of the node as declared under the `properties` dict.
* `ctx.runtime_properties` - The properties that are assigned to a **node's instance** at runtime. These properties are either populated by the plugin itself (for instance, an automatically generated port that the plugin exposes when it's run), or are generated prior to the innvocation of the plugin (for instance, the ip of the machine the plugin is running on).

#### Utility context objects

* `ctx.logger` - a Cloudify specific logging mechanism which you can use to send logs back to the Cloudify manager environment.
* `ctx.download_resource` - Downloads a given resource.
* `ctx.get_resource` - Reads a resource's data.
* `ctx.update` - Updates the node's runtime properties. This is called each time an operation ends, thus it is only useful in the context of a single operation.

We'll be using some of those in the implmenetation.


# Step by Step Walkthrough

## Step 1: Setting up the template for your plugin

{%tip title=Tip%}
You can use the [Plugin Template]({{page.template_link}}) to setup the repo for your plugin.
{%endtip%}

We'll start by importing the `operation` decorator mentioned above (which will also supply the `ctx` object).

{%highlight python%}
from cloudify.decorators import operation
{%endhighlight%}

next we'll add the function that we want to execute and assign the `operation` decorator to it.

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx):
    pass
{%endhighlight%}

as you can see, you also get the aforementioned `ctx` object which you can now use.

In this case, we can put a script_path key with a value containing our script's path and it will be passed in the `ctx` object.

for now, we'll just pass and implement the logic later.

## Step 2: Retrieving the script to run

Next, we'll add the functionality we want to the plugin.

Let's define a `get_script_to_run` function.
This function will receive the `ctx` object and `script_path` to see if a path to the script was specified.

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx):
    pass


def get_script_to_run(ctx):
    if ctx.properties['script_path']:
        return ctx.download_resource(ctx.properties['script_path'])
{%endhighlight%}

Explanation:
If the `script_path` key was defined in the `properties` dict, we will use the `download_resource` function to download the script and return its path.

In the next step, if an explicit script_path was not specified in the blueprint, we will check if a script was assigned to a specific operation.

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx):
    pass


def get_script_to_run(ctx):
    if ctx.properties['script_path']:
        return ctx.download_resource(ctx.properties['script_path'])
    if 'scripts' in ctx.properties:
        operation_simple_name = ctx.operation.split('.')[-1:].pop()
        scripts = ctx.properties['scripts']
        if operation_simple_name not in scripts:
            ctx.logger.info("No script mapping found for operation {0}. "
                            "Nothing to do.".format(operation_simple_name))
            return None
        return ctx.download_resource(scripts[operation_simple_name])
{%endhighlight%}

Explanation:

* We check if a `scripts` key is found in the `properties` dict.
* `operation_simple_name` is our way of extracting the name of the operation we'd like to perform and use it in the context of the execution. We won't get into its implementation now.

* if we could not find a script assigned to the task, we will return `None` stating that a mapping of a script to that operation does not exist.
* otherwise, we will download the relevant script and return its path to the calling function.

{%note title=Note%}
It is the plugin developer's responsibility to define the keys which will be used under the node's `properties`. To better understand how to structure these properties, see the [Blueprint Guide]({{page.blueprint_guide_link}})
{%endnote%}

Next, we'll just raise an exception if the script was not found.

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx):
    pass


def get_script_to_run(ctx):
    if ctx.properties['script_path']:
        return ctx.download_resource(ctx.properties['script_path'])
    if 'scripts' in ctx.properties:
        operation_simple_name = ctx.operation.split('.')[-1:].pop()
        scripts = ctx.properties['scripts']
        if operation_simple_name not in scripts:
            ctx.logger.info("No script mapping found for operation {0}. "
                            "Nothing to do.".format(operation_simple_name))
            return None
        return ctx.download_resource(scripts[operation_simple_name])

    raise RuntimeError('No script to run')
{%endhighlight%}


## Step 3: Running the script

Let's get back to our decorated function.

Now, we can get the script's path so that we can execute it:

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx):
    script_to_run = get_script_to_run(ctx, ctx.properties['script_path'])


def get_script_to_run(ctx):
    if ctx.properties['script_path']:
        return ctx.download_resource(ctx.properties['script_path'])
    if 'scripts' in ctx.properties:
        operation_simple_name = ctx.operation.split('.')[-1:].pop()
        scripts = ctx.properties['scripts']
        if operation_simple_name not in scripts:
            ctx.logger.info("No script mapping found for operation {0}. "
                            "Nothing to do.".format(operation_simple_name))
            return None
        return ctx.download_resource(scripts[operation_simple_name])

    raise RuntimeError('No script to run')
{%endhighlight%}

 afterwhich, if a script path exists, we would want to execute the script, so we'll execute the script:

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx, script_path=None, **kwargs):
    script_to_run = get_script_to_run(ctx, script_path)

    if script_to_run:
        execfile(script_to_run)


def get_script_to_run(ctx, script_path=None):
    if script_path:
        return ctx.download_resource(script_path)
    if 'scripts' in ctx.properties:
        operation_simple_name = ctx.operation.split('.')[-1:].pop()
        scripts = ctx.properties['scripts']
        if operation_simple_name not in scripts:
            ctx.logger.info("No script mapping found for operation {0}. "
                            "Nothing to do.".format(operation_simple_name))
            return None
        return ctx.download_resource(scripts[operation_simple_name])

    raise RuntimeError('No script to run')
{%endhighlight%}

That's it! You just wrote your first plugin! All you need now is to incorporate it within your blueprint. Go read the [Blueprint Guide]({{page.blueprint_guide_link}}) for additional info.


# Testing your plugin

Coming soon...


# Packaging your plugin

Coming soon...