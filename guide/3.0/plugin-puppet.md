---
layout: bt_wiki
title: Puppet Plugin
category: Plugins
publish: true
abstract: "Puppet plugin description and configuration"
pageord: 700

yaml_link: http://getcloudify.org/spec/puppet-plugin/1.0/plugin.yaml
---

{%summary%} The Puppet plugin can be used to map node life cycle operations to Puppet manifest runs. {%endsummary%}

# Puppet plugin usage options

The Puppet plugin allows you to run either Puppet agent or Puppet standalone. The usage option is chosen based on presence or absence of `server` property under node's `properties` > `puppet_config`. If `server` is present, Puppet agent is used. If `server` is not present, Puppet standalone is used.

Example:
{% highlight yaml %}
imports:
    - {{page.yaml_link}}
blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          server: puppet.example.com  # Agent
          ...
{%endhighlight%}

# Types

Node types that can be used for Puppet nodes are listed below. All of them are derived from the corresponding [abstract types](reference-types.html#abstract-types).

* `cloudify.types.puppet.app_module` -- derived from `cloudify.types.app_module`
* `cloudify.types.puppet.app_server` -- derived from `cloudify.types.app_server`
* `cloudify.types.puppet.db_server` -- derived from `cloudify.types.db_server`
* `cloudify.types.puppet.message_bus_server` -- derived from `cloudify.types.message_bus_server`
* `cloudify.types.puppet.web_server` -- derived from `cloudify.types.web_server`

**Properties:**

In addition to inherited properties all of the Puppet types have the following properties:

* `puppet_config` contains all Puppet specific configuration
	* `add_operation_tag` (optional) - whether to [add `cloudify_operation_OPNAME` tag](#operation-specific-cloudifyoperationopname-tag)
	* `download` (only for Puppet standalone, optional) - [URL](#download-puppet-manifests-from-a-url) or [path in blueprint](#embed-puppet-manifests-in-the-blueprint) of a .tar.gz file with manifests.
	* `environment` (required) - Puppet environment setting.
	* `execute` (only for Puppet standalone, optional) - [per-operation Puppet code](#per-operation-puppet-manifests-or-code-to-execute).
		* OPNAME - Puppet code to execute for the OPNAME lifecycle operation.
	* `facts` (optional) - [Facts to pass to Puppet](#blueprint-specified-puppetfacter-facts)
	* `manifests` (only for Puppet standalone, optional) - [per-operation manifests to execute](#per-operation-puppet-manifests-or-code-to-execute).
		* OPNAME - Puppet manifest to execute for the OPNAME lifecycle operation.
	* `modules` (optional, defaults to empty list) - List of [modules to install](#puppet-modules-installation) for Puppet standalone.
	* `node_name_prefix` (optional, defaults to empty string) - [Puppet node name](#puppet-node-naming) prefix.
	* `node_name_suffix` (optional, defaults to empty string) - [Puppet node name](#puppet-node-naming) suffix.
	* `operations_tags` (optional) - [Per-operation tags](#per-operation-set-of-tags) to pass to Puppet.
		* OPNAME - Tag or list of tags to pass to Puppet for the OPNAME lifecycle operation.
	* `repos` (optional) - Custom packages that are used for adding Puppet repository.
		* `deb` (optional, defaults to http://apt.puppetlabs.com/puppetlabs-release-RELEASENAME.deb)
	* `tags` (optional) - List of [tags to pass](#pass-given-list-of-tags) to Puppet for all operations.
	* `server` (only for for Puppet agent, required) - Puppet server to use.
	* `version` (optional, defaults to `3.5.1-1puppetlabs1`) - [Puppet version to install](#puppet-version-to-install).


# Integration

This section describes integration aspects that are common to both Puppet agent and Puppet standalone. Also see [Puppet agent](#puppet-agent) and [Puppet standalone](#puppet-standalone) sections for additional integration details.


## Lifecycle operations naming

When defining a YAML node, there are several places that contain per-operation configuration. Most of the operations in Cloudify are named `cloudify.interfaces.lifecycle.*` and `cloudify.interfaces.relationship_lifecycle.*`. For convenience, when defining a node, the operation names are shortened so only the last part is used. Example:

{% highlight yaml %}
imports:
    - {{page.yaml_link}}
blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          ...
          operations_tags:
            start: my_start_tag  # cloudify.interfaces.lifecycle.start
            stop: my_stop_tag    # cloudify.interfaces.lifecycle.stop
{%endhighlight%}

## Puppet version to install

You can specify which Puppet version to install (to use as agent or standalone) under `properties` > `puppet_config` > `version`. Defaults to `3.5.1-1puppetlabs1`.

Example:
{% highlight yaml %}
imports:
    - {{page.yaml_link}}
blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          version: 3.5.1-1puppetlabs1
          server: puppet.example.com
          environment: myenv
          node_name_prefix: myweb-
{%endhighlight%}


## Blueprint specified Puppet/facter facts

You can specify custom facts to pass to Puppet under `properties` > `puppet_config` > `facts`. These will be flattened so that the fact name will be of the form `level1_level2_level3_...`.

{%note title=Note%}
`properties` > `puppet_config` > `facts` hash must not contain `cloudify` or `cloudify_*` keys as these are generated by Cloudify.
{%endnote%}

Example:
{% highlight yaml %}
imports:
    - {{page.yaml_link}}
blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          ...
          facts:
            level1:
              level2:
                level3: myval
{%endhighlight%}

This will make available a fact named `level1_level2_level3` with the value `myval`.


## Automatic Cloudify-specific Puppet/facter facts

This section applies to both Puppet agent and Puppet standalone.

To allow integration of Puppet, Cloudify supplies custom facts to Puppet to allow decisions based on Cloudify's information such as properties of the Cloudify node and current operation.

## Passing Cloudify-specific tags

There are several methods to pass tags to Puppet. The methods are described below and are additive (Puppet gets all of the tags generated by all of the methods). Example combining all of the methods is shown below.

### Pass given list of tags

Tags specified under `properties` > `puppet_config` > `tags` (list) are passed to Puppet.

### Operation specific `cloudify_operation_OPNAME` tag

If `properties` > `puppet_config` > `add_operation_tag` is specified and has a boolean value that is equal to true (true, "yes", 1) a tag `cloudify_operation_OPNAME` is passed to Puppet. `OPNAME` is the short name of Cloudify's lifecycle operation, for example `start`, `stop`, etc.

### Per operation set of tags

If `properties` > `puppet_config` > `operations_tags` hash is specified, it is being looked up in the current operation. If found, current-operation-specific tags are passed to Puppet. Each value of the `operations_tags` hash can be either a tag (string) or a list of tags (list of strings).

### Tags passing example
{% highlight yaml %}
imports:
    - {{page.yaml_link}}
blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          server: puppet.example.com
          environment: myenv
          tags:
            - tag1
            - tag2
          add_operation_tag: true
          operations_tags:
            start: my_start_tag
            stop:
              - my_stop_tag1
              - my_stop_tag2
{%endhighlight%}


## Cloudify-specific facts for all operations:

* `cloudify_node_id` - The node instance id for which Puppet is run
* `cloudify_node_name` -  The node name for which Puppet is run
* `cloudify_blueprint_id` -  The blueprint id
* `cloudify_deployment_id` -  The deployment id
* `cloudify_properties_*` -  Properties of the node for which Puppet is run (see example below)
* `cloudify_runtime_properties_*` -  Run-time properties of the node for which Puppet is run
* `cloudify_capabilities_*` -  Run-time properties of related nodes. Example: `cloudify_capabilities_db_ip`, where `db` is the node name and `ip` is the run-time property name.
* `cloudify_host_ip` -  IP of the host containing the node for which Puppet is run

## Cloudify-specific facts for operations involving two nodes:

* `cloudify_related_node_id` - The node instance id of the related node
* `cloudify_related_properties_*` -  Properties of the related node
* `cloudify_related_runtime_properties_*` -  Run-time properties of the related node
* `cloudify_related_host_ip` -  IP of the host containing the related node



## Node properties as Puppet/facter facts example:

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

The following Puppet/facter facts will be available:

* `cloudify_properties_some_prop`
* `cloudify_properties_some_map_prop1`
* `cloudify_properties_some_map_prop2`

Also see "Standalone-specific integration"


# Puppet agent

Runs puppet agent for lifecycle operations. The Puppet agent is run for the `start` operation and each operation that has per-operation tags defined.

## Requirements

* Existing Puppet server which should be:
  * Configured to [auto-sign certificates](http://docs.puppetlabs.com/puppet/latest/reference/ssl_autosign.html)
  * Resolvable (DNS or hosts file)
  * Loaded with appropriate manifests

## Puppet node naming

Puppet node name is used in [nodes' definitions](http://docs.puppetlabs.com/puppet/latest/reference/lang_node_definitions.html).

Puppet node name is constructed by concatenation of `node_name_prefix`, node id and `node_name_suffix`. Both `node_name_prefix` and `node_name_suffix` are optional and default to empty strings. Since node id is not guaranteed to follow a convention, you should use `node_name_prefix` and/or `node_name_suffix` for node definitions.

Sample usage:

{% highlight yaml %}
imports:
    - {{page.yaml_link}}
blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          server: puppet.example.com
          environment: myenv
          node_name_prefix: myweb-
          node_name_suffix: .example.com
{%endhighlight%}


## Puppet agent simple usage example

This is a minimal example of using Puppet agent to install a web server. The `node_name_prefix` is required in order for Puppet to match the node using `node /^myweb.*$/ { ... }`.

In absence of per-operation tags, Puppet agent will run only for the `start` operation.

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          server: puppet.example.com
          environment: myenv
          node_name_prefix: myweb
{%endhighlight%}



# Puppet standalone

Puppet standalone will install Puppet, Puppet modules and will run per-operation code or manifests.

## Puppet manifests location

If you are using manifests, they are placed in `$cloudify_local_repo` (Puppet/facter fact) directory, currently it's `~/cloudify/puppet` (the user is typically `ubuntu` and hence the home directory is usually /home/ubuntu).

## Puppet modules location

`$cloudify_local_repo/modules`. This location (among others) is used as `--modulepath` when running Puppet.

## Puppet modules installation
Puppet standalone will install all Puppet modules given under `properties` > `puppet_config` > `modules` prior running any Puppet manifest or Puppet code.

Example:
{% highlight yaml %}
imports:
    - {{page.yaml_link}}

blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          ...
          modules:
              - puppetlabs-apache
              - puppetlabs-concat
              - puppetlabs-stdlib
              - puppetlabs-vcsrepo
{%endhighlight%}

## Per-operation Puppet manifests or code to execute

Puppet standalone will run Puppet for each operation for which a manifest or Puppet code are given under `properties` > `puppet_config` > `manifest` > OPNAME or `properties` > `puppet_config` > `manifest` > OPNAME.

Below is example showing the usage of per-operation Puppet code. `configure` operation happens first. Git repository is cloned. During the `start` operation, `my_hello_world` class is run.

Per-operation Puppet code example:
{% highlight yaml %}
imports:
    - {{page.yaml_link}}

blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          modules:
              ...
              - puppetlabs-vcsrepo
          execute:
              configure: |
                  package{'git':}
                  ->
                  vcsrepo{$cloudify_local_repo:
                    ensure => present,
                    provider => git,
                    source   => 'https://github.com/example-com/our-manifests.git',
                  }
              start: |
                  class{'my_hello_world':
                  }

{%endhighlight%}

## Providing manifests for Puppet standalone

There are three alternatives for providing manifests.

* [Use Puppet code to fetch the manifests](#use-puppet-code-to-fetch-the-manifests)
* [Download Puppet manifests from a URL](#download-puppet-manifests-from-a-url)
* [Embed Puppet manifests in the blueprint](#embed-puppet-manifests-in-the-blueprint)

Details for the above options follow. Note that you don't have to provide manifests, you can provide Puppet code directly in the manifest under `properties` > `puppet_config` > OPNAME > `execute`, see the example in [Per-operation Puppet manifests or code to execute](#per-operation-puppet-manifests-or-code-to-execute).

### Use Puppet code to fetch the manifests

See the example in [Per-operation Puppet manifests or code to execute](#per-operation-puppet-manifests-or-code-to-execute)

### Download Puppet manifests from a URL

The URL must point to a `.tar.gz` file. It's contents are extracted to the [`$cloudify_local_repo` directory](#puppet-manifests-location).

Specify your URL under `properties` > `puppet_config` > `download`.

Example:

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          download: http://manifests.example.com/
          manifest:
            start: manifests/site.pp
          ...

{%endhighlight%}

### Embed Puppet manifests in the blueprint

The blueprint must contain a `.tar.gz` file. It's contents are extracted to the [`$cloudify_local_repo` directory](#puppet-manifests-location).

Specify your file path under `properties` > `puppet_config` > `download`. The `/` points to the blueprint directory.

Example:

{% highlight yaml %}
imports:
    - {{page.yaml_link}}

blueprint:
  name: example
  nodes:
    - name: example_web_server
      type: cloudify.types.puppet.web_server
      properties:
        puppet_config:
          download: /path/to/manifests.tgz
          manifest:
            start: manifests/site.pp
          ...
{%endhighlight%}

# Full examples

See the [examples repository](https://github.com/cloudify-cosmo/cloudify-examples)

