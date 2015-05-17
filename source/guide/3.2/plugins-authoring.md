---
layout: bt_wiki
title: Plugin Authoring Guide
category: Plugins
publish: true
abstract: This guides you through the steps necessary for writing a Cloudify plugin
pageord: 400

plugin_link: https://github.com/cloudify-cosmo/cloudify-python-plugin
template_link: https://github.com/cloudify-cosmo/cloudify-plugin-template
blueprint_guide_link: guide-blueprint.html
plugins_common_link: https://github.com/cloudify-cosmo/cloudify-plugins-common
plugins_common_ref_link: reference-plugins-common.html
architecture_link: overview-architecture.html
openstack_plugin_link: https://github.com/cloudify-cosmo/cloudify-openstack-plugin/blob/1.1/nova_plugin/server.py#L379
plugins_common_docs_link: http://cloudify-plugins-common.readthedocs.org/
terminology_link: reference-terminology.html
dsl_inputs_link: dsl-spec-inputs.html
local_workflows_api_link: http://cloudify-cli.readthedocs.org/en/latest/commands.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

To understand what a [plugin]({{page.terminology_link}}#plugin) represents, please refer to the plugins section in the [Architecture Overview]({{page.architecture_link}}).

In this tutorial we will create a plugin whose purpose is to start a simple HTTP web server using Python.


# Creating A Plugin Project

Cloudify plugin projects are actually standard Python projects.

Each Cloudify plugin should have `cloudify-plugins-common` as a dependency as it contains the necessary API's for interacting with Cloudify.

`cloudify-plugins-common` documentation can be found [here]({{page.plugins_common_docs_link}}).

{%tip title=Tip%}
You can use the [Plugin Template](#the-plugin-template) to setup the repo for your plugin.
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
    install_requires=['cloudify-plugins-common==3.1'],
)
{%endhighlight%}



# Writing Plugin Operations

Plugin [operations]({{page.terminology_link}}#operations) are standard Python methods which are decorated with Cloudify's `operation` decorator so that Cloudify can identify them as plugin operations.

For our Python HTTP webserver plugin, we'll create two operations: start & stop.

The start operation will create an `index.html` file and then start a webserver using the following shell command: `python -m SimpleHTTPServer` which starts an HTTP server listening on port 8000.

We'll put the start & stop operations in a `tasks.py` module within the `python_webserver` package in our project.

In the following example, we'll use Cloudify's logger which is accessible using the `ctx.logger` object.

More information about the `ctx` object can be found [here]({{page.terminology_link}}#context-object).



### python_webserver/tasks.py
{%highlight python%}
import os

# import the ctx object
from cloudify import ctx

# import the operation decorator
from cloudify.decorators import operation

@operation
def start(**kwargs):
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
def stop(**kwargs):
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

Not a problem, the [`ctx` object]({{page.terminology_link}}#context-object) which represents the context of the invocation exposes the [node's]({{page.terminology_link}}#node) [properties]({{page.terminology_link}}#properties) if the plugin's operation was invoked in the context of a node.

We can get the port property using the following code:
{%highlight python%}
webserver_port = ctx.node.properties['port']
{%endhighlight%}

The updated start operation looks like this:

{%highlight python%}
from cloudify import ctx

@operation
def start(**kwargs):
    # retrieve the port from the node's properties
    webserver_port = ctx.node.properties['port']

    with open('/tmp/index.html', 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    # use the port we withdrew previously when running the web server
    command = 'cd /tmp; nohup python -m SimpleHTTPServer {0}> /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'.format(webserver_port)

    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)
{%endhighlight%}

# Updating & Retrieving Runtime Properties

[Runtime properties]({{page.terminology_link}}#runtime-properties) are properties which are set during runtime and are relevant to [node instances]({{page.terminology_link}}#node-instance).
In our example, instead of having the webserver root set to `/tmp` we'll create a temporary folder and store its path as a runtime property so that the stop operation reads it when stopping the webserver.

{%highlight python%}
import os
import tempfile

from cloudify import ctx
from cloudify.decorators import operation


@operation
def start(**kwargs):
    webserver_root = tempfile.mkdtemp()
    # we're adding a property which is set during runtime to the runtime
    # properties of that specific node instance
    ctx.instance.runtime_properties['webserver_root'] = webserver_root

    webserver_port = ctx.node.properties['port']

    with open(os.path.join(webserver_root, 'index.html'), 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    command = 'cd {0}; nohup python -m SimpleHTTPServer {1}> /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'.format(webserver_root, webserver_port)

    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)


@operation
def stop(**kwargs):
    # setting this runtime property allowed us to refer to properties which
    # are set during runtime from different time in the node instance's lifecycle
    webserver_root = ctx.instance.runtime_properties['webserver_root']
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
ctx.instance.runtime_properties['prop1'] = 'This should be updated immediately!'
ctx.instance.update()
{%endhighlight%}

# Asynchronous Operations

In many cases, such as creating resources in a Cloud environment, an operation may be waiting for an asynchronous activity to end (e.g. wait for VM to start). Instead of implementing a wait-for mechanism in the operation which will wait until the asynchronous activity is over (which blocks the worker who executed the operation from executing other operations in the mean time), operations can request to be retried after some time and check whether the asynchronous activity is over.

## Requesting A Retry

{%highlight python%}
from cloudify.decorators import operation
from cloudify import exceptions

@operation
def start(**kwargs):
    # start is executed for the first time, start the resource
    if ctx.operation.retry_number == 0:
        iaas.start_vm()

        # It will take some time until the VM will be running..
        # Request a retry after 30 seconds
        return ctx.operation.retry(message='Waiting for the VM to start..',
                                   retry_after=30)

    # This is a retried operation, check if the resource is running
    # and if not, request another retry
    if iaas.get_vm_state(...) != 'running':

        # Request a retry after 5 seconds
        return ctx.operation.retry(message='Still waiting for the VM to start..',
                                   retry_after=5)

    # Resource is up and running
    ctx.logger.info('VM started successfully!')
{%endhighlight%}

{%tip title=Tip%}
`ctx.operation.max_retries` can be configured in Cloudify's manager blueprint. More information can be found in the [Workflows guide](guide-workflows.html#workflow-error-handling).
{%endtip%}


# Error Handling

Cloudify's [workflows]({{page.terminology_link}}#workflow) framework distinguishes between two kinds of errors:

- Recoverable errors - Cloudify's workflows will retry operations which raised such errors where all Python errors are treated as recoverable errors.
- Non-recoverable errors - Errors which should not be retried and it's up to the workflow to decide how to handle them.

In our current start operation, we don't verify that the webserver was actually started and listening on the specified port.

In this step we'll implement a `verify_server_is_up` method which will raise a non-recoverable error if the server was not started in a reasonable period of time:

{%highlight python%}
import os
import tempfile
import urllib2
import time

from cloudify import ctx
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
def start(**kwargs):
    webserver_root = tempfile.mkdtemp()
    ctx.instance.runtime_properties['webserver_root'] = webserver_root

    webserver_port = ctx.node.properties['port']

    with open(os.path.join(webserver_root, 'index.html'), 'w') as f:
        f.write('<p>Hello Cloudify!</p>')

    command = 'cd {0}; nohup python -m SimpleHTTPServer {1}> /dev/null 2>&1' \
              ' & echo $! > /tmp/python-webserver.pid'.format(webserver_root, webserver_port)

    ctx.logger.info('Starting HTTP server using: {0}'.format(command))
    os.system(command)

    # verify
    verify_server_is_up(webserver_port)
{%endhighlight%}


# Testing Your Plugin

In most cases, the recommendation is to test your plugin's logic using local workflows and only then, run them as part of a Cloudify [deployment]({{page.terminology_link}}#deployment). The [Plugin Template]({{page.template_link}}/blob/3.1/plugin/tests/test_plugin.py) has an example of doing just that.

If you want to unit test a specific function that needs a `ctx` object, you can use `cloudify.mocks.MockCloudifyContext` which is provided by `cloudify-plugins-common`.

# The end (Sort of)

That's it! You just wrote your first plugin! All you need now is to incorporate it within your blueprint.
For additional info read the [Blueprint Guide]({{page.blueprint_guide_link}}).

# Additional Info

## The Context Object

The `ctx` context object contains contextual parameters mirrored from the blueprint along-side additional functionality:

### Properties context objects

* `ctx.instance.id` - The unique ID of the node's intance.
* `ctx.node.properties` - The properties of the node as declared under the `properties` dict.
* `ctx.instance.runtime_properties` - The properties that are assigned to a **node's instance** at runtime. These properties are either populated by the plugin itself (for instance, an automatically generated port that the plugin exposes when it's run), or are generated prior to the invocation of the plugin (for instance, the ip of the machine the plugin is running on).

### Utility context objects

* `ctx.logger` - a Cloudify specific logging mechanism which you can use to send logs back to the Cloudify manager environment.
* `ctx.download_resource` - Downloads a given resource.
* `ctx.get_resource` - Reads a resource's data.
* `ctx.instance.update` - Updates the node's runtime properties. This is automatically called each time an operation ends, thus it is only useful in the context of a single operation.

## Cloud Plugins

The lifecycle `start` operation should store the following runtime properties for the `Compute` node instance:

- `ip` - The VM's ip address reachable by Cloudify's manager.
- `networks` - A dictionary containing network names as keys and list of ip addresses as values.

See Cloudify's [OpenStack plugin]({{page.openstack_plugin_link}}) for reference.


# The Plugin Template

A Plugin Template is provided [here]({{page.template_link}}) to help you start writing your first plugin.

Since a Cloudify plugin is merely a python module, a module's structure applies to the plugin.

## A Plugin's Structure

We won't delve too deeply into the configuration of a python module. Instead, we'll supply a general view of the niceties provided with the plugin template which will aid you in delivering a plugin pretty quickly.

## .gitignore

The `.gitignore` file allows you to specify all files and folders you'd like to ignore when handling your module as part of a Git repo.

More info [here](http://git-scm.com/docs/gitignore).

## .travis.yml

At Cloudify, we use [travis-ci](http://travis-ci.org) to run unit and integration tests on our modules (plugins, tools and the likes).

The `.travis.yml` file is where we provide configuration for running the tests.
You can specify the different python environments to run in, which modules to install prior to running the tests and much more.

More info [here](http://docs.travis-ci.com/user/build-configuration/#.travis.yml-file%3A-what-it-is-and-how-it-is-used).

## dev-requirements.txt

[requirements.txt](https://pip.pypa.io/en/latest/user_guide.html#requirements-files) files are used by pip to install a set of modules instead of having to run `pip install MODULE` multiple times.

We use the `dev-requirements.txt` file to install modules required for development purposes only (i.e. modules that aren't required for the plugin to function).
If you look into the dev-requirements.txt file you can see that we're installing our rest-client, dsl-parser and plugins-common modules from the master branch which allows us to easily install the basic dependencies for our plugins for development.

In addition, we install [nose](https://nose.readthedocs.org/en/latest/) which is used for running our tests.

## setup.py

The setup.py file is the most basic requirement for writing a python module. It is used to state basic information for delivering and installing your module.

We won't go into the bits and pieces of writing a setup.py file but it is important to notice one thing. the `install_requires` variable must ALWAYS contain the `cloudify-plugins-common` module as it's the most basic requirements for writing Cloudify plugins.

Additionally, the `name` variable must not include underscores.

More info on the module can be found [here]({{page.plugins_common_docs_link}}).
See "Setting up the setup.py file for your plugin" above for a setup.py file matching the guide provided here.

Since a plugin is simply a python module, Cloudify does not enforce any specific configuration in your setup.py file. As long as it corresponds to the basic requirements of a python module, it can be used by Cloudify.

## tox.ini

In Cloudify, we use [tox](https://tox.readthedocs.org/en/latest/) to run tests in multiple python environments.

Tox provides a lot of functionality (e.g. running tests in multiple virtual environments in parallel) for testing python modules.

Let's review the `tox.ini` file briefly.

The `envlist` param under [tox] states that we will be running our tests in 2 sepratate environments. One is [flake8](http://flake8.readthedocs.org/) which will test the code for syntax errors. The other is py27 which will run our tests using `nose` in a Python 2.7.x environment.

The configuration for both environments stated in `envlist` are provided underneath.

The `deps` param under [testenv:py27] supplies `tox` with the dependencies it requires to run tests in the `py27` env.
The `commands` param is then used to run the tests themselves stating that it should also provide a summary report of the code covered by the tests. It will run the tests on the directory plugin/tests.

The [testenv:flake8] env will run a flake8 validation against the `plugin` directory.

## The plugin's folder structure

In the `plugin` folder you can see a `tests` folder and a `tasks.py` file.

While this isn't binding, we use the tests folder for our tests and the tasks.py file for the operations the plugin is going to include (as seen [here](#writing-plugin-operations)).

Any additional functions and classes can be put in different files.

Inside the tests folder you can find the `test_plugin.py` file in which you can write your tests.

You should note the following:

* The test_plugin.py file imports the `local` attribute from the cloudify.workflows module (a part of the `cloudify-plugins-common` module). This will allow you to run your operations locally using the [local workflows API]({{page.local_workflows_api_link#local}}).
* The `blueprint_path` variable is already supplied so that you can run your operations against a given blueprint (will get to that later)
* the `inputs` dictionary will allow you to supply [inputs]({{page.dsl_inputs_link}}) for your blueprint.
* The `self.env` object will assist you in executing the operations locally and in the context of your blueprints.
* The test `test_my_task` shows an example of instantiating a local workflow execution environment and executing an arbitrary workflow with it (install in the case of this test).

In the `blueprint` folder you will find 2 yaml files. One is a blueprint you can use in your tests.

Generally, when you use the local workflows API you also have to supply a blueprint to process. The blueprint.yaml file provided in the test already maps the operation in tasks.py to a `cloudify.interface.lifecycle` operation.

In the plugin.yaml file, note that `install` is set to `false` as you're only running tests.

So... clone the plugin template's repository and enjoy writing your first Cloudify plugin.
