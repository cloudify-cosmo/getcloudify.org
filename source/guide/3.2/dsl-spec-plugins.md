---
layout: bt_wiki
title: Plugins
category: DSL Specification
publish: true
abstract: "Specifying plugins to use with the blueprint"
pageord: 300

openstack_plugin_link: https://github.com/cloudify-cosmo/cloudify-openstack-plugin/archive/1.1.zip
openstack_plugin_yaml_link: http://www.getcloudify.org/spec/openstack-plugin/1.1/plugin.yaml
terminology_link: reference-terminology.html
agent_packager_link: agents-packager.html
plugin_authoring_link: guide-plugin-creation.html
---
{%summary%}{{page.abstract}}{%endsummary%}
{%summary%}
By declaring plugins we can install python modules and use the installed or preinstalled modules to perform different operations. We can also decide where a specific plugin's operations will be executed.
{%endsummary%}

# Plugins Declaration

The `plugins` section is a dictionary where each item in the dictionary represents a plugin to use in the [blueprint]({{page.terminology_link}}#blueprint).

{%highlight yaml%}
plugins:
  plugin1:
    ...
  plugin2:
    ...
{%endhighlight%}

## Plugin Definition

Keyname           | Required    | Type        | Description
-----------       | --------    | ----        | -----------
executor          | yes         | string      | Where to execute the plugin's operations. Valid Values: `central_deployment_agent`, `host_agent`.
source            | conditional | string      | Where to retrieve the plugin from. Could be either a path relative to the `plugins` dir inside the blueprint's root dir or a url. If `install` is `false`, `source` is redundant. If `install` is true, `source` is mandatory.
install_arguments | no          | string      | Optional arguments passed to the 'pip install' command created for the plugin installation
install           | no          | boolean     | Whether to install the plugin or not as it might already be installed as part of the agent. Defaults to `true`.

<br>

Example:

{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_1

imports:
    - {{page.openstack_plugin_yaml_link}}

plugins:
  openstack:
    executor: central_deployment_agent
    source: {{page.openstack_plugin_link}}
  puppet:
    executor: host_agent
    source: my_cloudify_plugins/puppet-plugin
    install_arguments: -r requirements.txt
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
* A custom Cloudify puppet plugin provided with the blueprint where `my_cloudify_plugins/puppet-plugin` should contain the plugin's sources (see the [Plugin Template]({{page.plugin_authoring_link#the-plugin-template}}) documentation for more info on how plugins should be constructed.) The `-r requirements.txt` setting means that  requirements set in the "requirements.txt" file (expected to be part of the plugin source) will be installed by pip as well.
* A custom Cloudify ruby scripts executor plugin that is provided with a custom Cloudify agent that we're using.

We then configure a `vm` node of type `openstack.nodes.Server` which uses a custom `my_interface` interface to run its operations.

The `openstack` plugin's operations will be executed on the `central_deployment_agent` (i.e the [deployment agent]({{page.terminology_link}}#deployment-agent) running in the manager) and the `puppet` and `ruby` plugins' operations will be executed on the `host_agent`s (i.e. the [host agent]({{page.terminology_link}}#host-agent) running in the `vm`'s node instances).

{%note title=Note%}
We declared the `install` variables to be `false` when declaring the ruby scripts executor plugin. This was done since we're using a custom Cloudify agent we created using the [agent-packager]({{page.agent_packager_link}}) which is already provided with this plugin so no installation is necessary.
{%endnote%}

Essentially:

* The `vm` node's instances will be created using the `openstack` plugin we previously declared in the plugins section.
* The preconfiguration will be done by the `ruby` plugin's `run` operation.
* The configuration of the instances will be done by the `puppet` plugin's `configure` operation.
