---
layout: bt_wiki
title: Bootstrapping
category: Getting Started
publish: true
abstract: Instructions on how to bootstrap a Cloudify manager
pageord: 50
---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

While Cloudify's CLI provides [very limited support for deploying an application](LOCAL_WORKFLOWS_LINK!), to be able to fully utilize Cloudify to deploy your application using the different Cloudify plugins, you'll have to bootstrap a Cloudify Management Environment.

A Cloudify Management Environment comprises of [several underlying open-source tools](overview-components.html) all integrated via Cloudify's code to create a dynamic environment supporting the different operational flows you might be interested in when deploying a production environment.

The bootstrap process will create the infrastructure (servers, networks, security groups and rules, etc..) required for Cloudify's Management Environment to run and install Cloudify on that environment.


# Initialization

Navigate to a directory of your choosing, and initialize it as a Cloudify CLI working directory using this command:

{% highlight sh %}
cfy init
{%endhighlight%}


# Bootstrapping

Bootstrapping a Cloudify manager is done by using [Manager Blueprints](reference-terminology.html#manager-blueprints) - these are standard Cloudify blueprints which have been constructed to bring up a management environment and topology on various providers and/or scenarios.

First, clone the [Cloudify-Manager-Blueprints](https://github.com/cloudify-cosmo/cloudify-manager-blueprints) repository from github, or copy your desired blueprint folder from there.

{%note title=Note%}

You can download the correct Cloudify-Manager-Blueprints for the CFY version you're using from [Cloudify-Manager-Blueprints](https://github.com/cloudify-cosmo/cloudify-manager-blueprints/releases)

{%endnote%}

Now you can install the blueprint-specific dependencies by running:

 `cfy local install-plugins -p /path/to/manager/blueprint/file`

For example,

 `cfy local install-plugins -p cloudify-manager-blueprints/openstack/openstack-manager-blueprint.yaml`

(Alternatively, you may pass the `--install-plugins` flag to the `cfy bootstrap` command which follows soon)


{%note title=Note%}

The *install-plugins* functionality only works if you are running from within a virtualenv.
If this is not the case, installing plugins will require sudo permissions and can be done like so:

{% highlight sh %}
cfy local create-requirements -o requirements.txt -p /path/to/manager/blueprint/file
sudo pip install -r requirements.txt
{%endhighlight%}

{%endnote%}


Next, create an inputs YAML file. This file will serve as the configuration for the manager blueprint inputs. Note that the various manager blueprints folders offer an *inputs.yaml.template* file, which can be copied and edited with the desired values.

Finally, run the `cfy bootstrap` command, pointing it to the manager blueprint file and the inputs YAML file, like so:

{% highlight sh %}
cfy bootstrap -p /path/to/manager/blueprint/file -i /path/to/inputs/yaml/file
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
See The Reference section in the documentation for a reference of all currently available Manager Blueprints.

{%note title=Note%}
The manager blueprints are comprised not only of the *.yaml* file, but rather the entire directory in which the *.yaml* file resides. Make sure to copy the full directory for when using or editing manager blueprints.
{%endnote%}


## Authoring manager blueprints
If you wish to write a custom manager blueprint (whether it be for a custom behavior or a different provider) or learn more on how manager blueprints work, refer to the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).

# Bootstrapping

The Cloudify Manager is bootstrapped on top of Docker.

Bootstrapping using Docker provides several advantages:

* The Cloudify Manager is available on varius Linux distributions running Docker. Note that some distributions require minimal adjustments
* Users can upgrade containers specific to the service they want to upgrade (Currently, there's only one Application container. In the near future, each container will host one service [e.g. Logstash, Elasticsearch, etc..])
* Using Docker simplifies Cloudify's bootstrap process, and will help in making it much faster in future versions.

{%note title=Note%}
Please verify the [prerequisites](getting-started-prerequisites.html) before bootstrapping.
{%endnote%}


Cloudify's Docker implementation consists of two Docker images:

* Cloudify Application Image - an image running Cloudify's Application Stack.
* Cloudify Data Image - a "data-only" image containing persistent volume paths.

Docker containers, by default, are not data persistent meaning that when a container exits, all of its data is lost.
To prevent losing data in case of a container failure, Cloudify uses a separate data container whose sole purpose is to hold all of the data that should remain persistent. It is run once during bootstrap, during which it creates the required volumes. This means that if the Application container crashes, all data will still be available via the data container's volume.

Additionally, using volumes will increase performance as all data is written directly to the disk instead of using Copy-On-Write.

{%note title=Note%}
Agent packages should be stated under `cloudify_packages` and will be installed upon bootstrap, inside the Docker container.
{%endnote%}

{%note title=Note%}
Cloudify will attempt to perform an online installation of Docker ***only on Ubuntu 14.04 (Trusty)***, as other images may require kernel upgrades and additional package installations.

If you are using a different distribution, you'll have to make sure that Docker is installed on it prior to bootstrapping.
{%endnote%}


# What's Next

Next, you should either [try and write your first blueprint](getting-started-write-blueprint.html), or [download an example blueprint and upload it](getting-started-upload-blueprint.html).