---
layout: bt_wiki
title: Inputs
category: DSL Specification
publish: true
pageord: 200

---
{%summary%}
Inputs are parameters injected into the [blueprint](reference-terminology.html#blueprint) upon [deployment](reference-terminology.html#deployment) creation. These parameters can be referenced by using the [get_input](dsl-spec-intrinsic-functions.html#get_input) intrinsic function.
{%endsummary%}

Blueprint authors can declare input parameters in the `inputs` section of the blueprint. This is useful when there's a need to inject parameters to the blueprint which were unknown when the blueprint was created and can be used for distinction between different deployments of the same blueprint.

## Inputs Declaration

The inputs section is a hash where each item in the hash represents an input.

{%highlight yaml%}
inputs:
  input1:
    ...
  input2:
    ...  
{%endhighlight%}


### Input Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
description | no       | description | An optional description for the input.
type        | no       | string      | Represents the required data type of the input. If not specifying a data type means the type can be anything. Valid types: string, integer, boolean
default     | no       | \<any\>     | An optional default value for the input.


<br>


Example:

{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_0

imports:
  - http://www.getcloudify.org/spec/cloudify/3.1/types.yaml
  - http://www.getcloudify.org/spec/openstack-plugin/1.1/plugin.yaml

inputs:
  image_name:
    description: The server's image name
    type: string
    default: "Ubuntu 12.04"

node_templates:
  vm:
    type: cloudify.openstack.nodes.Server
    properties:
      server:
        image_name: { get_input: image_name }
{%endhighlight%}

