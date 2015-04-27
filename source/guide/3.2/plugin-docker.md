---
layout: bt_wiki
title: Docker Plugin (Alpha)
category: Plugins
publish: true
abstract: "Docker plugin description and configuration"
pageord: 210

yaml_link: http://getcloudify.org/spec/docker-plugin/1.1/plugin.yaml
fabric_link: http://getcloudify.org/guide/3.2/plugin-fabric.html
plugin_version: 1.2
---
{%summary%}The Docker plugin enables you to run Docker containers from a Cloudify Blueprint.{%endsummary%}


{%warning title=Disclaimer%}This plugin is in Alpha and has not been thoroughly tested yet.{%endwarning%}

# Plugin Requirements:

* Python Versions:
  * 2.7.x

{%note title=Notes on Docker installation%}
  * The Docker plugin will not install Docker on your host. You need to either use a host with Docker already installed, or you need to install Docker on it.
  * As part of the Docker installation, you should make sure that the user agent, such as ubuntu, is added to the docker group.
{%endnote%}

# Types

## cloudify.docker.Container

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

  * `image` *Required*. 
  * `name` *Required*. 
  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one.

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the container.
    * **Inputs:**
      * `params` Any parameters exposed by the Docker Py library to the create_container operation.
  * `cloudify.interfaces.lifecycle.start` starts the container.
    * **Inputs:**
      * `params` Any parameters exposed by the Docker Py library to the start operation.
      * `processes_to_wait_for` A list of processes to wait for before finishing the start operation.
      * `retry_interval` Before the start operation finishes, Cloudify confirms that the container is started. This is the number of seconds between checking. Defaults to 1.
 * `cloudify.interfaces.lifecycle.stop` stops the container.
    * **Inputs:**
      * `params` Any parameters exposed by the Docker Py library to the stop operation.
      * `retry_interval` Before the stop operation finishes, Cloudify confirms that the container is stopped. This is the number of seconds between checking. Defaults to 10.
  * `cloudify.interfaces.lifecycle.delete` deletes the container.
    * **Inputs:**
      * `params` Any parameters exposed by the Docker Py library to the remove_container operation.
      * `retry_interval` Before the delete operation finishes, Cloudify confirms that the container is removed. This is the number of seconds between checking. Defaults to 10.

**Attributes:**

  * `container_id` The ID of the container in the Docker Server.
  * `ports` The ports as shown in the container inspect output.
  * `network_settings` The network_settings dict in the inspect output.
  * `image_id` The ID of the repository/tag pulled or imported.

{% highlight yaml %}

  vm_with_docker:
    derived_from: cloudify.openstack.nodes.Server
    properties:
      cloudify_agent:
        default:
          user: { get_input: agent_user }
          home_dir: /home/ubuntu
      server:
        default:
          image: { get_input: image }
          flavor: { get_input: flavor }
          userdata: |
            #!/bin/bash
            sudo service ssh stop
            curl -o install.sh -sSL https://get.docker.com/
            sudo sh install.sh
            sudo groupadd docker
            sudo gpasswd -a ubuntu docker
            sudo service docker restart
            sudo service ssh start

{% endhighlight %}


# Blueprints

## An example node specification

{% highlight yaml %}

  some_container:
    type: cloudify.docker.Container
    properties:
      name: some_name
      image:
        repository: dockeruser/dockerrepo
    interfaces:
      cloudify.interfaces.lifecycle:
        create:
          implementation: docker.docker_plugin.tasks.create_container
          inputs:
            params:
              ports:
                - 8080
              stdin_open: true
              tty: true
              command: /bin/sleep 20
        start:
          implementation: docker.docker_plugin.tasks.start
          inputs:
            params:
              port_bindings:
                8080: 8080

{% endhighlight %}

## Container Properties

The properties are: name, image.

### name:

The `name` property is the name of the container.

### image:

The `image` property is a dictionary. It must have the `repository` key or the `src` key, or both. It may additionally have the `tag` key.

