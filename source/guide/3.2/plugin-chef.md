---
layout: bt_wiki
title: Chef Plugin
category: Plugins
publish: true
abstract: "Chef plugin description and configuration"
pageord: 200

yaml_link: http://getcloudify.org/spec/chef-plugin/1.1/plugin.yaml
---
{%summary%}
{%endsummary%}


# Description

The Chef plugin can be used to map node life cycle operations to Chef runs.
You can use the plugin to run either Chef Client or Chef Solo.


# Plugin Requirements:

* Python Versions:
  * 2.7.x


# Chef plugin usage options

The usage option is chosen based on presence or absence of specific properties under node's `properties` > `chef_config`. Chef is installed on demand, if there is no lifecycle operation that needs Chef run - it is not installed.

* Chef Client requires the following properties:
  * `chef_server_url`
  * `environment`
  * `node_name_prefix`
  * `node_name_suffix`
  * `validation_client_name`
  * `validation_key`
  * `version`
* Chef Solo requires the following properties:
  * `cookbooks`
  * `version`

It's an error if neither of the two sets appear. You will see "Failed to find appropriate Chef manager ..." in logs if that's the case.

Example:
{% highlight yaml %}
imports:
  - {{page.yaml_link}}
node_templates:
  example_web_server:
    type: cloudify.chef.nodes.WebServer
    properties:
      chef_config:
        cookbooks: http://chef.example.com/v1/cookbooks.tgz  # Solo
          ...
{%endhighlight%}

# Types

