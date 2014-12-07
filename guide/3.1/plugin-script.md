---
layout: bt_wiki
title: Script Plugin
category: Plugins
publish: true
abstract: "Cloudify script plugin description and configuration"
pageord: 100

types_yaml_link: http://www.getcloudify.org/spec/cloudify/3.1/types.yaml
repo_link: https://github.com/cloudify-cosmo/cloudify-script-plugin
client_reference_link: https://github.com/cloudify-cosmo/cloudify-script-plugin/blob/master/script_runner/ctx_proxy.py#L331
hello_world_example_link: https://github.com/cloudify-cosmo/cloudify-hello-world-example
---

{%summary%} The script plugin can be used to map node life cycle operations and workflows to scripts that are included in your blueprint. Scripts can be written in python, bash, ruby, you name it.{%endsummary%}

The script plugin comes pre-installed with the default agent packages and is defined in `types.yaml`.
The source code can be found at [{{page.repo_link}}]({{page.repo_link}})

# Usage

Following are usage examples demonstrating different configuration options.

##  Basic Usage

`blueprint.yaml`
{% highlight yaml %}
imports:
  - {{page.types_yaml_link}}

node_templates:
  example_web_server:
    # The web server type is only used for this example. The type used
    # could be any valid cloudify type.
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle:
        start: scripts/start.sh
{%endhighlight%}

`scripts/start.sh`
{% highlight bash %}
#! /bin/bash -e
ctx logger info "Hello to this world"
{%endhighlight%}

Let's walk through this example and explain what's going on.


First, notice how the `cloudify.interface.lifecycle.start` operation is mapped directly to a script. When an operation is mapped, if the mapping points to a resource that is included in the blueprint directory, it is considered to be a script and the script plugin is used. So in fact, the above mapping is equivalent to:
{% highlight yaml %}
interfaces:
  cloudify.interfaces.lifecycle:
    start:
      implementation: script.script_runner.tasks.run
      inputs:
        script_path: scripts/start.sh
{%endhighlight%}


Now lets go through the short example script.


The first line
{% highlight bash %}
#! /bin/bash -e
{%endhighlight%}

will make this script run with `bin/bash`, but we could just as well write the script in `ruby` for example and point to `/bin/ruby`.

{%note title=Note%}
There is another way to tell the script plugin how to execute the script which is detailed later in this guide. It could be useful for running scripts in windows, for example.
{%endnote%}

The second line
{% highlight bash %}
ctx logger info "Hello to this world"
{%endhighlight%}

demonstrates how scripts can access the operation context. This line is equivalent to writing
{% highlight python %}
ctx.logger.info('Hello to this world')
{%endhighlight%}

within a python plugin operation.

A more detailed description on accessing the operation context is provided later in this guide.

## Process configuration

The following example shows how you could configure the working directory the script is executed in, pass arguments to the script and update environment variables of the script process.

`blueprint.yaml`
{% highlight yaml %}
imports:
  - {{page.types_yaml_link}}

node_templates:
  example_web_server:
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle:
        start:
          implementation: scripts/start.sh
          inputs:
            process:
              # this directory should already exist
              cwd: /tmp/workdir
              args: [arg1_value, arg2_value]
              env:
                MY_ENV_VARIABLE: MY_ENV_VARIABLE_VALUE
{%endhighlight%}

`scripts/start.sh`
{% highlight bash %}
#! /bin/bash -e

# will log "current working directory is: /tmp/workdir"
ctx logger info "current working directory is: ${PWD}"

# will log "first arg is: arg1_value"
ctx logger info "first arg is: $1"

# will log "my env variable is: MY_ENV_VARIABLE_VALUE"
ctx logger info "my env variable is: ${MY_ENV_VARIABLE}"

{%endhighlight%}

## Python scripts

Python scripts get special treatment in the script plugin. If the script path ends with a `.py` extension, it gets evaluated within the plugin operation. This provides a simple way to access to full plugin API without having to write a full blown plugin.

`blueprint.yaml`
{% highlight yaml %}
imports:
  - {{page.types_yaml_link}}

node_templates:
  example_web_server:
    type: cloudify.nodes.WebServer
    properties:
      port: 8080
    interfaces:
      cloudify.interfaces.lifecycle:
        start: scripts/start.py
{%endhighlight%}

`scripts/start.py`
{% highlight python %}
from cloudify import ctx

ctx.logger.info('Just logging the web server port: {0}'
                .format(ctx.node.properties['port']))
{%endhighlight%}

If you a want a script to get evaluated as python and it does not have a `.py` extension, you can specify this explicity with the `eval_python` process configuration.

{% highlight yaml %}
interfaces:
  cloudify.interfaces.lifecycle:
    start:
      implementation: script/my_python_script
      inputs:
        process:
          eval_python: true
{%endhighlight%}

