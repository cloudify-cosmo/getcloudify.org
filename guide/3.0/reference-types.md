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

* `cloudify.types.base` - The base type for all built-in types. declares the `lifecycle interface`

* `cloudify.types.tier` - A marker for a future scale group

* `cloudify.types.host` - A compute resource either a virtual or a physical host


* `cloudify.types.container` - A logical partition in a host such as [linux container](http://en.wikipedia.org/wiki/LXC) or [docker](https://www.docker.io/)

* `cloudify.types.network` - A virtual network

* `clouydify.types.subnet` - A virtual segment of IP addresses in a network

* `cloudify.types.router` - A virtual layer 3 router

* `cloudify.types.port` - An entry in a virtual subnet. Can be used in some clouds to secure a static private IP

* `cloudify.types.virtual_ip` - A virtual IP implemented as [NAT](http://en.wikipedia.org/wiki/Network_address_translation) or in another manner

* `cloudify.types.security_group` - A cloud security group (VM network access rules)

* `cloudify.types.load_balancer` - A virtualized Load Balancer

* `cloudify.types.volume` - A persistent block storage volume

* `cloudify.types.object_container` - A BLOB storage segment

* `cloudify.types.middleware_server` - A base type for all middleware level types

* `cloudify.types.web_server` - A web server
	* properties:
		* `port` - the webserver port

* `cloudify.types.app_server` - An application server

* `cloudify.types.db_server` - a Database

* `cloudify.types.message_bus_server` - a message bus server

* `cloudify.types.app_module` - a base type for any application module or artifact
