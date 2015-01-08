---
layout: bt_wiki
title: Bootstrapping
category: Installation
publish: true
abstract: "Instructions on how to bootstrap a Cloudify manager"
pageord: 400
---

{%summary%} This page explains how to bootstrap a Cloudify manager using the Cloudify CLI {%endsummary%}

{%note title=NEW!%}
You can now bootstrap Cloudify using Docker. See [Bootstrapping Using Docker](#bootstrapping-using-docker) for more information.
{%endnote%}

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


{%note title=Note%}

Ths *install-plugins* functionality only works if you are running from within a virtualenv.
If this is not the case, installing plugins will require sudo permissions and can be done like so:

{% highlight sh %}
cfy local create-requirements -o requirements.txt -p /path/to/manager/blueprint/file
sudo pip install -r requirements.txt
{%endhighlight%}

{%endnote%}


Next, create an inputs YAML file. This file will serve as the configuration for the manager blueprint inputs. Note that the various manager blueprints folders offer a *inputs.yaml.template* file, which can be copied and edited with the desired values.

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
At the moment, the following official manager blueprints are available in the [manager blueprints repository](https://github.com/cloudify-cosmo/cloudify-manager-blueprints):

- [Simple](reference-simple-manager.html) (for bootstrapping Cloudify on an existing machine)
- [Openstack](reference-openstack-manager.html)
- [Nova-net Openstack](reference-nova-net-openstack-manager.html)
- [Cloudstack](reference-cloudstack-manager.html)

{%note title=Note%}
The manager blueprints are comprised not only by the *.yaml* file, but rather the entire directory in which the *.yaml* file resides. Make sure to copy the full directory for when using or editing manager blueprints.
{%endnote%}


## Authoring manager blueprints
If you wish to write a custom manager blueprint (whether it be for a custom behavior or a different provider) or learn more on how manager blueprints work, refer to the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).

# Bootstrapping using Docker

Alternatively, it is possible to bootstrap a Cloudify Manager on top of Docker.

Bootstrapping using Docker provides several advantages:

* The Cloudify Manager becomes available on Linux distributions other than Ubuntu 12.04.
* Users can upgrade containers specific to the service they want to upgrade (Currently, there's only one Application container. In the future, each container will host one service [e.g. Logstash, Elasticsearch, etc..])
* Using Docker simplifies Cloudify's bootstrap process, and will help in making it much faster in future versions.
* In future versions, using docker would allow to migrate your entire manager onto an entirely different machine.

To bootstrap with docker, use the appropriate manager blueprint, available in the [cloudify-manager-blueprints repository](https://github.com/cloudify-cosmo/cloudify-manager-blueprints).

{%note title=Note%}
Please verify the [prerequisites](installation-general.html#bootstrapping-using-docker) before bootstrapping using Docker.
{%endnote%}


Cloudify's docker implementation consists of two docker images:

* Cloudify Application Image - an image running Cloudify's Application Stack.
* Cloudify Data Image - a "data-only" image containing persistent volume paths.

Docker containers, by default, are not data persistent meaning that when a container exits, all of its data is lost.
To prevent losing data in case of a container failure, Cloudify uses a separate data container whose sole purpose is to hold all of the data that should remain persistent. It is run once during bootstrap, during which it creates the required volumes. This means that if the Application container crashes, all data will still be available via the data container's volume.

Additionally, using volumes will increase performance as all data is written directly to the disk instead of using Copy-On-Write.

{%note title=Note%}
Stating agent packages under 'cloudify_packages' will ***override the existing agent packages*** packed inside the docker image.
By default, the docker image contains Ubuntu 14.04 (Trusty), Ubuntu 12.04 (Precise), Centos and Windows agent packages.
{%endnote%}

{%note title=Note%}
Cloudify will attempt to install Docker ***only on Ubuntu 14.04 (Trusty)***, as other images may require kernel upgrades and additional package installations.

If you are using an image of a different distribution, you'll have to make sure that Docker is installed on it prior to bootstrapping.
{%endnote%}


## Docker Implementation Architecture

  * The Cloudify docker implementation makes use of two docker containers:

    * `cfy` - Contains the entire Cloudify manager service stack.
    * `data` - Contains mount points that are to be used for persistence purposes (ElasticSearch, InfluxDB, etc.).

  * Docker persistence - Docker containers do not persist their files. For this reason, the Cloudify docker implementation uses a Docker data container. The docker data container's sole purpose is to hold data written to it by the main cloudify container. The data container itself does not have to be running and acts as an external mountable device. By defining the mount point paths on the data container, it's possible to share the data between the containers using the `--volumes-from` flag. You can read more about the docker data container architecture [here](https://docs.docker.com/userguide/dockervolumes/).

  * Container management - Since the docker implementation is meant to run on any Linux distribution supported by docker, Cloudify lets docker manage the container's lifecycle. To do so, it starts the management container using the `--restart=always` flag.

  * File management - To allow file sharing between the hosting VM and the cloudify container, mount points are being set to `/vm/home/:/container/home/` and `/opt/manager/resources/packages:/opt/manager/resources/packages`. This allows the bootstreap process to pass files such as external agent packages and agent keypairs onto the container.

  * Port mapping and linking - Since all of the cloudify services reside in the same container at this time, no container linking is made. The current implementation exposes all of cloudify's service ports and maps them to the their equivalent port on the localhost.
