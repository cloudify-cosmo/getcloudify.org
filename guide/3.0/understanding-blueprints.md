---
layout: bt_wiki
title: Understanding Blueprints
category: Understanding Blueprints
publish: false
abstract: Explains how Cloudify Blueprints are composed, theor parts and their syntax
pageord: 300
--- 

# Overview
Cloudify Blueprints are cloud application orchestration plans. The main part of the plan is written in a declarative YAML DSL (Doamin Specific Language). Cloudify DSL is following the concepts of [OASIS TOSCA](http://www.oasis-open.org/committees/tc_home.php?wg_abbrev=tosca) (Topology and Orchestration Standard for Cloud Application)

Blueprints has 2 main sections:
* **Topology** - the application topology denotes as `nodes`
* **Worflows** - the different automation process for the application 


# What's in a Topology?
A Topology is a graph of application components and their relationships described in YAML. You can think about it as application components being the vertices of the graph and the relationships being the edges of the graph. Each component is described by a YAML object denoted as a YAML list entry. 

Components can be of 3 levels:
* **Infrastructrue** - Components provided by the IaaS layer (e.g. VM, virtual network, virtual load balancer or storage volume) or by non-cloud phyiscal or virtualized layer (e.g. Host and storage voluem)
* **Platform / Middleware** - Components that serve as the application containers (such as webservers, application servers, message servers and database servers)
* **Application modules** - The different application artifacts that needs to be deployed and configured on top of the middleware (such as application binaries, application configuration files, database schemas etc) 


The Topology section root element is `nodes` (YAML list) and the nodes themsleves are denoted as entries in the list
# Nodes

## Types and Type implementations

## Node Properties

## Relationships, Requirements & Capabilities

# Workflows

## What is a Workflow?


## Built-in Workflows


## Custom Workflows


# Built-in Types and Interfaces
## Portable Types
## Interfaces
## Relationship types
## Implemtation types

# The runtime model
