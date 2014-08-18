---
layout: bt_wiki
title: Plugin Authoring Guide
category: Guides
publish: true
abstract: This guides you through the steps necessary for writing a Cloudify plugin
pageord: 500

plugin_link: https://github.com/cloudify-cosmo/cloudify-python-plugin
template_link: https://github.com/cloudify-cosmo/cloudify-plugin-template
blueprint_guide_link: guide-blueprint.html
plugins_common_link: https://github.com/cloudify-cosmo/cloudify-plugins-common
plugins_common_ref_link: reference-plugins-common.html
architecture_link: overview-architecture.html
openstack_plugin_link: https://github.com/cloudify-cosmo/cloudify-openstack-plugin/blob/1.0/nova_plugin/server.py#L306
plugins_common_docs_link: http://cloudify-plugins-common.readthedocs.org/
terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

To understand what a plugin[(?)]({{page.terminology_link}}#plugin) represents, please refer to the plugins section in the [Architecture Overview]({{page.architecture_link}}).

In this tutorial we will create a plugin whose purpose is to start a simple HTTP web server using Python.


# Creating A Plugin Project

Cloudify plugin projects are actually standard Python projects.

Each Cloudify plugin should have `cloudify-plugins-common` as a dependency as it contains the necessary API's for interacting with Cloudify.

`cloudify-plugins-common` documentation can be found [here]({{page.plugins_common_docs_link}}).

{%tip title=Tip%}
You can use the [Plugin Template]({{page.template_link}}) to setup the repo for your plugin.
{%endtip%}

# Setting up the setup.py file for your plugin

For example:

{%highlight python%}
from setuptools import setup

setup(
    name='python-http-webserver-plugin',
    version='1.0',
    author='Cloudify',
    packages=['python_webserver'],
    install_requires=['cloudify-plugins-common==3.0'],
)
{%endhighlight%}



# Writing Plugin Operations

Plugin operations[(?)]({{page.terminology_link}}#operations) are standard Python methods which are decorated with Cloudify's `operation` decorator so that Cloudify can identify them as plugin operations.

For our Python HTTP webserver plugin, we'll create two operations: start & stop.

The start operation will create an `index.html` file and then start a webserver using the following shell command: `python -m SimpleHTTPServer` which starts an HTTP server listening on port 8000.

We'll put the start & stop operations in an `operations.py` module within the `python_webserver` package in our project.

In the following example, we'll use Cloudify's logger which is accessible using the `ctx.logger` object.

More information about the `ctx` object can be found [here]({{page.terminology_link}}##the-context-object).



### python_webserver/operations.py
{%highlight python%}
import os

# import the operation decorator
from cloudify.decorators import operation

# the operation decorator allows us to access the ctx object
@operation
def start(ctx, **kwargs):
    with open('/tmp/index.html', 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    command = 'cd /tmp; nohup python -m SimpleHTTPServer > /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'

    # we can use the ctx.logger object to send a formatted log with context
    # to the manager. The message shown here will only be a part of the
    # log sent. A lot of context is supplied with the object.
    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)


# we're defining multiple operations to which we can refer to afterwards
# in our blueprint
@operation
def stop(ctx, **kwargs):
    try:
        with open('/tmp/python-webserver.pid', 'r') as f:
            pid = f.read()
        ctx.logger.info('Stopping HTTP server [pid={0}]'.format(pid))
        os.system('kill -9 {0}'.format(pid))
    except IOError:
        ctx.logger.info('HTTP server is not running!')
{%endhighlight%}


# Getting Node Properties

During the previous step, we started an HTTP webserver which is now listening on port 8000.
What if the port was specified in our blueprint and we'd like to use that port?

Not a problem, the `ctx` object[(?)]({{page.terminology_link}}#context-object) which represents the context of the invocation exposes the node's[(?)]({{page.terminology_link}}#node) properties[(?)]({{page.terminology_link}}#properties) if the plugin's operation was invoked in the context of a node.

We can get the port property using the following code:
{%highlight python%}
webserver_port = ctx.properties['port']
{%endhighlight%}

The updated start operation looks like this:

{%highlight python%}
@operation
def start(ctx, **kwargs):
    # retrieve the port from the node's properties
    webserver_port = ctx.properties['port']

    with open('/tmp/index.html', 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    # use the port we withdrew previously when running the web server
    command = 'cd /tmp; nohup python -m SimpleHTTPServer {0}> /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'.format(webserver_port)

    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)
{%endhighlight%}

# Updating & Retrieving Runtime Properties

Runtime properties[(?)]({{page.terminology_link}}#runtime-properties) are properties which are set during runtime and are relevant to node instances[(?)]({{page.terminology_link}}#node-instance).
In our example, instead of having the webserver root set to `/tmp` we'll create a temporary folder and store its path as a runtime property so that the stop operation reads it when stopping the webserver.

{%highlight python%}
import os
import tempfile

from cloudify.decorators import operation


@operation
def start(ctx, **kwargs):
    webserver_root = tempfile.gettempdir()
    # we're adding a property which is set during runtime to the runtime
    # properties of that specific node instance
    ctx.runtime_properties['webserver_root'] = webserver_root

    webserver_port = ctx.properties['port']

    with open(os.path.join(webserver_root, 'index.html'), 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    command = 'cd {0}; nohup python -m SimpleHTTPServer {1}> /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'.format(webserver_root, webserver_port)

    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)


@operation
def stop(ctx, **kwargs):
    # setting this runtime property allowed us to refer to properties which
    # are set during runtime from different time in the node instance's lifecycle
    webserver_root = ctx.runtime_properties['webserver_root']
    try:
        with open(os.path.join(webserver_root, 'python-webserver.pid'), 'r') as f:
            pid = f.read()
        ctx.logger.info('Stopping HTTP server [pid={0}]'.format(pid))
        os.system('kill -9 {0}'.format(pid))
    except IOError:
        ctx.logger.info('HTTP server is not running!')
{%endhighlight%}

Runtime properties are saved in Cloudify's storage once the plugin's operation invocation is complete (The `@operation` decorator is responsible for that).

In any case where it is important to immediately save runtime properties to Cloudify's storage the `ctx.update` method should be called.

For example:

{%highlight python%}
ctx.runtime_properties['prop1'] = 'This should be updated immediately!'
ctx.update()
{%endhighlight%}

# Error Handling

Cloudify's workflows[(?)]({{page.terminology_link}}#workflow) framework distinguishes between two kinds of errors:

- Recoverable errors - Cloudify's workflows will retry operations which raised such errors where all Python errors are treated as recoverable errors.
- Non-recoverable errors - Errors which should not be retried and its up to the workflow to decide how to handle them.

In our current start operation, we don't verify that the webserver was actually started and listening on the specified port.

In this step we'll implement a `verify_server_is_up` method which will raise a non-recoverable error if the server was not started in a reasonable period of time:

{%highlight python%}
import os
import tempfile
import urllib2
import time

from cloudify.decorators import operation
# import the NonRecoverableError class
from cloudify.exceptions import NonRecoverableError


def verify_server_is_up(port):
    for attempt in range(15):
        try:
            response = urllib2.urlopen("http://localhost:{0}".format(port))
            response.read()
            break
        except BaseException:
            time.sleep(1)
    else:
        raise NonRecoverableError("Failed to start HTTP webserver")


@operation
def start(ctx, **kwargs):
    webserver_root = tempfile.gettempdir()
    ctx.runtime_properties['webserver_root'] = webserver_root

    webserver_port = ctx.properties['port']

    with open(os.path.join(webserver_root, 'index.html'), 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    command = 'cd {0}; nohup python -m SimpleHTTPServer {1}> /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'.format(webserver_root, webserver_port)

    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)

    # verify
    verify_server_is_up(webserver_port)
{%endhighlight%}

{%note title=Extending NonRecoverableError%}
Raising an error which extends the NonRecoverableError class is currently not supported.
{%endnote%}


# Testing Your Plugin

In most cases the recommendation is to test your plugin's logic using unit tests and only then run them as a part of a Cloudify deployment[(?)]({{page.terminology_link}}#deployment).

The `cloudify-plugins-common` module provides a mock for the `ctx` object which can somewhat simulate a real Cloudify invocation of your plugin operations in unit tests.

Lets test our great Python HTTP webserver plugin:

## python-webserver/tests.py

{%highlight python%}
from python_webserver import operations
from cloudify.exceptions import NonRecoverableError
from cloudify.mocks import MockCloudifyContext


class TestWebServer(unittest.TestCase):

    def test_http_webserver(self):
        ctx = MockCloudifyContext(
            node_id='id',
            properties={
                'port': 8080
            })
        operations.start(ctx)
        operations.verify_http_server(8080)
        operations.stop(ctx)
        self.assertRaises(NonRecoverableError, operations.verify_http_server, 8080)
{%endhighlight%}

That's it! You just wrote your first plugin! All you need now is to incorporate it within your blueprint.
For additional info read the [Blueprint Guide]({{page.blueprint_guide_link}}).

# The Context Object

The `ctx` context object contains contextual parameters mirrored from the blueprint along-side additional functionality:

### Properties context objects

* `ctx.id` - The unique ID of the node's intance[(?)]({{page.terminology_link}}#node-instance).
* `ctx.properties` - The properties[(?)]({{page.terminology_link}}#properties) of the node as declared under the `properties` dict.
* `ctx.runtime_properties` - The properties[(?)]({{page.terminology_link}}#runtime-properties) that are assigned to a **node's instance** at runtime. These properties are either populated by the plugin itself (for instance, an automatically generated port that the plugin exposes when it's run), or are generated prior to the invocation of the plugin (for instance, the ip of the machine the plugin is running on).

### Utility context objects

* `ctx.logger` - a Cloudify specific logging mechanism which you can use to send logs back to the Cloudify manager environment.
* `ctx.download_resource` - Downloads a given resource.
* `ctx.get_resource` - Reads a resource's data.
* `ctx.update` - Updates the node's runtime properties. This is automatically called each time an operation ends, thus it is only useful in the context of a single operation.

# Cloud Plugins

When writing a cloud plugin it needs to contain an operation for getting the VM's state after the start operation was invoked.
This is because most cloud VM creation API's are asynchronous. Therefore, by default, Cloudify calls the start operation and afterwards performs polling on the get_state operation until it returns `True`, which indicates the VM was started.

The get_state operation should also store the following runtime properties for the VM node instance:

- `ip` - The VM's ip address reachable by Cloudify's manager.
- `networks` - A dictionary containing network names as keys and list of ip addresses as values.

See Cloudify's [OpenStack plugin]({{page.openstack_plugin_link}}) for reference.
