---
layout: bt_wiki
title: What is Cloudify?
category: none
publish: true
abstract: What is Cloudify and why use it?
pageord: 100

---

{%summary%}{{page.abstract}}{%endsummary%}

Cloudify is an open-source framework which allows you to automate your day-to-day operational flows from both orchestration and maintenance perspectives.


# Application Orchestration

Your application in its entirety (Infrastructure, Middleware, Application Code, Scripts, Tool Configuration, Metrics and Logs) can be desribed in what we call a blueprint.

Written in a human readable YAML format, a blueprint allows for potentially high granularity of configuration of your application.

By defining the complete lifecycle of each part of your application in a blueprint, and by utilizing the different IaaS APIs and the plugin abstractions of different tools, Cloudify can manifest your application automatically.

Cloudify will launch the compute instances, and configure network and security in order to manifest your infrastructure.

Then, it will execute scripts (remotely via SSH or locally on the machines) or configuration management tools to configure your servers and deploy your middleware and code.


# Application Maintenance

Cloudify's ability to run custom workflows will grant you the ability to manually or automatically change your application's structure, deploy code to your servers, heal or scale your system.

Cloudify will use metrics collectors (and soon, log collectors) to stream application (and Cloudify specific) data to Cloudify so that you're able to monitor and analyze your system.

Data aggregation and visualization within Cloudify will allow you to execute the different workflows so that either you or Cloudify itself can make smart, actionable decisions based on business/application KPIs.

Those decisions can either manually or automatically trigger workflows (such as scaling or healing) on the tactical front; or as application behavior analysis on the strategic front.


# Pluggability

Cloudify's plugins complete the framework.

Cloudify-specific plugins can run scripts, CM tools, metrics and logs aggregators, or any other tool for that matter.

A plugin is an abstraction below which a tool is installed, configured and executed. Plugins are written in Python which makes them rather easy to write.

For (a simple) example, the Cloudify Script Plugin allows you to execute scripts at different times throughout the application's lifecycle (creation, configuration, stable state, etc.)

Another example would be the Diamond plugin which allows users to send back metrics after the application was deployed.

Users can write and deploy their own plugins and import them in their blueprints.


# Open-Source

Cloudify comprises several open-source tools and proprietary Python code which allows for easy composability.


# The Big Picture

Cloudify, having the entire application spread at its feet, can help you make smart decisions. Instead of looking only at the infrastructure level, or only at the application, Cloudify assumes that any resource (up to the hypervisor), log message, or metric, is a part of your application. This allows you to achieve a level of granularity when managing your application that takes everything into consideration.

For instance, let's say that you're running a web application. You can use Cloudify to make a smart decision about scaling based on:

* Metrics sent from the application
* Metrics sent from the servers
* Some log messages
* The number of instances currently deployed
* The scripts previously run on that specific server
* Any other resource that your system comprises.
