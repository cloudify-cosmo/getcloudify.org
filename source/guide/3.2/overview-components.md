---
layout: bt_wiki
title: Manager Components Overview
category: Product Overview
publish: true
abstract: Overview of the different components Cloudify is comprised of
pageord: 200

terminology_link: reference-terminology.html
diamond_plugin_link: plugin-diamond.html
---
{%summary%} {{page.abstract}}{%endsummary%}

{%note title=Note%}
This is aimed at advanced users to understand Cloudify's architecture. It provides no user-functional information whatsoever. It does, however, provide information for understanding how Cloudify's architecture supports currently implemented and even potential future flows. Operational knowledge assumed.
{%endnote%}

# Overview

Cloudify's Manager comprises (mainly) of the following open-source components:

* [Nginx](#nginx)
* [Gunicorn](#gunicorn-and-flask)
* [Flask](#gunicorn-and-flask)
* [Elasticsearch](#elasticsearch)
* [Logstash](#logstash)
* [RabbitMQ](#rabbitmq)
* [Riemann](#riemann)
* [Celery](#celery)
* [InfluxDB](#influxdb-and-grafana)
* [Grafana](#influxdb-and-grafana)

Cloudify's code and the components' configuration is what makes Cloudify.. well.. Cloudify.

![Cloudify components](/guide/images3/architecture/cloudify_advanced_architecture.png)

## Ports and Entry Points

Rather than specifying the ports in each component's overview, ports are specified here so that you can easily review network requirements.

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

# Nginx

[Nginx](http://nginx.com/) is a highly performant web server.

In Cloudify's Manager, Nginx serves two purposes:

* A Proxy for Cloudify's REST service and Web UI
* A File Server to host Cloudify specific resources, agent packages and blueprint resources.

## File Server

The fileserver served by Nginx, while tied to Nginx by default, is not logically bound to it. That is, while we currently access it directly in several occurences (via disk rather than via network), we will be working towards having it completely decoupled from the management environment itself so that it can be deployed anywhere.

# Gunicorn and Flask

[Gunicorn](http://gunicorn.org/) is a WSGI HTTP server. [Flask](http://flask.pocoo.org/) is a web framework.

Gunicorn and Flask together serve as Cloudify's REST service. The REST service itself is written using Flask while Gunicorn is the server. Nginx, is the proxy to that server.
Essentially, Cloudify's REST service is what makes Cloudify tick and is the integrator of all parts of the the system.

# Elasticsearch

[Elasticsearch](https://www.elastic.co/products/elasticsearch) is a JSON based document store.

In Cloudify's Manager, Elasticsearch serves two purposes:

* Main DB which holds the application's model (i.e. blueprints, deployments, runtime properties)
* Indexing and Storing Logs and Events

## Indices

Elasticsearch is initially provisioned with two indices:

* `cloudify_storage` - Used for storing the data model (Blueprints, Deployments, Runtime Properties, etc..)
* `cloudify_events` - Used for storing logs and events (We will probably split to two indices at some point in the future.)

The indices and their mappings are generated at build time and are provided within the Docker image(s). To keep the indices and their data persistent, they are mapped to a Data Container.

# Logstash

[Logstash](https://www.elastic.co/products/logstash) is a data handler. It can pull/push messages using several inputs, apply filters and output to different outputs.

Logstash is used by Cloudify to pull log and event messages from RabbitMQ and index them in Elasticsearch.

# RabbitMQ

[RabbitMQ](http://www.rabbitmq.com/) is a queue based messaging platform.

RabbitMQ is used by Cloudify as a message queue for different purposes:

* Queuing deployment tasks
* Queuing Logs and Events
* Queuing Metrics

Currently not all requests between Cloudify's Manager and the hosts it manages go through RabbitMQ. We aim to make it so.

# Riemann

[Riemann](http://riemann.io/) is an event stream processor used mainly for monitoring.

Riemann is used within Cloudify as a policy based decision maker. For more information on policies, refer to the [policies](policies-general.html) section.

# Celery

[Celery](http://www.celeryproject.org/) is a distributed task queue.

Cloudify's Management Worker, the Deployment Specific agents and the host agents are based on Celery.

## Deployment Specific Agents

Both the `deployment workflow agent` and the `deployment agent` drawn in the diagram are deployment specific. For every deployment created, two of these agents are spawned.

* The `deployment workflow agent` executes deployment specific workflows.
* The `deplomyent workflow` executes API calls to IaaS providers to create deployment resources or submits tasks to RabbitMQ so that host agents can execute them.

Note that all agents (Management, Deployment Specific, Host) are actually the same physical entity (a virtualenv with Python modules - Cloudify plugins installed in them).

## Management Worker (or Agent)

An entity removed from the diagram is a management agent containing a Cloudify plugin able to spawn the aforementioned deployment specific agents. This agent is provided within the Docker image and is run during the bootstrap process.

# InfluxDB and Grafana

[InfluxDB](http://influxdb.com/) is a time series database. [Grafana](http://grafana.org/) is a graphical dashboard for InfluxDB.

* A proprietary metrics consumer is used to pull metrics from RabbitMQ and submit them to InfluxDB.
* InfluxDB is used by Cloudify to store metrics submitted (mainly) by the application's hosts.
* Grafana is embedded within Cloudify's Web UI to graph metrics stored within InfluxDB.