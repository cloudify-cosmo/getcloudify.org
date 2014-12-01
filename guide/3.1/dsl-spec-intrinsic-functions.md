---
layout: bt_wiki
title: Intrinsic Functions
category: DSL Specification
publish: true
abstract: "Intrinsic Functions"
pageord: 300

---
{%summary%}{{page.abstract}}{%endsummary%}

# *get_input*

`get_input` is used for referencing `inputs` described in the inputs section of the blueprint.
It can be used in node properties, outputs, and node/relationship operation inputs.

For example:

{%highlight yaml%}
inputs:
  webserver_port:
    description: The HTTP web server port
    default: 8080

node_templates:
  ...

  http_web_server:
    type: cloudify.nodes.WebServer
    properties:
      port: { get_input: webserver_port }
    relationships:
      - type: cloudify.relationships.contained_in
        target: vm
    interfaces:
      cloudify.interfaces.lifecycle:
        configure: scripts/configure.sh
        start:
          implementation: scripts/start.sh
          inputs:
            process:
              env:
                port: { get_input: webserver_port }
        stop: scripts/stop.sh

outputs:
  webserver_port:
    description: Web server port
    value: { get_input: webserver_port }
{%endhighlight%}


# *get_property*

`get_property` is used for referencing node properties within the blueprint.

TBD...


# *get_attribute*

`get_attribute` is used to reference runtime properties of different node instances from within the blueprint.

## *get_attribute* in *outputs*

For this example, assume a `webserver_id` runtime property has been set on the `web_server` instance.

{% highlight yaml %}
node_templates:
  web_server
    type: cloudify.nodes.WebServer

outputs:
  web_server_id:
    description: Web server ID
    value: { get_attribute: [web_server, webserver_id] }
{%endhighlight%}

In the previous example, the `web_server_id` deployment output is configured to reference the `web_server` runtime property `webserver_id`. Each time the deployment outputs are evaluated, this reference is replaced with its current value.

## *get_attribute* in node interface operation inputs

For this example, assume a `connection_url` runtime property has been set on the `db_server` instance and a `requested_version` runtime property has been set on the `web_server` instance.

{% highlight yaml %}
node_templates:
  db_server:
    type: cloudify.nodes.DBMS
  web_server
    type: cloudify.nodes.WebServer
    interfaces:
      cloudify.interfaces.lifecycle
        create:
          ...
        configure:
          implementation: some_plugin.tasks.configure
          inputs:
            db_connection_url: { get_attribute: [db_server, connection_url] }
            webserver_version: { get_attribute: [SELF, requested_version] }
{%endhighlight%}

In the previous example, each time the `configure` operation of `web_server` instances is invoked, the inputs `db_connection_url` and `webserver_version` are evaluated. The `db_connection_url` input will evaluate to the `db_server` runtime property `connection_url` and the `webserver_version` will evaluate to the `web_server` runtime property `requested_version`. Notice how `SELF` is used to reference runtime properties of the current node instance in `webserver_version`.

## *get_attribute* in relationship interface operation inputs

For this example, assume a `connection_url` runtime property has been set on the `db_server` instance and a `requested_version` runtime property has been set on the `web_server` instance.

{% highlight yaml %}
node_templates:
  db_server:
    type: cloudify.nodes.DBMS
  web_server
    type: cloudify.nodes.WebServer
    relationships:
      - target: db_server
        type: cloudify.relationships.connected_to
        source_interfaces:
          cloudify.interfaces.relationship_lifecycle:
            preconfigure:
              implementation: some_plugin.tasks.my_preconfigure
              inputs:
                db_connection_url: { get_attribute: [TARGET, connection_url] }
                webserver_version: { get_attribute: [SOURCE, requested_version] }
{%endhighlight%}

In the previous example, each time the `preconfigure` relationship operation is invoked, the inputs `db_connection_url` and `webserver_version` are evaluated. The `db_connection_url` input will evaluate to the `db_server` runtime property `connection_url` and the `webserver_version` will evaluate to the `web_server` runtime property `requested_version`. Notice how `SOURCE` and `TARGET` are used to reference the relationship source and target node instances respectively.

## *get_attribute* nested properties and complex structures

Attribute access can be nested and is not restricted to top level properties. For this example, assume a `webserver_spec` runtime property has been set on the `web_server` instance with this value:
{% highlight json %}
{
  "requested_version": "11.2",
  "alternative_versions": ["11.3", "12.0"],
  "endpoints": {
    "endpoint_1": {
      "description": "Some endpoint of the web server",
      "url": "/endpoint1"
    },
    "endpoint_2": {
      "description": "Some other endpoint of the web server",
      "url": "/endpoint2"
    }
  }
}
{%endhighlight%}

With this value in place, nested properties can be accessed as follows:

{% highlight yaml %}
outputs:
  alt_version1:
    # will evaluate to "12.0"
    value: { get_attribute: [ web_server, webserver_spec, alternative_version, 1 ] }
  enpoint_2_url:
    # will evaluate to "/endpoint2"
    value: { get_attribute: [ web_server, webserver_spec, endpoints, endpoint_2, url ] }
  partial_spec:
    value:
      version: { get_attribute: [ web_server, webserver_spec, requested_version ] }
      alt_versions:
        version1: { get_attribute: [web_server, webserver_spec, alternative_versions, 0] }
        version2: { get_attribute: [web_server, webserver_spec, alternative_versions, 1] }
{%endhighlight%}

Notice how nested properties can be either a key name in case of a map or an index in case of a list. Also note from `partial_spec` that `get_attribute` can be used in complex data structures and not only in a flat key/value manner.

## Notes, restrictions and limitations

* If an attribute is not found in the inspected node instance runtime properties, the scan will fall back to the matching node properties. If the attribute is not found in the node properties as well, `null` is returned.
* `SELF` can only be used in interface operation inputs.
* `SOURCE` and `TARGET` can only be used in relationship interface operation inputs.

{%warning title=Note%}
When using `get_attribute` with explicit reference, that is, a node name `{ get_attribute: [ web_server, webserver_spec ] }` and not implicit reference such as `{ get_attribute: [ SELF, webserver_spec ] }`, if, at the time of evaluation, more than one node instance exists, an error is raised. This has significant implication when using `get_attribute` in node/relationship operation inputs, as it means the operation can not be executed.
{%endwarning%}
