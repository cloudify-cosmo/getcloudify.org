---
layout: bt_wiki
title: Plugins
category: DSL Specification
publish: true
abstract: "Plugins Declerations"
pageord: 300

openstack_plugin_link: https://github.com/cloudify-cosmo/cloudify-openstack-plugin/archive/1.1.zip
terminology_link: reference-terminology.html
---
{%summary%}{{page.abstract}}{%endsummary%}
{%summary%}
By declaring plugins we can install python modules and use the installed or preinstalled modules to perform different operations. We can also decide where a specific plugin's operations will be executed.
{%endsummary%}

# Plugins Declaration

The `plugins` section is a hash where each item in the hash represents a plugin to use in the [blueprint]({{page.terminology_link}}#blueprint).

{%highlight yaml%}
plugins:
  plugin1:
    ...
  plugin2:
    ...
{%endhighlight%}

## Plugin Definition

Keyname     | Required    | Type        | Description
----------- | --------    | ----        | -----------
executor    | yes         | string      | Where should the plugin execute its operations? Valid Values: `central_deployment_agent`, `host_agent`.
source      | conditional | string      | Where should the plugin be retrieved from? Could be either a path relative to the blueprint's root dir or a url. If `install` is `false`, `source` is redundant. If `install` is true, `source` is mandatory.
install     | no          | boolean     | Whether to install the plugin or not as it might already be installed as part of the agent. Defaults to `true`.

<br>

Example:

{%highlight yaml%}
plugins:
  openstack:
    executor: central_deployment_agent
    source: {{page.openstack_plugin_link}}
  puppet:
    executor: host_agent
    source: plugins/puppet_plugin.zip
  ruby:
    executor: host_agent
    install: false

node_templates:
  vm:
      type: openstack.nodes.Server
      interfaces:
        my_interface:
          create: openstack.nove_plugin.server.create
          preconfigure: ruby.script_executor.tasks.run
          configure: puppet.application_server.configure
{%endhighlight%}

In the above example, we configure 3 plugins:

* The official Cloudify OpenStack plugin.
* A custom Cloudify Puppet plugin provided with the blueprint.
* A ruby scripts executor that is provided with a custom Cloudify agent that we're using.

We then configure a `vm` node of type `openstack.nodes.Server` which uses a custom `my_interface` interface to run its operations.

The `openstack` plugin's operations will be executed on the `central_deployment_agent` (i.e the [deployment agent]({{page.terminology_link}}#deployment-agent) running in the manager) and the `puppet` and `ruby` plugins' operations will be executed on the `host_agent`s (i.e. the [host agent]({{page.terminology_link}}#host-agent) running in the `vm`'s node instances).

Essentially:

* The `vm` node's instances will be created using the `openstack` plugin we previously declared in the plugins section.
* The preconfiguration will be done by the `ruby` plugin's `run` operation.
* The configuration of the instances will be done by the `puppet` plugin's `configure` operation.