Node types that can be used for Chef nodes are listed below. All of them are derived from the corresponding [abstract types](reference-types.html#abstract-types).

* `cloudify.chef.nodes.SoftwareComponent` -- derived from `cloudify.nodes.SoftwareComponent`
* `cloudify.chef.nodes.ApplicationServer` -- derived from `cloudify.nodes.ApplicationServer`
* `cloudify.chef.nodes.DBMS` -- derived from `cloudify.nodes.DBMS`
* `cloudify.chef.nodes.ApplicationModule` -- derived from `cloudify.nodes.ApplicationModule`
* `cloudify.chef.nodes.WebServer` -- derived from `cloudify.nodes.WebServer`

In addition to inherited properties all of the Chef types have the following properties:

**Properties for Chef Client and Chef Solo:**

* `chef_config` contains all Chef specific configuration.
	* `attributes` (optional) - [attributes to pass to Chef](#blueprint-provided-attributes).
	* `runlist` (optional) - [runlist for all operations](#specifying-runlists).
	* `runlists` (optional) - [per-operation runlists](#specifying-runlists).
		* OPNAME - runlist for the OPNAME lifecycle operation.
	* `version` (required) - [Chef version to install](#chef-version-to-install).

**Properties for Chef Client only:**

* `chef_config` contains all Chef specific configuration
	* `chef_server_url` (required)
	* `environment`(required)
	* `node_name_prefix` - [Chef node name](#chef-server-naming) prefix.
	* `node_name_suffix` - [Chef node name](#chef-server-naming) suffix.
	* `validation_client_name` (required)
	* `validation_key` (required) - validation file contents.

See [Chef Client Configuration](#chef-client-configuration) section for more information about Chef Client properties.

**Properties for Chef Solo only:**

* `chef_config` contains all Chef specific configuration
	* `cookbooks` (Chef solo only, required) - URL or path in blueprint designating a .tar.gz file that contains cookbooks.
	* `data_bags` (Chef solo only, required) - URL or path in blueprint designating a .tar.gz file that contains data bags' JSON files.
	* `environments` (Chef solo only, required) - URL or path in blueprint designating a .tar.gz file that contains environments' JSON files.
	* `roles` (Chef solo only, required) - URL or path in blueprint designating a .tar.gz file that contains roles' JSON files.

See [Chef Solo Configuration](#chef-solo-configuration) section for more information about Chef Client properties.

# Integration

This section describes integration aspects that are common to both Chef Client and Chef Solo. Also see [Chef Solo](#chef-Solo) and [Chef Client](#chef-Client) sections for additional integration details.


## Operation naming

When defining a YAML node, there are several places that contain per-operation configuration. Most of the operations in Cloudify are named `cloudify.interfaces.lifecycle.*` and `cloudify.interfaces.relationship_lifecycle.*`. For convenience, when defining a node, the operation names are shortened so only the last part is used. Example:

{% highlight yaml %}
imports:
  - {{page.yaml_link}}
node_templates:
  example_web_server:
    type: cloudify.chef.nodes.WebServer
    properties:
      chef_config:
        ...
        runlists:
          start: 'recipe[my_org_webserver::start]'  # cloudify.interfaces.lifecycle.start
          stop:  'recipe[my_org_webserver::stop]'   # cloudify.interfaces.lifecycle.stop
{%endhighlight%}

## Specifying runlist(s)
Under `properties` > `chef_config` you must specify either `runlist` or `runlists`.

If `runlist` is given, it is used for all lifecycle operations. Example.

{% highlight yaml %}
imports:
  - {{page.yaml_link}}
node_templates:
  example_web_server:
    type: cloudify.chef.nodes.WebServer
    properties:
      chef_config:
        ...
        runlist: 'recipe[my_org_webserver::start]'  # cloudify.interfaces.lifecycle.*
{%endhighlight%}

If `runlists` is given, you can specify per-operation runlist. Operations with no runlist specified (under `runlists` > OPNAME) will not cause a Chef run.

{%note title=Note%}
A runlist can be a string (such as `recipe[my_super_recipe]`) or a list of such strings. See the following example.
{%endnote%}

Example:

{% highlight yaml %}
imports:
  - {{page.yaml_link}}
node_templates:
  example_web_server:
    type: cloudify.chef.nodes.WebServer
    properties:
      chef_config:
        ...
        runlists:
          start: 'recipe[my_org_webserver::start],role[my-org-base]'  # cloudify.interfaces.lifecycle.start
          stop:                                                       # cloudify.interfaces.lifecycle.stop
              - 'recipe[my_org_webserver::stop]'
              - 'recipe[my_org_webserver::cleanup]'
{%endhighlight%}

## Chef version to install

You must specify which Chef version to install (to use as Client or Solo) under `properties` > `chef_config` > `version`. There is no default, `version` is required. You must use the same version for all YAML nodes which reside on the same server.

Example:
{% highlight yaml %}
imports:
  - {{page.yaml_link}}
node_templates:
  example_web_server:
    type: cloudify.chef.nodes.WebServer
    properties:
      chef_config:
        version: 11.10.4-1
        ...
{%endhighlight%}


## Automatic Chef attributes

This section applies to both Chef Client and Chef Solo.

To allow integration of Chef, Cloudify supplies custom attributes to Chef. These contain Cloudify information such as properties of the Cloudify node.

### Blueprint provided attributes
All attributes provided in the blueprint, under `properties` > `chef_config` > `attributes` are passed to Chef.

{%note title=Note%}
`attributes` must not contain `cloudify` as it is clashing with the automatically provided attributes.
{%endnote%}

### Cloudify-specific attributes for all operations:

* `node['cloudify']['node_id']` - The node instance id for which Chef is run
* `node['cloudify']['blueprint_id']` -  The blueprint id
* `node['cloudify']['deployment_id']` -  The deployment id
* `node['cloudify']['properties']` -  Properties of the node for which Chef is run (see example below)
* `node['cloudify']['runtime_properties']` -  Run-time properties of the node for which Chef is run
* `node['cloudify']['capabilities'][OTHER_NODE_ID][OTHER_NODE_RUNTIME_PROP]` -  Run-time properties of related nodes.

### Cloudify-specific attributes for operations involving two nodes:

* `node['cloudify']['related']['node_id']` - The node instance id of the related node
* `node['cloudify']['related']['properties']` -  Properties of the related node
* `node['cloudify']['related']['runtime_properties']` -  Run-time properties of the related node



## Node properties as Chef attributes example:

Say the node properties are:
{% highlight yaml %}
node_templates:
  some node:
    type: some_type
    properties:
      some_prop: some_value
      some_map:
        prop1: value1
        prop2: value2
{%endhighlight%}

The following Chef attributes will be available:

* `node['cloudify']['properties']['some_prop']`
* `node['cloudify']['properties']['some_map']['prop1']`
* `node['cloudify']['properties']['some_map']['prop2']`

## Importing Chef attributes to runtime properties

After each Chef run, Cloudify will automatically store all the Chef attributes (as they are seen at the end of Chef run) in the runtime properties of the Cloudify node instance that cause the Chef run. The Chef attributes will be stored under runtime properties > `chef_attributes`.

{%note title=Info%}
For the export purposes, the attributes are stored in a temporary file named `node['cloudify']['attributes_output_file']` (which must not be changed) by Cloudify's Chef handler.
{%endnote%}

## Using other node's Cloudify properties or Chef attributes

When specifying `properties` > `chef_config` > `attributes`, you can use references to runtime properties and/or Chef attributes of other Cloudify nodes.

{%note title=Note%}
Make sure that the runtime properties and the Chef attributes you are referencing reside in a Cloudify node instance which has already done the required operation (for the properties/attributes to be there). I.e. make sure you have defined the correct relations between the referencing and the referenced nodes.
{%endnote%}

The reference is done using specifically constructed hash in place where the value should be specified. The options are:

* `{related_chef_attribute: path.to.something}`
* `{related_runtime_property: path.to.something}`

Example:
{% highlight yaml %}
imports:
  - {{page.yaml_link}}
node_templates:
  example_web_server:
    type: cloudify.chef.nodes.WebServer
    ...
    properties:
      chef_config:
        ...
        attributes:
          db:
            host: {related_chef_attribute: ipaddress}
            port: {related_chef_attribute: db.port} # node['db']['port'] of example_db_server
            user: {related_chef_attribute: db.user}
            pass: {related_chef_attribute: db.pass}
            some_val: {related_runtime_property: some.other.prop}
    relationships:
      - type: cloudify.relationships.connected_to
        target: example_db_server

  example_db_server:
    type: cloudify.chef.nodes.DBMS
    ...
    properties:
      chef_config:
        ...
        attributes:
          db_port: 27017
{%endhighlight%}


# Chef Solo

## Configuration
* `properties` > `chef_config` > `cookbooks` (required) - URL or relative path in blueprint to a .tar.gz file containing the cookbooks you wish to use. Usually, it's the "cookbooks" directory. For convenience, you can use either archive "*" in the directory or "cookbooks/*" in the directory above and Cloudify will handle both cases correctly. Sample values: `http://chef.example.com/v1/cookbooks.tgz`, `/path/to/cookbooks.tgz` (`/` is the top level cookbook directory).
* `properties` > `chef_config` > `environments`/`data_bags`/`roles` (optional) - same as cookbooks but for environments, data bags and roles.
* `properties` > `chef_config` > `environment` (optional, Chef v11.8 and later) - Chef environment to use

# Chef Client

## Requirements

* Existing Chef server which should be:
  * Resolvable (DNS or hosts file)
  * Loaded with appropriate roles, cookbooks, data bags, etc.


## Chef server naming

Chef node name is constructed by concatenation of `node_name_prefix`, node id and `node_name_suffix`. Both `node_name_prefix` and `node_name_suffix` are required. Node id is not guaranteed to follow any specific convention.

* Chef Client requires the following properties under `properties` > `chef_config`:
  * `node_name_prefix`
  * `node_name_suffix`

## Chef Client Configuration

Chef configuration properties correspond to [properties in client.rb](http://docs.opscode.com/config_rb_client.html) with the exceptions explained below:

* Chef Client requires the following properties under `properties` > `chef_config`:
  * `chef_server_url`
  * `environment`
  * `node_name_prefix` - Cloudify specific, see [Chef server naming](#chef-server-naming)
  * `node_name_suffix` - Cloudify specific, see [Chef server naming](#chef-server-naming)
  * `validation_client_name` (usually `chef-validator`)
  * `validation_key` - contents for the validation file (as opposed to file path originally), should have the form of `"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"`.

# Examples

Sample Chef YAML node:
{% highlight yaml %}
node_temlates:
  chef_node_one:
    type: cloudify.chef.nodes.DBMS
    properties:
      chef_config:
        version: 11.10.4-1

        # ALT 1: server
        chef_server_url: https://10.20.30.40:443
        validation_client_name: chef-validator
        validation_key: |
          -----BEGIN RSA PRIVATE KEY-----
          ...
          -----END RSA PRIVATE KEY-----
        node_name_prefix: chef-node-
        node_name_suffix: .cloudify.example.com

        ### # ALT 2: solo
        ### cookbooks: http://10.20.30.41:50000/cookbooks.tar.gz

        environment: _default
        attributes:
          test_attr_1: test_val_1
          create_file:
            file_name: /tmp/blueprint.txt
            file_contents: Great success!
        runlists:
          create: recipe[create-file]
    relationships:
      - type: cloudify.relationships.contained_in
        target: my_server
{%endhighlight%}
