---
layout: bt_wiki
title: Bootstrapping
category: Installation
publish: true
abstract: "Instructions on how to bootstrap a Cloudify manager"
pageord: 400
---

{%summary%} This page explains how to bootstrap a Cloudify manager using the Cloudify CLI {%endsummary%}


# Initialization

Navigate to a directory of your choosing, and initialize it as a Cloudify CLI working directory using this command:

{% highlight sh %}
cfy init
{%endhighlight%}


# Bootstrapping

Bootstrapping a Cloudify manager is done by using [Manager Blueprints](reference-terminology.html#manager-blueprints) - these are standard Cloudify blueprints which have been constructed to bring up a manager server and topology on various providers and/or scenarios.

First, clone the [Cloudify-Manager-Blueprints](https://github.com/cloudify-cosmo/cloudify-manager-blueprints) repository from github, or copy your desired blueprint folder from there.

Second, install the blueprint-specific dependencies by running:

 `cfy local install-plugins -p /path/to/manager/blueprint/file`

(Alternatively, you may pass the `--install-plugins` flag to the `cfy bootstrap` command which follows soon)


Next, create an inputs JSON file. This file will serve as the configuration for the manager blueprint inputs. Note that the various manager blueprints folders offer a *inputs.json.template* file, which can be copied and edited with the desired values.

Finally, run the `cfy bootstrap` command, pointing it to the manager blueprint file and the inputs JSON file, like so:

{% highlight sh %}
cfy bootstrap -p /path/to/manager/blueprint/file -i /path/to/inputs/json/file
{%endhighlight%}


When the command is done executing, you'll have an operational Cloudify manager on the desired provider. You may verify this by making a *status* call.
An example output:

{% highlight sh %}
$ cfy status
Getting management services status... [ip=1.2.3.4]

Services:
+---------------------------------+---------+
|            service              |  status |
+---------------------------------+---------+
| RabbitMQ                        | running |
| Cloudify Manager                | running |
| Elasticsearch                   | running |
| Riemann                         | running |
| Syslog                          | running |
| Celery Management               | running |
| Cloudify UI                     | running |
| Webserver                       | running |
| Logstash                        | running |
| SSH                             | running |
+---------------------------------+---------+
{%endhighlight%}


# Manager blueprints

## Available manager blueprints
At the moment, the following official manager blueprints are available in the [manager blueprints repository](https://github.com/cloudify-cosmo/cloudify-manager-blueprints):

- [Simple](reference-simple-manager.html) (for bootstrapping Cloudify on an existing machine)
- [Openstack](reference-openstack-manager.html)

{%note title=Note%}
The manager blueprints are comprised not only by the *.yaml* file, but rather the entire directory in which the *.yaml* file resides. Make sure to copy the full directory for when using or editing manager blueprints.
{%endnote%}


## Authoring manager blueprints
If you wish to write a custom manager blueprint (whether it be for a custom behavior or a different provider) or learn more on how manager blueprints work, refer to the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).