If on the other hand a script does have a `.py` extension and you want it to get executed in an external process, simply pass `false` to the `eval_python` process configuration. Do note however, that accessing the operation context in this case will be done through the [context proxy](#context-proxy) as with any other none python script.

## Command Prefix

In some cases, you do not want to use `#!` to specify how to execute the script (or cannot, in case you are running the script on windows). In this case, you can use the `command_prefix` process configuration as follows

`blueprint.yaml`
{% highlight yaml %}
imports:
  - {{page.types_yaml_link}}

node_templates:
  example_web_server:
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle:
        start:
          implementation: scripts/start.rb
          inputs:
            process:
              command_prefix: /opt/ruby/bin/ruby
{%endhighlight%}

This will execute `start.rb` with the ruby binary in `/opt/ruby/bin/ruby`

Another use case for this would be to run a powershell script on windows. This can be achieved like this:

`blueprint.yaml`
{% highlight yaml %}
imports:
  - {{page.types_yaml_link}}

node_templates:
  example_web_server:
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle:
        start:
          implementation: scripts/start.ps1
          inputs:
            process:
              command_prefix: powershell
{%endhighlight%}

This will execute the script using the `powershell` binary.


## Hello World Example
For a more complete usage example, check out our [Hello World]({{page.hello_world_example_link}}) example.

{%note title=Note%}
When you use `nohup` in your scripts, don't forget to redirect the output and stderr to `/dev/null`
and to run the operation in the background using `&`.
For example:
{% highlight bash %}
nohup python -m SimpleHTTPServer > /dev/null 2>&1 &
{%endhighlight%}
{%endnote%}


# Process configuration options
* `cwd` Set the working directory for the script.
* `env` Update environment variables of the script process.
* `args` Arguments to pass to the scripts.
* `command_prefix` Prefix to add before the script path. This could be used instead of `#!`.
* `eval_python` Boolean denoting whether the script should be evaluated as python code or executed as an external process.
* `ctx_proxy_type` The [context proxy](#context-proxy-protocol) type. (none, unix, tcp or http).


# Workflow scripts
You can use the script plugin to execute workflow scripts.

Say you want to add a custom workflow that runs a custom operation on each node. First we will write a simple blueprint with 2 nodes:

`blueprint.yaml`
{% highlight yaml %}
imports:
  - {{page.types_yaml_link}}

node_templates:
  node1:
    type: cloudify.nodes.Root
    interfaces:
      custom:
        touch: scripts/touch.py
  node2:
    type: cloudify.nodes.Root
    interfaces:
      custom:
        touch: scripts/touch.py

workflows:
  touch_all:
    mapping: workflows/touch_all.py
    parameters:
      touched_value:
        description: the value to touch the instance with
{%endhighlight%}

Next, let's write the `touch.py` script. Notice that this script ends with a `.py` extension so it will get evaluated as python code.

`scripts/touch.py`
{% highlight python %}
from cloudify import ctx
from cloudify.state import ctx_parameters as p

ctx.instance.runtime_properties['touched'] = p.touched_value
{%endhighlight%}

This script will update the `touched` runtime property of the current node instance with an expected property `touched_value` that will be injected by the workflow executing this operation.


Finally, let's write the actual workflow.

`workflows/touch_all.py`
{% highlight python %}
from cloudify.workflows import ctx
from cloudify.workflows import parameters as p

for node in ctx.nodes:
    for instance in node.instances:
        instance.execute_operation('custom.touch', kwargs={
            'touched_value': p.touched_value
        })
{%endhighlight%}


Now we can execute this workflow
{% highlight bash %}
cfy executions start -w touch_all -d my_deployment --parameters '{"touch_value": "my_value"}'
{%endhighlight%}

After which, all the node instances will have their `touched` runtime property set to `my_value`.

{%note title=Note%}
Workflow scripts are always evaluated as python code. At the moment it is not possible writing workflow scripts in other languages.
{%endnote%}

# Context Proxy

In the previous examples, `ctx` was referenced from within the scripts several times. This mechanism provides means for accessing the `ctx` object the way it is usually accessed when [writing plugins](guide-plugin-creation.html).

What follows is a description of how calls to the `ctx` executable, translate to the `ctx` object access.

## Attribute access
{% highlight bash %}
#! /bin/bash
ctx bootstrap-context cloudify-agent agent-key-path
{%endhighlight%}
Translates to
{% highlight python %}
ctx.bootstrap_context.cloudify_agent.agent_key_path
{%endhighlight%}

Another thing to note in this example is that `-` in attributes (as an argument) will be replaced with `_`.

## Simple method invocation
{% highlight bash %}
#! /bin/bash
ctx logger info "Some logging"
{%endhighlight%}
Translates to
{% highlight python %}
ctx.logger.info('Some logging')
{%endhighlight%}

In this example, a `logger` attribute is searched on the `ctx` object. Once found, an `info` attribute is searched on the `logger` result. Once found, it discovers that `info` is callable so it invokes it with the remaining arguments.

## Method invocation with kwargs
{% highlight bash %}
#! /bin/bash
ctx download-resource images/hello.png '@{"target_path": "/tmp/hello.png"}'
{%endhighlight%}
Translates to
{% highlight python %}
ctx.download_resource('images/hello.png', **{'target_path': '/tmp/hello.png'})
{%endhighlight%}

In this example, notice how the last argument starts with `@`. This will be further explained later on but for now, suffice to say this means the argument will be parsed as json.

Now that we know that the last argument is a dict, as the above demonstrates, if the last argument of a method invocation is a dict, it will be treated as `kwargs` to the method invocation.

## Dict access
{% highlight bash %}
#! /bin/bash
# read access
ctx node properties application_name
ctx target instance runtime-properties username
ctx instance runtime-properties endpoint.port
ctx instance runtime-properties endpoint.urls[2]

# write access
ctx instance runtime-properties my_property my_value
ctx instance runtime-properties my_properties.my_nested_property nested_value
{%endhighlight%}
Translates to
{% highlight python %}
ctx.node.properties['application_name']
ctx.target.instance.runtime_properties['username']
ctx.instance.runtime_properties['endpoint']['port']
ctx.instance.runtime_properties['endpoint']['urls'][2]

ctx.instance.runtime_properties['my_property'] = 'my_value'
ctx.instance.runtime_properties['my_properties']['my_nested_property'] = 'nested_value'
{%endhighlight%}

Once a dict attribute is discovered during the attribute search the following logic applies:

* If there is a single argument left, the call is considered to be a read access and the key path is calculated
  as the above demonstrates.
* If there are 2 arguments left, the call is considered to be a write access and the key path is set to the value
  of the second argument left. If a dict does not exist in the intermediate path, it is created on the fly.

## Non string arguments
Sometimes you want to pass arguments that are not strings - for example setting a runtime property to a number. In this case, you can prefix an argument with `@` and it will be json parsed before being evaluated.

{% highlight bash %}
#! /bin/bash
ctx instance runtime-properties number_of_clients @14
{%endhighlight%}
Translates to
{% highlight python %}
ctx.instance.runtime_properties['number_of_clients'] = 14  # instead of = '14'
{%endhighlight%}

## Returning a value
If you want the operation to return a value you can use `ctx returns some_value`.
This invocation will set `some_value` on the current `ctx` and the script plugin will return this value when the script terminates.

It should be noted that this call will not make the script terminate, but it is probably best practice to make this call at the end of the script.

## Command line optional arguments of `ctx`
These following flags should appear before the positional arguments.

* `-t, --timeout=TIMEOUT` Request timeout in seconds (Default: `5`)
* `-j, --json-output` Outputs the call result as valid json instead of its string value (Default: `False`)
* `--json-arg-prefix=PREFIX` Prefix for arguments that should be processed as json (Default: `@`)
* `--socket-url=SOCKET_URL` The ctx socket url (Default: the environment variable `CTX_SOCKET_URL`). Normally the environment variable `CTX_SOCKET_URL` will be injected by the script plugin so this option should probably only be used in conjunction with `ctx-server` during script debugging.

# Debugging scripts

TODO

# Context Proxy Protocol

When you call the `ctx` executable you are actually invoking a CLI client that comes pre-installed with the plugin.
Under the hood, when the script plugin executes your script, it also starts a ctx proxy server that delegates calls to the actual `ctx` object instance.

Before the script plugins starts the proxy server it checks the following:

* If ZeroMQ is installed (which applies if using the default agent packages)
  - If running on linux, a unix domain socket is used as the transport layer
  - If running on windows, a tcp socket is used as the transport layer
* If ZeroMQ is not installed an http based transport layer is used

This behavior can be overridden by setting `proxy_ctx_type` of the process configuration to be one of `unix`, `tcp`, `http` or `none`. If `none` is set, no proxy server will be started.

The `ctx` CLI client implements a simple protocol on top of the above transport layers that can be implemented in other languages to provide a more streamlined access to the context.

When the script plugin executes the script, it updates the script process with the `CTX_SOCKET_URL` environment variable.

* If a unix domain socket based proxy was started, its value will look like: `ipc:///tmp/ctx-f3j22f.socket`
* If a tcp socket based proxy was started, its value will look like: `tcp://127.0.0.1:53213`
* If an http socket based proxy was started, its value will look like: `http://localhost:35321`

The first two are valid ZeroMQ socket URLs and should be passed as is to the ZeroMQ client. The last one is the HTTP endpoint that should be used when making REST calls.

If a ZeroMQ client is implemented, it should start a `request` based socket (as the proxy server starts the matching `response` socket)

In all the protocols, the format of the request body is a json with this structure:
{% highlight json %}
{
    "args": [...]
}
{%endhighlight%}
Where args is the list of arguments. So, for example, the arguments for `ctx.properties['port']` will be `["properties", "port"]`

The format of the response body is a json with the following structure.

In case of a successful execution:
{% highlight json %}
{
   "type": "result",
   "payload": RESULT_BODY
}
{%endhighlight%}
In case of a failed execution:
{% highlight json %}
{
   "type": "error",
   "payload": {
      "type": ERROR_TYPE,
      "message": ERROR_MESSAGE,
      "traceback": ERROR_TRACEBACK
   }
}
{%endhighlight%}

You can look at the [CLI implementation]({{page.client_reference_link}}) for reference.
