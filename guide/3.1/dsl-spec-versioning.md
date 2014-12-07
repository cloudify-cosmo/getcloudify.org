---
layout: bt_wiki
title: Versioning
category: DSL Specification
publish: true
abstract: "Cloudify DSL Versioning"
pageord: 300

---
{%summary%}A mechanism for specifying the DSL version used in the [blueprint](reference-terminology.html#blueprint).{%endsummary%}

`tosca_definitions_version` is a top level property of the blueprint which is used the specify the DSL version used.
For Cloudify 3.1, the only version that is currently defined is `cloudify_dsl_1_0`.

The version declaration must be included in the main blueprint. It may also be included in yaml files that are imported in it (transitively), in which case, the version specified in the imports must match the version specified in the main blueprint.

In future Cloudify versions, as the DSL specification evolves, this mechanism will enable providing backward compatibility for blueprints written in older version.

<br>

Example:
{%highlight yaml%}
tosca_definitions_version: cloudify_dsl_1_0

node_templates:
    ...
{%endhighlight%}