* If `src` is provided, then it must point to a file or URL where the image's tarball is imported from.
  * If `repository` is also provided, then its value will be used as the name of the repository once the image is downloaded.
  * Otherwise, the plugin will name the repository after the Cloudify [instance ID](http://getcloudify.org/guide/3.2/reference-terminology.html#node-instance).
* Otherwise, `repository` must be provided, and contain the name of the Docker image to pull.

The `tag` key is optional. If provided, it specifies the version of the repository that is pulled (if `src` is not provided) or created (if `src` is provided).

For more information on importing images, see [docker import command](https://docs.docker.com/reference/commandline/cli/#import).
For more information on pulling images, see [docker pull command](https://docs.docker.com/reference/commandline/cli/#pull).

Here is an example of importing from an URL.

{% highlight yaml %}

  cloudify_manager:
    type: cloudify.docker.Container
    properties:
      name: cloudify-manager
      image:
        src: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.2.0/m6-RELEASE/cloudify-docker_3.2.0-m6-b176.tar
        tag: 3.2.0

{% endhighlight %}

### Defining Parameters

Since this plugin is based on the Docker-Py python library, you can pass the parameters as inputs to the supported functions.

## Create

Maps to the create_container function. You can add any of the parameters available to the create_container function in Docker-Py

{% highlight yaml %}

  create:
    implementation: docker.docker_plugin.tasks.create_container
    inputs:
      params:
        ports:
          - 27017
          - 28017
        stdin_open: true
        tty: true
        command: mongod --rest --httpinterface --smallfiles

{% endhighlight %}

## Start

Maps to the start function. You can add any of the parameters available to the start function in Docker-Py

{% highlight yaml %}

  start:
    implementation: docker.docker_plugin.tasks.start
    inputs:
      params:
        port_bindings:
          27017: 27017
          28017: 28017

{% endhighlight %}

## Stop

Maps to the stop function. You can add any of the parameters available to the stop function in Docker-Py

{% highlight yaml %}

  stop:
    implementation: docker.docker_plugin.tasks.stop
    inputs:
      params:
        timeout: 30

{% endhighlight %}

## remove_container

Maps to the remove_container function. You can add any of the parameters available to the remove_container function in Docker-Py

{% highlight yaml %}

  delete:
    implementation: docker.docker_plugin.tasks.remove_container
    inputs:
      params:
        force: true

{% endhighlight %}


Many of the options exposed in the Docker-Py Python Docker API are available through the Cloudify Docker Plugin. That documentation can suppliment this feature:
[docker python client.](https://github.com/docker/docker-py)

If there is a lack of description of certain parameters,
more details can be found in
[docker command line documentation.](https://docs.docker.com/reference/commandline/cli/)


## Using the plugin

The plugin is designed to follow the Docker Py Docker Python API library and not the Docker CLI. And so, it also differs from the Docker CLI in some respects. For example, `docker run` is split into `create` and `start`.

Here are the operations that this plugin currently supports:

### Create task

* Creates a container that can be started.

* Here, the plugin pulls images from the Docker Hub Registry, a private registry, or it may import an image from a tarball.

* This operations adds the container_id to the instance runtime_properties.


### Start task

* This starts the container.

* It also logs containers' network settings with IPs, ports, and top information.

* You can pass a list of process names that you want to make sure are running on the container, before the start operation succeeds:

{% highlight yaml %}

  start:
    implementation: docker.docker_plugin.tasks.start
    inputs:
      params:
        port_bindings:
          27017: 27017
          28017: 28017
        processes_to_wait_for:
          - /bin/sh

{% endhighlight %}


### Stop task

* Stops the container.


### Delete task

* Deletes the container and its runtime_properties.

# Complete Example

For a complete working example, please see the [ReadMe](https://github.com/cloudify-cosmo/cloudify-nodecellar-docker-example/tree/{{site.latest_cloudify_version}}) for the Docker Nodecellar Example.
