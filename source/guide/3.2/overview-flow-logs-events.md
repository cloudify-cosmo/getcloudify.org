---
layout: bt_wiki
title: The Logs/Events Flow
category: Product Overview
publish: true
abstract: Describes the flow of streaming metrics from a host to Cloudify's Management Environment
pageord: 800
---
{%summary%} {{page.abstract}}{%endsummary%}

## Flow Diagram

![Cloudify Logs Flow](/guide/images3/architecture/cloudify_flow_logs.png)

This flow is pretty self explanatory and corresponds with the same principles the metrics flow is based upon.

* RabbitMQ holds messages within dedicated, durable, non-exclusive topic exchange. Log messages and events have separate queues.
* Currently, logs and events are stored in Elasticsearch in the same index. While no abstraction is provided for this, it is possible to use logstash to parse messages and store them in different indices if a user wishes to do so but they will not show in Cloudify's UI.