---
layout: bt_wiki
title: Security Guide
category: Guides
publish: true
abstract: Cloudify's Management security configuration and client usage
pageord: 500

---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

This guide will quickly explain how to bootstrap a secured manager and use if from the cli and web UI.

# Main Concepts
## Userstores
## Authentication Providers

# Setting up a secured server
## Manager Blueprint Configuration
### setting security on / off
### configuring a userstore
### configuring authentication providers
### configuring a token generator
### SSL

# Clients
## Web UI
{%note title=Note%}
Availbale in the Commercial version only
{%endnote%}
## Cloudify CLI
## CURL

# Examples
## Simple - Using the default userstore driver and password authentication, no SSL
## Advanced - Using the default userstore driver and token authentication, with SSL


# Behind the Scenes / Advanced
## request-response flow
## Advanced configuration (logs, token timeout, password hashing, nginx)

# Writing your own userstore and authentication providers
## how to write
## how to pack
## how to configure installation on Cloudify Manager
