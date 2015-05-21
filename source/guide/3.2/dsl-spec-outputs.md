---
layout: bt_wiki
title: Outputs
category: Blueprints DSL
publish: true
pageord: 200

---
{%summary%}
Outputs provide a way of exposing global aspects of a [deployment](reference-terminology.html#deployment).
{%endsummary%}

Blueprint authors can declare outputs in the `outputs` section of the blueprint. You can use outputs to expose aspects of a deployment, such as the endpoint details of a webserver.

## Outputs Declaration

The `outputs` section is a hash where each item in the hash represents an output.

{%highlight yaml%}
outputs:
  output1:
    ...
  output2:
    ...
{%endhighlight%}


### Output Definition

Keyname     | Required | Type        | Description
----------- | -------- | ----        | -----------
description | no       | description | An optional description for the output.
value       | yes      | \<any\>     | The output value. Can be anything from a simple value (e.g. port) to a complex value (e.g. hash with values). Output values can contain hardcoded values, [inputs](dsl-spec-intrinsic-functions.html#getinput), [properties](dsl-spec-intrinsic-functions.html#getproperty) and [attributes](dsl-spec-intrinsic-functions.html#getattribute).


<br>

Example:

{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_0

imports:
  - http://www.getcloudify.org/spec/cloudify/3.1/types.yaml

node_templates:
  webserver_vm:
    type: cloudify.nodes.Compute
  webserver:
    type: cloudify.nodes.WebServer
    properties:
        port: 8080

output:
    webapp_endpoint:
        description: ip and port of the web application
        value:
            ip: { get_attribute: [webserver_vm, ip] }
            port: { get_property: [webserver, port] }
{%endhighlight%}

## Reading Outputs
You can view the outputs either by using the [cfy](reference-cfy.html) CLI
{% highlight bash %}
cfy deployments outputs -d DEPLOYMENT_ID
{% endhighlight %}
or by making a REST call
{% highlight bash %}
curl -XGET http://MANAGER_IP/deployments/<DEPLOYMENT_ID>/outputs
{% endhighlight %}
