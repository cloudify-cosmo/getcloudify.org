---
layout: bt_wiki
title: Architecture Overview (Advanced)
category: Product Overview
publish: true
abstract: Explains Advanced Flows and structure in Cloudify's Architecture
pageord: 200

terminology_link: reference-terminology.html
diamond_plugin_link: plugin-diamond.html
---
{%summary%} {{page.abstract}}{%endsummary%}

{%note title=Note%}
This is aimed at very advanced users to understand Cloudify's architecture and provides no user-functional information whatsoever. It does, however, provide information for understanding how Cloudify's architecture supports currently implemented and even potential future flows. Operational knowledge assumed.
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

* The network where the CLI resides - potentially a user's management network.
* The network where the application resides - potentially a user's application network.

Therefore, Cloudify aims to have only two entry points to its Management Environment:

* Ports 80/443 for user rest-service/UI access via Nginx.
* Port 5672 for application access via RabbitMQ.

* Port 53229 is currently exposed for FileServer access (Will be done via ports 80/443 in a future version.)
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

Note that all agents (Management, Deployment Specific, Host) are actually the same physical entity (A Virtualenv with Python modules - Cloudify Plugins installed in them).

## File Server

The fileserver served by Nginx, while tied to Nginx by default, is not logically bound to it. That is, while we currently access it directly in several occurences (via disk rather than via network), we will be working towards having it completely decoupled from the management environment itself so that it can be deployed anywhere.

## Metrics Consumer

Another entity not drawn in the diagram is a propriatary poller we use to consume metrics from RabbitMQ and feed them into InfluxDB.


# Metrics Flow

![Cloudify Metrics Flow](/guide/images3/architecture/cloudify_flow_metrics.png)

## Monitoring Agent

Diamond is our default agent for sending metrics back to Cloudify's Management Environment.

A user can send back metrics via any transport (agent) as long as it emits metrics comprised of the same structure Cloudify currently handles. See the [Diamond plugin]({{page.diamond_plugin_link}}) documentation for more information.

## Metrics Exchange (Broker)

RabbitMQ holds metrics within a metrics dedicated, non-durable, non-exclusive topic exchange.

Currently, once a metric is consumed it will be removed from the queue. In principle, users can consume metrics directly from RabbitMQ for processing in external (to Cloudify) systems. While we don't yet provide any implementation to officially support this, the architecture enables this and by removing our propriatary consumer, users can consume directly from RabbitMQ.

## Stream Processor

Riemann is currently experimental as an event stream processor and does not perform actions by default.

We aim to have riemann process streams of information (metrics, logs, etc..) on the fly to provide live analysis of service/system states and execute workflows accordingly.

## Metrics Database

Our propriatary consumer polls metrics from RabbitMQ, reformats them to a Cloudify specific structure and submits them to InfluxDB.

Even though InfluxDB supports JSON structured metrics by default, we're currently structuring our metric names in Graphite format due to InfluxDB performance issues. While metric names are still provided in the form of `x.y.z`, the entire metric structure (name + value + ...) is JSON formatted.
As InfluxDB grows, we will be working towards matching our metrics structure to meet the [Metrics2.0](http://metrics20.org/) standard.

## UI

Grafana is used to view the time-series within InfluxDB. While Grafana usually interacts with InfluxDB directly, we're passing all queries through our UI's backend to enable query throttling and security. While query throttling and security are not yet implemented, this enables us to develop towards these goals.


# Events/Logs Flow

![Cloudify Metrics Flow](/guide/images3/architecture/cloudify_flow_logs.png)

This flow is pretty self explanatory and corresponds with the same principles the metrics flow is based upon.

* RabbitMQ holds messages within dedicated, durable, non-exclusive topic exchange. Log messages and events have separate queues.
* Currently, logs and events are stored in Elasticsearch in the same index. While no abstraction is provided for this, it is possible to use logstash to parse messages and store them in different indices if a user wishes to do so but they will not show in Cloudify's UI.


# Blueprint Upload Flow

![Cloudify components](/guide/images3/architecture/cloudify_flow_upload_blueprint.png)

# Deployment Creation Flow

![Cloudify components](/guide/images3/architecture/cloudify_flow_create_deployment.png)

* The REST service will retrieve the blueprint document from Elasticsearch and create a "phyical" manifestation of it by expanding nodes to node-instances, attaching node-instance ID's to them, and so forth.

# Deployment Execution (Install workflow)

# Example of AI Analysis flow