---
layout: bt_wiki
title: The Metrics Flow
category: Product Architecture and Flows
publish: true
abstract: Describes the flow of streaming metrics from a host to Cloudify's Management Environment
pageord: 700
---
{%summary%} {{page.abstract}}{%endsummary%}

## Flow Diagram

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
