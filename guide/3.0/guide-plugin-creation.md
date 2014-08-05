---
layout: bt_wiki
title: Write-a-plugin Guide
category: Guides
publish: true
abstract: Plugin creation guide
pageord: 400

plugin_link: https://github.com/cloudify-cosmo/cloudify-python-plugin
template_link: https://github.com/cloudify-cosmo/cloudify-plugin-template
blueprint_guide_link: guide-blueprint.html
plugins_common_link: https://github.com/cloudify-cosmo/cloudify-plugins-common
plugins_common_ref_link: reference-plugins-common.html
architecture_link: overview-architecture.html
openstack_plugin_link: https://github.com/cloudify-cosmo/cloudify-openstack-plugin/blob/1.0/nova_plugin/server.py#L306
plugins_common_docs_link: http://cloudify-plugins-common.readthedocs.org/
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

To understand what a plugin represents, please refer to the plugins section in the [Architecture Overview]({{page.architecture_link}}).

In this tutorial we will create a plugin whose purpose is to start a simple HTTP web server using Python.


# Creating A Plugin Project

Cloudify plugin projects are actually standard Python projects.

Each Cloudify plugin should have `cloudify-plugins-common` as a dependency as it contains the necessary APIs for interacting with Cloudify.

`cloudify-plugins-common` documentation can be found [here]({{page.plugins_common_docs_link}}).

{%tip title=Tip%}
You can use the [Plugin Template]({{page.template_link}}) to setup the repo for your plugin.
{%endtip%}

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

Plugin operations are standard Python methods which are decorated with Cloudify's `operation` decorator so that Cloudify can identify them as plugin operations.

For our Python HTTP webserver plugin, we'll create two operations: start & stop.

The start operation would create an `index.html` file and then start a webserver using the following shell command: `python -m SimpleHTTPServer` which starts an HTTP server listening on port 8000.

We'll put the start & stop operations in an `operations.py` module within the `python_webserver` package in our project.

In the following example, we'll use Cloudify's logger which is accessible using `ctx.logger`.

More information about the `ctx` object can be found [here](#the-context-object).



### python_webserver/operations.py
{%highlight python%}
import os

from cloudify.decorators import operation


@operation
def start(ctx, **kwargs):
    with open('/tmp/index.html', 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    command = 'cd /tmp; nohup python -m SimpleHTTPServer > /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'

    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)


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

In the previous step, the started HTTP webserver is listening on port 8000.
What if the port was specified in our blueprint and we'd like to use that port?

Not a problem, the `ctx` object which represents the context of the invocation exposes the node properties if the plugin's operation was invoked in the context of a node.

We can get the port property using the following code:
{%highlight python%}
webserver_port = ctx.properties['port']
{%endhighlight%}

The updated start operations looks like this:

{%highlight python%}
@operation
def start(ctx, **kwargs):
    webserver_port = ctx.properties['port']

    with open('/tmp/index.html', 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    command = 'cd /tmp; nohup python -m SimpleHTTPServer {0}> /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'.format(webserver_port)

    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)
{%endhighlight%}

# Updating & Retrieving Runtime Properties

Runtime properties are properties which are set during runtime and are relevant for node instances.
In our example, instead of having the webserver root set to `/tmp` we'll create a temporary folder and store its path as a runtime property so that the stop operation would read it when stopping the webserver.

{%highlight python%}
import os
import tempfile

from cloudify.decorators import operation


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


@operation
def stop(ctx, **kwargs):
    webserver_root = ctx.runtime_properties['webserver_root']
    try:
        with open(os.path.join(webserver_root, 'python-webserver.pid'), 'r') as f:
            pid = f.read()
        ctx.logger.info('Stopping HTTP server [pid={0}]'.format(pid))
        os.system('kill -9 {0}'.format(pid))
    except IOError:
        ctx.logger.info('HTTP server is not running!')
{%endhighlight%}

Runtime properties are saved in Cloudify's storage once the plugin's operation invocation is complete (The @operation decorator is responsible for that).

In any case where it is important to immediately save runtime properties to Cloudify's storage the `ctx.update` method should be called.

For example:

{%highlight python%}
ctx.runtime_properties['prop1'] = 'This should be updated immediately!'
ctx.update()
{%endhighlight%}

# Error Handling

Cloudify's workflows framework distinguishes between two kinds of errors:

- Recoverable errors - Cloudify's workflows will retry operations which raised such errors where all Python errors are treated as recoverable errors.
- Non-recoverable errors - Errors which should not be retried and its up to the workflow to decide how to handle them.

In our current start operation, we don't verifiy that the webserver was actually started and listening on the specified port.
In this step we'll implement a `verify_server_is_up` method which will raise a non recoverable error if the server was not started in a reasonable time:

{%highlight python%}
import os
import tempfile
import urllib2
import time

from cloudify.decorators import operation
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

    verify_server_is_up(webserver_port)
{%endhighlight%}

{%warning title=Warning%}
Raising an error which extends the NonRecoverableError class is currently not supported.
{%endwarning%}


# Testing Your Plugin

In most cases the recommendation is to test your plugin's logic using unit tests and only then run them when used in a Cloudify deployment.

`cloudify-plugins-common` provides a mock for `ctx` object which can somewhat simulate a real Cloudify invocation of your plugin operations in unit tests.

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


# The Context Object

The `ctx` context object contains contextual parameters mirrored from the blueprint along-side additional functionality:

### Properties context objects

* `ctx.id` - The unique ID of the node's intance.
* `ctx.properties` - The properties of the node as declared under the `properties` dict.
* `ctx.runtime_properties` - The properties that are assigned to a **node's instance** at runtime. These properties are either populated by the plugin itself (for instance, an automatically generated port that the plugin exposes when it's run), or are generated prior to the innvocation of the plugin (for instance, the ip of the machine the plugin is running on).

### Utility context objects

* `ctx.logger` - a Cloudify specific logging mechanism which you can use to send logs back to the Cloudify manager environment.
* `ctx.download_resource` - Downloads a given resource.
* `ctx.get_resource` - Reads a resource's data.
* `ctx.update` - Updates the node's runtime properties. This is called each time an operation ends, thus it is only useful in the context of a single operation.

We'll be using some of those in the implmenetation.



That's it! You just wrote your first plugin! All you need now is to incorporate it within your blueprint. Go read the [Blueprint Guide]({{page.blueprint_guide_link}}) for additional info.


# Cloud Plugins

When writing a cloud plugin it needs to contain an operation for getting the VMs state after the start operation was invoked.
This is because most cloud VM creation APIs are asynchronous so by default Cloudify calls the start operation and afterwards performs polling on the get_state operation until it returns `True` which indicates the VM was started.

The get_state operation should also store the following runtime properties for the VM node instance:

- `ip` - The VM's ip address reachable by Cloudify's manager.
- `networks` - A dictionary containing network names as keys and list of ip addresses as values.

See Cloudify's [OpenStack plugin]({{page.openstack_plugin_link}}) for reference.

