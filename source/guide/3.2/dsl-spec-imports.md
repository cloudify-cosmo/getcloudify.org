---
layout: bt_wiki
title: Imports
category: Blueprints DSL
publish: true
abstract: "Importing YAML Files"
pageord: 300

types_yaml_link: http://www.getcloudify.org/spec/cloudify/3.2/types.yaml
terminology_link: reference-terminology.html
dsl_node_types_link: dsl-spec-node-types.html
dsl_groups_link: dsl-spec-groups.html
dsl_inputs_link: dsl-spec-inputs.html
dsl_outputs_link: dsl-spec-outputs.html
dsl_node_templates_link: dsl-spec-node-templates.html
dsl_versioning_link: dsl-spec-versioning.html
---
{%summary%}{{page.abstract}}{%endsummary%}
{%summary%}
Imports provides a way of reusing [blueprint]({{page.terminology_link}}#blueprint) YAML files .
{%endsummary%}

Blueprint authors can declare imports in the `imports` section of the blueprint. You can use imports to reuse blueprint files or parts of them and use predefined types (e.g. from the [types.yaml]({{page.types_yaml_link}}) file).

# Imports Declaration

The `imports` section is a list where each item in the list represents a YAML file to import.

{%highlight yaml%}
imports:
  - ...
  - ...
{%endhighlight%}


Example:

{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_0

imports:
  - {{page.types_yaml_link}}
  - my_yaml_files/openstack_types.yaml

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  webserver:
    type: cloudify.nodes.WebServer
{%endhighlight%}

In the above example, we import the default types.yaml file provided by Cloudify which contains the `cloudify.nodes.WebServer` [node type]({{page.dsl_node_types_link}}) and a custom YAML we created for our custom OpenStack plugin containing the `cloudify.openstack.nodes.Server` node type.

A few important things to know about importing YAML files:

* Imported files can be either relative to the blueprint's root directory or be a URL (as seen above).
* YAML files are imported recursively. You can nest as many imports as you like.
* An error will be raised if there are cyclic imports (i.e. a file is importing itself or importing a file which is importing the file that imported it, etc..)
* The following parts of the DSL cannot be imported and can only be defined in the [main blueprint file]({{page.terminology_link}}#main-blueprint-file):
    * [groups]({{page.dsl_groups_link}})
    * [inputs]({{page.dsl_inputs_link}})
    * [node_templates]({{page.dsl_node_templates_link}})
    * [outputs]({{page.dsl_outputs_link}})
* The `tosca_definitions_version` as stated [here]({{page.dsl_versioning_link}}) must match between imported files.