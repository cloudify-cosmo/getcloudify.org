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

Some remarks:

* Cloudify aims to have only 2 entry points to its Management Environment:
    * Ports 80/443 for user rest-service/UI access via Nginx.
    * Port 5672 for application access via RabbitMQ.
    * Currently, our agents (both Application Host agents and Deployment specific agents) update the application's model via Nginx directly rather than through RabbitMQ. This will be changed in future versions to reflect security requirements.
* Elasticsearch contains different indices for storing the data model and the logs.
* Both in-management-environment agents drawn in the diagram are deployment specific. For every deployment created, 2 of these agents are spawned.
* In addition to these agents, an entity removed from the diagram is a management agent containing several Cloudify plugins able to spawn the deployment specific agents.
* The fileserver served by Nginx, while tied to Nginx by default, is not logically bound to it. That is, while we currently access it directly in several occurences (via disk rather than via network), we will be working towards having it completely decoupled from the management environment itself so that it can be deployed anywhere on the user's system.

# Metrics Flow

![Cloudify Metrics Flow](/guide/images3/architecture/cloudify_flow_metrics.png)

Some remarks:

* Diamond is only our default agent for sending metrics back to Cloudify's Management Environment. A user can send back metrics via any transport as long as it corresponds with the structure of the metrics Cloudify currently handles. See the [Diamond plugin]({{page.diamond_plugin_link}}) documentation for more information.
* RabbitMQ holds metrics within a dedicated metrics exchange.
* Riemann is currently experimental as an event stream processor and does not perform actions by default.
* Our propriatary poller polls metrics from RabbitMQ, reformats them to a Cloudify specific structure and submits them to InfluxDB. Even though InfluxDB supports JSON structured metrics by default, we're currently structuring our metric names in Graphite format due to InfluxDB performance issues. As InfluxDB grows, we will be working towards matching our metrics structure to meet the [Metrics2.0](http://metrics20.org/) standard.
* Grafana is used to view the time-series within InfluxDB. While Grafana usually interacts with InfluxDB directly, we're passing all queries through our UI's backend to enable query throttling and security. While query throttling and security are not yet implemented, this enables us to develop towards these goals.
* In principle, users can poll metrics directly from RabbitMQ for processing in external (to Cloudify) systems. While we don't yet provide any implementation to officially support this, the architecture enables this and by removing our propriatary poller, users can poll directly from RabbitMQ.

# Events/Logs Flow

![Cloudify Metrics Flow](/guide/images3/architecture/cloudify_flow_logs.png)

This flow is pretty self explanatory and corresponds with the same principles the metrics flow is based upon.

# Blueprint Upload Flow

# Deployment Creation Flow

# Deployment Execution (Install workflow)

# Example of AI Analysis flow