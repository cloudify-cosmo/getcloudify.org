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

## Internal communication between the Cloudify manager and other Cloudify components

Currently, communication between the Cloudify agents and the Cloudify manager does not go through authentication and authorization - instead, REST calls from the agents to the manager are done to port 8101, which has the same general behavior as port 80, yet the REST service lets requests made to this port through without having them go through any of the security mechanisms.

The usage of this port, however, is restricted to components on the same subnet as the Cloudify manager alone. This is done using specific security group rules, which are set up during bootstrap (for example, see [this rule in the Openstack manager blueprint](https://github.com/cloudify-cosmo/cloudify-manager-blueprints/blob/master/openstack/openstack-manager-blueprint.yaml#L206)). It is therefore impossible to bypass the security mechanisms from outside the manager's internal network by making REST calls directly to the 8101 port.

In future versions, all communications from and to the Cloudify manager will utilize the security mechanisms, including communication with any of Cloudify's internal components, at which time, the bypass port 8101 will be removed.


## Advanced configuration (logs, token timeout, password hashing, nginx)

# Writing your own userstore and authentication providers
## how to write

## Packaging/Configuring/Installing custom implementations

In order to use custom implementations of userstores, authentication providers and token generators; the implementations themselves should be installed on the manager.

To do this, the manager blueprint should be updated as follows.

Say you write a custom authentication provider. The code itself should be structured in a similar way to how [operations/workflows](guide-plugin-creation.html#creating-a-plugin-project) plugins are structured, that is to say, it should be structured as a valid python package.

You specify the package location under the `plugins` section in the `cloudify` property of the `manager` node in the manager blueprint like this:
{% highlight yaml %}
node_templates:
  ...
  manager:
    ...
    properties:
      ...
      cloudify:
        plugins:
          my_authentication_provider:

            # see description below
            source: my-extensions/simple-authentication-provider

            # see description below
            install_args: '--pre'

          my_userstore:

            # see description below
            source: https://github.com/my-org/my-auth-provider/archive/master.zip

{% endhighlight %}


### Configuration
The `plugins` section is a dict that contains all plugins that should be installed.

The keys of this dict are arbitrary names. In the previous example we used `my_authentication_provider` and `my_userstore` as the names.

* `source` Can be any of the following:
  * A path to the package directory relative to the [main manager blueprint file](reference-terminology.html#main-blueprint-file) directory (e.g. `my-extensions/simple-authentication-provider`)
  * A URL to the package archive (e.g. `https://github.com/my-org/my-auth-provider/archive/master.zip`)
* `install_args` You may pass additional arguments to the `pip install` command used to install your plugin.


{%note title=Note%}
When the term *plugin* is used in this section, it should not be confused with operation and workflow plugins (except when explicitly mentioned otherwise).

When we use this term here, we simply mean: custom code that gets installed in the manager environment. In other words, plugins here cannot be used as operations and workflows plugins.
{%endnote%}
