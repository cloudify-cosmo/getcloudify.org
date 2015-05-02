---
layout: bt_wiki
title: Components Overview
category: Product Architecture and Flows
publish: true
abstract: Overview of the different components Cloudify is comprised of
pageord: 200

terminology_link: reference-terminology.html
diamond_plugin_link: plugin-diamond.html
---
{%summary%} {{page.abstract}}{%endsummary%}

{%note title=Note%}
This is aimed at very advanced users to understand Cloudify's architecture. It provides no user-functional information whatsoever. It does, however, provide information for understanding how Cloudify's architecture supports currently implemented and even potential future flows. Operational knowledge assumed.
{%endnote%}

# Components Overview

Cloudify's Manager comprises (mainly) of the following open-source components:

* [Nginx](http://nginx.com/)
* [Elasticsearch](https://www.elastic.co/products/elasticsearch)
* [Logstash](https://www.elastic.co/products/logstash)
* [RabbitMQ](http://www.rabbitmq.com/)
* [Riemann](http://riemann.io/)
* [Celery](http://www.celeryproject.org/)
* [Grafana](http://grafana.org/)
* [InfluxDB](http://influxdb.com/)
* [Flask](http://flask.pocoo.org/)
* [Gunicorn](http://gunicorn.org/)

Cloudify's code and the components' configuration is what makes Cloudify.. well.. Cloudify.

![Cloudify components](/guide/images3/architecture/cloudify_advanced_architecture.png)

## Ports and Entry Points

### External

By default, there are two external networks from which Cloudify's Management Environment is accessed:

* The network where the CLI resides - potentially a user's `management network`.
* The network where the application resides - potentially a user's application network.

Therefore, Cloudify aims to have only two entry points to its Management Environment:

* Ports 80/443 for user rest-service/UI access via Nginx.
* Port 5672 for application access via RabbitMQ.

* Port 53229 is currently exposed for FileServer access (Will be done via ports 80/443 in a future version.)
* Port 22 is currently exposed for SSH access so that the CLI is able to bootstrap Cloudify's Management Environment. While this is currently a requirement by our default bootstrap method in the CLI, using userdata/cloudinit to bootstrap will make this requirement obsolete as long as it's understand that `cfy ssh` will not work.
* Currently, the only "outside" access to the management environment not done through one of these entry points is the Host Agent accessing Nginx directly rather than through RabbitMQ to update the application's model (for instance, when runtime-properties are set). This will be changed in future versions to reflect security requirements.

### Internal

Internally, the following ports are exposed:

* The REST service is accessed via port 8100.
* The UI is accessed via port 9100.
* Nginx exposes port 8101 for internal REST access.
* Elasticsearch exposes its standard 9200 port for HTTP API access.
* RabbitMQ exposes 5672 internally as well.
* InfluxDB exposes its standard 8086 port for HTTP API access.
* Logstash exposes a dummy 9999 port for liveness verification.

## Elasticsearch Indices

Elasticsearch is initially provisioned with two indices:

* `cloudify_storage` - Used for storing the data model (Blueprints, Deployments, Runtime Properties, etc..)
* `cloudify_events` - Used for storing logs and events (We will probably split to two indices at some point in the future.)

The indices and their mappings are generated at build time and are provided within the Docker image(s). To keep the indices and their data persistent, they are mapped to a Data Container.

## Management and Deployment Specific Agents

Both the `deployment workflow agent` and the `deployment agent` drawn in the diagram are deployment specific. For every deployment created, 2 of these agents are spawned.

In addition to these agents, an entity removed from the diagram is a management agent containing a Cloudify plugin able to spawn the deployment specific agents. This agent is provided within the Docker image and is run during the bootstrap process.

Note that all agents (Management, Deployment Specific, Host) are actually the same physical entity (a virtualenv with Python modules - Cloudify plugins installed in them).

## File Server

The fileserver served by Nginx, while tied to Nginx by default, is not logically bound to it. That is, while we currently access it directly in several occurences (via disk rather than via network), we will be working towards having it completely decoupled from the management environment itself so that it can be deployed anywhere.

## Metrics Consumer

Another entity not drawn in the diagram is a propriatary poller we use to consume metrics from RabbitMQ and feed them into InfluxDB.
