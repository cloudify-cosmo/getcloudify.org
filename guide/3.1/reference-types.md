---
layout: bt_wiki
title: Types Reference
category: Reference
publish: true
abstract: "Reference for Cloudify built in types"
pageord: 300

terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Abstract Types
The following [types]({{page.terminology_link}}#type) are basic types from which concrete types with specific plugin implementations are derived.

* `cloudify.nodes.Root` - The base type for all built-in types. declares the following interfaces:

  - `cloudify.interfaces.lifecycle`: An interface for standard life cycle operations (e.g. create, start, stop, etc.). Operations of this interface are called from the [built-in](guide-workflows.html#built-in-workflows) [*install*](reference-builtin-workflows.html#install) and [*uninstall*](reference-builtin-workflows.html#uninstall) workflows.
  - `cloudify.interfaces.validation`: An interface for pre-creation and pre-deletion validation operations. These may be called by using the [*execute_operation*](reference-builtin-workflows.html#execute-operation) built-in workflow or by a [custom workflow](guide-workflows.html#writing-a-custom-workflow). The Cloudify CLI calls these operations before the bootstrap and teardown of the Cloudify manager.
  - `cloudify.interfaces.monitoring_agent`: An interface for monitoring agent. Operations of this interface are called from the [built-in](guide-workflows.html#built-in-workflows) [*install*](reference-builtin-workflows.html#install) and [*uninstall*](reference-builtin-workflows.html#uninstall) workflows.
  - `cloudify.interfaces.monitoring`: An interface for monitoring configuration. Operations of this interface are called from the [built-in](guide-workflows.html#built-in-workflows) [*install*](reference-builtin-workflows.html#install) and [*uninstall*](reference-builtin-workflows.html#uninstall) workflows.

* `cloudify.nodes.Tier` - A marker for a future scale group

* `cloudify.nodes.Compute` - A compute resource either a virtual or a physical host


* `cloudify.nodes.Container` - A logical partition in a host such as [linux container](http://en.wikipedia.org/wiki/LXC) or [docker](https://www.docker.io/)

* `cloudify.nodes.Network` - A virtual network

* `clouydify.nodes.Subnet` - A virtual segment of IP addresses in a network

* `cloudify.nodes.Router` - A virtual layer 3 router

* `cloudify.nodes.Port` - An entry in a virtual subnet. Can be used in some clouds to secure a static private IP

* `cloudify.nodes.VirtualIP` - A virtual IP implemented as [NAT](http://en.wikipedia.org/wiki/Network_address_translation) or in another manner

* `cloudify.nodes.SecurityGroup` - A cloud security group (VM network access rules)

* `cloudify.nodes.LoadBalancer` - A virtualized Load Balancer

* `cloudify.nodes.Volume` - A persistent block storage volume

* `cloudify.nodes.ObjectStorage` - A BLOB storage segment

* `cloudify.nodes.SoftwareComponent` - A base type for all middleware level types

* `cloudify.nodes.WebServer` - A web server
	* properties:
		* `port` - the webserver port

* `cloudify.nodes.ApplicationServer` - An application server

* `cloudify.nodes.DBMS` - a Database

* `cloudify.nodes.MessageBugServer` - a message bus server

* `cloudify.nodes.ApplicationModule` - a base type for any application module or artifact
