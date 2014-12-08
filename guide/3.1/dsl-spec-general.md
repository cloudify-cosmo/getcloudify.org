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
Cloudify 3.1 DSL (Domain Specific Language) is following OASIS TOSCA (Topology and Orchestration Specification for Cloud Applications). TOSCA has a simplified YAML profile and Cloudify 3.1 is following this YAML syntax as much as possible. Our goal is to have full compliance to the standrad in one of the near future versions

TOSCA simplified YAML profile is using YAML objects to describe application components; their lifecycele and  dependencies.
 
In order to do so TOSCA is following Object Oriented mathaphore where application components are node templates (objects or instances of classes) derived from types (classes)

Each type defines a set of properties (static configuration) as well as runtime attributes (dynamic configuration)

In addition, exch type includes operations (methods) which are the different lifecycle hooks mapped to implementation functions.



