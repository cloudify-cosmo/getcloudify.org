---
layout: bt_wiki
title: Intro
category: none
publish: true
abstract: What's this Cloudify thing anyway?
pageord: 10
---
{%summary%}{{page.abstract}}{%endsummary%}

# What is Cloudify?
Cloudify is a Cloud Application Orchestrator. It automates any process you need to perform with regard to your applications over any cloud. Starting with environment setup and application installation, going forward to application upgrade, infrastructure upgrade, continuous deployments, auto-healing and auto-scaling.

Cloudify can work on any environment: IaaS, virtualized or even non-virtualized. Cloudify executes automation processes using any tool you choose. From shell to Chef, Puppet, etc. Cloudify monitors your application with any monitoring tool you choose; installing it for you if you like and interfacing with your monitoring tools to get events and metrics into Cloudify’s Policy Engine.

# Why Cloudify?

## Cloudify is Modular
Cloudify allows you to use its default, built in tools to deploy, manage and monitor your application stack.

On the other hand, you can use any other tool in your possession.
Cloudify is cleverly developed in a way that allows you to rapidly write plugins to integrate your favorite tools with its core.
(It also comes with a few default plugins to get you started.)

## Cloudify is Portable
Cloudify itself, and the stack it is deploying, can run on any cloud (several cloud plugins are supported by default) and its configuration is portable across clouds.
That means that you can practically take your stack with you when you're moving from one cloud provider to another.
(see the [Blueprints Guide](blueprint-guide.html) for insight on how the configuration is implmeneted.)

## Cloudify uses Advanced Technologies
Cloudify uses the most advanced open-source solutions to bring its integration schema into action.
See [Cloudify's Archiecture](architecture.html) for more information.

## Cloudify is constantly under development
Cloudify is backed by a strong team of developers and ops guys who're making sure the product is reliable, functional and always up to date.

## Cloudify enables DevOps
Cloudify brings the Operations and Development teams together by providing high levels of infrastructure and application automation, which allows them to focus on system architecture and product delivery rather than deployment and maintenance.

# What's Next
[Requirements](requirements.html)