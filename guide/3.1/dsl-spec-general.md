---
layout: bt_wiki
title: DSL Overview
category: DSL Specification
publish: true
abstract: Explains about Cloudify DSL and TOSCA
pageord: 100

terminology_link: dsl-spec-general.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Introduction
Cloudify 3's DSL (Domain Specific Language) is following [OASIS TOSCA](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=tosca) (Topology and Orchestration Specification for Cloud Applications). TOSCA has a [simplified YAML profile](https://www.oasis-open.org/committees/document.php?document_id=52571&wg_abbrev=tosca) and Cloudify 3 is following this YAML syntax as much as possible. Our goal is to have full compliance with the standrad in one of the near future versions.

TOSCA's simplified YAML profile is using YAML objects to describe application components, their lifecycle and  dependencies.

In order to do so, TOSCA is following Object Oriented metaphore where application components are `node_templates` (objects or instances of classes) derived from `node_types` (classes).

Each type defines a set of properties (static configuration) as well as set properties at runtime (i.e runtime properties)

In addition, each type includes operations (methods) which are the different lifecycle hooks mapped to implementation functions.



