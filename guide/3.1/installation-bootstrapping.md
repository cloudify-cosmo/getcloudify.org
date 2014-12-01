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

Second, install the blueprint dependencies by running:

 `cfy local install-plugins -p /path/to/manager/blueprint/file`


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

## Bootstrapping using Docker


Beginning with version 3.1, Cloudify's Management Environment can be bootstapped using the [provided]() Docker images.

Bootstrapping using Docker provides several advantages:

* Users can bootstrap on distributions other than Ubuntu 12.04.
* Users can upgrade containers specific to the service they want to upgrade (Currently, there's only one Application container. In the future, each container will host one service (e.g. Logstash, Elasticsearch, etc..))
* Cloudify's bootstrap process will be much simpler and much faster.

The Manager Blueprints provided [here](https://github.com/cloudify-cosmo/cloudify-manager-blueprints) contain the configuration for bootstrapping using Docker, though, by default, the configuration for Docker is commented out. In Cloudify 3.2, Docker will be the default method for bootstrapping.

{%note title=Note%}
Please verify the [prerequisites](installation-general.html#bootstrapping-using-docker) before bootstrapping using Docker.
{%endnote%}

To bootstrap using Docker, you will have to do the following:

## In the Manager Blueprint

Comment the default bootstrap method:

# Under interfaces, cloudify.interfaces.lifecycle, start, inputs,
# comment this:
{% highlight yaml %}
task_mapping: cloudify_cli.bootstrap.tasks.bootstrap
{%endhighlight%}

and uncomment the following:

{% highlight yaml %}
...
# Under interfaces, cloudify.interfaces.lifecycle, start, inputs,
# set the task mapping to use the following task:
task_mapping: cloudify_cli.bootstrap.tasks.bootstrap_docker
# Additional non-mandatory properties are:
task_properties:
    # Use to override the path of Docker's executable.
    docker_path: /usr/bin/docker
    # Use sudo to start the container. Default is set to true.
    use_sudo: true
...

# Use these Docker images
cloudify_packages:
    docker:
        # The Application image
        docker_url: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify_docker_3.1.0-ga-b85_amd64.tar
        # The Data image
        docker_data_url: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify_docker_data_3.1.0-ga-b85_amd64.tar
{%endhighlight%}


## In the Application Blueprint

configure each VM node to contain the home_dir property as follows:

{% highlight yaml %}
cloudify_agent:
    default:
        # This should be the home directory of the host's user (e.g. /home/ubuntu, /root, /home/my_user...)
        home_dir: /home/ubuntu
{%endhighlight%}

{%note title=Note%}
In Cloudify 3.2, you will not have to specific the `home_dir` variable for each VM node.
{%endnote%}

Cloudify's Docker implementation consists of two docker images:

* Cloudify Application Image - an image running Cloudify's Application Stack.
* Cloudify Data Image - a 'data-only' image containing persistent volume paths.

Docker containers, by default, are not data persistent meaning that when a container exits, all of its data is lost.
To prevent losing data in case of a container failure, we use a separate data container whose sole purpose is to hold all of the data that should remain persistent. It is run once during bootstrap, during which it creates the required volumes. This means that if the Application container crashes, all data will still be available via the Data container's volume.

Additionally, using volumes will increase performence as all data is written directly to the disk instead of using Copy-On-Write.

{%note title=Note%}
Stating agent packages under 'cloudify_packages' will OVERRIDE the existing agent packages packed inside the docker image.
By default, the docker image contains Ubuntu trusty 14.04, Ubuntu precise 12.04, Centos and windows agent packages.
{%endnote%}

{%note title=Note%}
Cloudify will attempt to install Docker on Ubuntu 14.04 (Trusty) ONLY as other images may require kernel upgrades and additional package installations.

If you are using a different distro image, you'll have to make sure that Docker is installed on it prior to bootstrapping.
{%endnote%}

{%note title=Note%}
This architecture allows us to migrate Cloudify's Management Environment with ease. All we need is to export the data container
and start a new Cloudify Application container that uses the data from the exported container.
{%endnote%}