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
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

In this tutorial we will create a plugin whose sole purpose is to run a python script (based on our home made [Python Plugin]({{page.plugin_link}}))

Cloudify uses plugins to perform different actions on destination machines (like run Chef recipes, execute bash scripts, install and configure components, etc..)


# Requirements

To write the plugin, we will use 2 objects that allow us to interact with Cloudify.
Both objects are imported from [plugins-common]({{page.plugins_common_link}}), a Cloudify-specific python module which provides commonly used methods to use in different plugins. A reference to the plugins-common module can be found [here]({{page.plugins_common_link}}).

{%note title=Note%}
The plugins-common module is a MANDATORY module for writing a Cloudify plugin.
{%endnote%}

### Operation

The `Operation` decorator is used to allow a plugin to assign a logical operation (used in a blueprint) to a function.
To understand how to map operations to scripts (or actions, depending on the plugin), please see the [Blueprint Guide]({{page.blueprint_guide_link}}).

### Context

The `ctx` context object contains contextual parameters mirrored from the blueprint along-side additional functionality:

#### Properties

* `ctx.id` - The unique ID of the node's intance.
* `ctx.properties` - The properties of the node as declared under the `properties` sub-dict.
* `ctx.runtime_properties` - The properties that are assigned to a **node's instance** at runtime (like ip, related node properties, etc..)

#### Utilities

* `ctx.logger` - a Cloudify specific logging mechanism which you can use to send logs back to the Cloudify manager environment.
* `ctx.download_resource` - Downloads a given resource.
* `ctx.get_resource` - Reads a resource's data.
* `ctx.update` - Updates the node's runtime properties.

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
def run(ctx, script_path=None, **kwargs):
    pass
{%endhighlight%}

as you can see, you also get the aforementioned `ctx` object which you can now use.
all of the node's `properties` sub-dict keys are passed to the underlying function when decorating a function using `operation`.

In this case, we can put a script_path key with a value containing our script's path and it will be passed to the function.

for now, we'll just pass and implement the logic later.

## Step 2: Retrieving the script to run

Next, we'll add the functionality we want to the plugin.

Let's define a `get_script_to_run` function.
This function will receive the `ctx` object and `script_path` to see if a path to the script was specified.

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx, script_path=None, **kwargs):
    pass


def get_script_to_run(ctx, script_path=None, **kwargs):
    if script_path:
        return ctx.download_resource(script_path)
{%endhighlight%}

Explanation:
If the `script_path` key was defined in the `properties` sub-dict, we will use the `download_resource` function to download the script and return its path.

In the next step, if an explicit script_path was not specified in the blueprint, we will check if a script was assigned to a specific operation.

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx, script_path=None, **kwargs):
    pass


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
{%endhighlight%}

Explanation:

* We check if a `scripts` key is found in the `properties` sub-dict.
* `operation_simple_name` is our way of extracting the name of the operation we'd like to perform and use it in the context of the execution. A good example of that would be:

{%highlight yaml%}
properties:
    scripts:
        create: /path/to/create_script.py
{%endhighlight%}

* if we could not find a script assigned to the task, we will return `None` stating that a mapping of a script to that operation does not exist.
* otherwise, we will download the relevant script and return its path to the calling function.

{%note title=Note%}
It is the plugin developer's responsibility to define the keys which will be used under the node's `properties`.
{%endnote%}

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx, script_path=None, **kwargs):
    pass


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

If a script was not found, we'll raise an exception.

## Step 3: Running the script

Let's get back to our decorator function.

Now, after we can retrieve the script we want to run, we can do the following:

{%highlight python%}
from cloudify.decorators import operation


@operation
def run(ctx, script_path=None, **kwargs):
    script_to_run = get_script_to_run(ctx, script_path)


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

afterwhich, if a script path exists, we want to execute the script, so we'll do:

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

That's it! You just wrote your first plugin! All you need now is to incorporate it within your blueprint. Go read the [Blueprint Guide]({{page.blueprint_guide_link}}) for additiona info.