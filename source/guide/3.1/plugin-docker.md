---
layout: bt_wiki
title: Docker Plugin (Alpha)
category: Plugins
publish: true
abstract: "Docker plugin description and configuration"
pageord: 210

yaml_link: http://getcloudify.org/spec/docker-plugin/1.1/plugin.yaml
fabric_link: http://getcloudify.org/guide/3.1/plugin-fabric.html
plugin_version: 1.1
---
{%summary%}The Docker plugin enables you to run Docker containers from a Cloudify Blueprint.{%endsummary%}


{%warning title=Disclaimer%}This plugin is in Alpha and has not been thoroughly tested yet.{%endwarning%}

# Plugin Requirements:

* Python Versions:
  * 2.7.x

* Ubuntu Precise
  * The Docker plugin has an installation script that installs Docker on Ubuntu Precise.

# Blueprints

## An example node specification

{% highlight yaml %}

  my_nginx:
    type: cloudify.docker.Container
    properties:
      name: nginx
      image:
        repository: nginx
        tag: 1.7.9
      ports:
        8080:80
      params:
        stdin_open: true
        tty: true
        command: some-content-nginx
        environment:
          ENV_VAR: some-var-value
          ENV_VAR2: another-var-value
        volumes_from:
          boring_babbage
          sleepy_brattain
    relationships:
      - type: cloudify.relationships.contained_in
        target: some_vm

{% endhighlight %}

## Container Properties

The container node type allows you to describe the properties and lifecycle operations of a Docker container.

The properties are: name, image, ports, and params.

### name:

The `name` property is the name of the container. If this is a new container, name it anything you like. If it is an external container, give it the existing name.

For example:

{% highlight yaml %}

  existing_container:
    type: cloudify.docker.Container
    properties:
      name: boring_babbage
      use_external_resource: true

{% endhighlight %}

### image:

The `image` property is a dictionary. It must have the `repository` key or the `src` key, or both. It may additionally have the `tag` key.

The `src` key is used when you want to import an image. It must point to a file or URL where there is a tarball, which Docker can use to import an image. For more information on importing images, see [docker import command.](https://docs.docker.com/reference/commandline/cli/#import)

If you pull an image from a Docker hub, `repository` is required. If you are importing an image, you leave it blank. The plugin will name the 
repository by the Cloudify [instance ID.](http://getcloudify.org/guide/3.1/reference-terminology.html#node-instance)

The `tag` key is also optional. If you want to specify a version of a repository, you can put that in the tag.

Here is an example of importing from an URL.

{% highlight yaml %}

  cloudify_manager:
    type: cloudify.docker.Container
    properties:
      name: cloudify-manager
      image:
        src: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify-docker_3.1.0-ga-b85.tar
        repository: cloudify-manager-packages
        tag: 3.1.0

{% endhighlight %}


### ports:

Use `ports` to control the port mappings of the container.

{% highlight yaml %}

  web_application:
    type: cloudify.docker.Container
    properties:
      name: web-app
      image:
        src: local-file.tar
        repository: my-application-container
      ports:
        22: 22
        80: 80
        3306, 127.0.0.1: 3306, 10.79.46.23

{% endhighlight %}


### params:

Additional parameters are allowed in the `params` dictionary. For example, the options for `std_open`, `tty`, and `environment` variables.

{% highlight yaml %}

  nodecellar_container:
    type: cloudify.docker.Container
    properties:
      name: nodecellar
      image:
        repository: uric/nodecellar
      ports:
        8080: 8080
      params:
        stdin_open: true
        tty: true
        command: nodejs server.js
        environment:
          NODECELLAR_PORT: 8080
          MONGO_PORT: 27017

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

* In the blueprint, you pass ports as a dictionary. The key of each dictionary is a port that you will open on this container.
  * In the create operation, only Docker Py only needs to know the keys of the dict.
  * In the start operation, the entire dict is passed as the port_binding parameter.

* This operations adds the container_id to the instance runtime_properties.


### Start task

* This starts the container.

* It also logs containers' network settings with IPs, ports, and top information.


### Stop task

* Stops the container.


### Delete task

* Deletes the container and its runtime_properties.

# Complete Example

For a complete working example, please see the [ReadMe](https://github.com/cloudify-cosmo/cloudify-nodecellar-docker-example/tree/{{site.latest_cloudify_version}}) for the Docker Nodecellar Example.
