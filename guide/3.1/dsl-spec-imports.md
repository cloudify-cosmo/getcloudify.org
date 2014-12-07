---
layout: bt_wiki
title: Imports
category: DSL Specification
publish: true
abstract: "Importing YAML Files"
pageord: 300

---
{%summary%}
Imports provides a way of reusing blueprint yaml files [blueprint](reference-terminology.html#blueprint).
{%endsummary%}

Blueprint authors can declare imports in the `imports` section of the blueprint. You can use imports to reuse blueprint files or parts of them and use predeclared types (e.g. from the [types.yaml]() file).

# Imports Declaration

The `imports` section is a list where each item in the list represents a yaml file to import.

{%highlight yaml%}
imports:
  - ...
  - ...
{%endhighlight%}


## Imports Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
root        | no       | list        | A list of yaml files to import.

<br>

Example:

{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_0

imports:
  - http://www.getcloudify.org/spec/cloudify/3.1/types.yaml
  - my_yaml_files/openstack_types.yaml

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
  webserver:
    type: cloudify.nodes.WebServer
{%endhighlight%}

In the above example, we import the default types.yaml file provided by Cloudify which contains the `cloudify.nodes.WebServer` [node type]() and a custom yaml we created for our custom OpenStack plugin containing the `cloudify.openstack.nodes.Server` node type.

A few important things to know about importing yaml files:

* Imported files can be either relative to the blueprint's root directory or be a url (as seen above).
* yaml files are imported recursively. You can nest as many imports as you like.
* An error will be raised if there's a cycle of imports (i.e. a file is importing itself or importing a file which is importing the file that imported it, etc..)
* The following parts of the DSL cannot be imported:
    * Groups
    * Inputs
    * Node Templates
    * Outputs
* The `tosca_definitions_version` as stated [here](dsl-spec-versioning.html) must match between imported files.