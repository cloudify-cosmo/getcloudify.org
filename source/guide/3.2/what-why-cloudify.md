---
layout: bt_wiki
title: What is Cloudify?
category: none
publish: true
abstract: What is Cloudify and why use it?
pageord: 100

---

{%summary%}{{page.abstract}}{%endsummary%}

Cloudify is an open-source framework which allows you to automate your day-to-day operational flows from both Orchestration and Maintenance perspectives.


# Application Orchestration

Your application in its entirety (Infrastructure, Middleware, Application Code, Scripts, Tool Configuration, Metrics and Logs) can be desribed in what we call a Blueprint.

Written in a human readable YAML format, The Blueprint allows for potentially high granularity of configuration of your application.

By defining a complete lifecycle of each part of your application in the blueprint and by utilizing the different IaaS APIs and our Plugin Abstractions for different tools, Cloudify can manifest your application automatically.

Cloudify will launch the compute instances and configure network and security to manifest your infrastructure.

Then, it will start executing scripts (remotely via SSH or locally on the machines) or Configuration Management tools to configure your servers and deploy your middleware and code.


# Application Maintenance

Cloudify's ability to run custom workflows will grant you the ability to manually or automatically change your application's structure, deploy code to your servers, heal or scale your system.

Cloudify will use Metrics Collectors (and soon, Log Collectors) to stream application (and Cloudify specific) data to Cloudify so that you're able to monitor and analyze your system. Data aggregation and visualization within Cloudify will allow you to execute the different workflows so that either you or Cloudify itself can make smart, actionable decisions based on Business/Application KPIs. Those decisions can manifest as either manually or automatically executed workflows (such as the aforementioned scaling or healing) on the tactical front; or as application behavior analysis on the strategic front.


# Pluggability

Cloudify's Plugins complete the framework
Running scripts, CM tools, metrics and logs aggregators or any other tool for that matter is done via Cloudify specific plugins.

A Plugin is an abstraction below which a tool is installed, configured and executed. Plugins are written in Python which makes them rather easy to write.

For (a simple) instance, Cloudify's script plugin allows a user to execute scripts as a part of the applications manifestation process in different parts of its lifecycle (creation, configuration, stable state, etc..)

Another example would be the Diamond plugin which allows users to send back metrics after the application was deployed.

Users can write and deploy their own plugins by describing them in the blueprint.


# Open-Source

Cloudify comprises of several open-source tools and proprietary Python code which allows for easy composability.
