---
layout: bt_wiki
title: Docker Plugin (Alpha)
category: Plugins
publish: true
abstract: "Docker plugin description and configuration"
pageord: 210

yaml_link: http://getcloudify.org/spec/docker-plugin/1.1/plugin.yaml
---

{%summary%} The Docker plugin can be used to map node life cycle operations to manage Docker Containers. {%endsummary%}

{%warning title=Disclaimer%}This plugin is in Alpha and has not been thoroughly tested yet.{%endwarning%}

A Cloudify plugin enabling it to create and manipulate Docker containers.

# Blueprints

## An example node specification

{% highlight yaml %}

db_server:

  type: cloudify.nodes.DBMS

  interfaces:
    cloudify.interfaces.lifecycle:
      create:
        implementation: docker.docker_plugin.tasks.create
        inputs:
          daemon_client: {}
          image_import:
            src: http://insert/url/to/image/here
          # could also be image_build, see below
          # image_build: {}
      configure:
        implementation: docker.docker_plugin.tasks.configure
        inputs:
          daemon_client:    {}
          container_config:
            command: /bin/echo hello
      start:
        implementation: docker.docker_plugin.tasks.run
        inputs:
          daemon_client:   {}
          container_start: {}
      stop:
        implementation: docker.docker_plugin.tasks.stop
        inputs:
          daemon_client:  {}
          container_stop: {}
      delete:
        implementation: docker.docker_plugin.tasks.delete
        inputs:
          daemon_client:    {}
          # required in case container to remove is currently running
          container_stop:   {}
          container_remove: {}
{% endhighlight %}

# Operation Properties

The different dictionaries correspond to parameters used in the
[docker python client.](https://github.com/docker/docker-py)

If there is a lack of description of certain parameters,
more details can be found in
[docker command line documentation.](https://docs.docker.com/reference/commandline/cli/)

Here are listed all dictionaries and some of the keys:

* `daemon_client`

    Similar to the parameters of `Client` function in Docker API client.

* `image_import`:

    Similar to the parameters of `import_image` function in Docker API client.

    - `src`(string): an URL to the image.

* `image_build`:

    Similar to the parameters of `build` function in Docker API client.

    - `path`(string): a path to a directory containing a Dockerfile.

    - `fileobj` is not supported.

    - `rm`(bool): Are the intermediate containers to be deleted.

Either `src` in `image_import` dictionary or `path` in `image_build`
must be specified.

* `container_config`:

    Similar to the parameters of `create_container` function in
    Docker API client.

    - Do not provide `image`, it is automatically added to context runtime
      properties during task create.

    - `command`(string): is mandatory. Specifies command that will be executed
      in container.

    - `environment`(dictionary of strings): Specifies environmental variables
      that will be available in container.

    - `ports`(list of integers): a list of ports to open inside the container.

    - `volumes`(list of strings) a list of mountpoints.

* `container_start`:

    Similar to the parameters of `start` function in Docker API client.

    - Do not provide `container`, it is automatically added to context runtime
      properties during task create.

    - `port_bindings`(dictionary of integers): declaration of port bindings.

    - `network_mode`(string)

    - `binds`(dictionary of dictionaries of strings): volume mappings

* `container_stop`:

    Similar to the parameters of `stop` function in Docker API client.

    - Do not provide `container`, it is automatically added to context runtime
      properties during task create.

    - `timeout`(integer): number of seconds to wait for the container to stop
      before killing it.

* `container_remove`:

    Similar to the parameters of `remove_container` function in
    Docker API client.

    - Do not provide `container`, it is automatically added to context runtime
      properties during task create.

    - `remove_image`(bool): additional key, specifies weather or not to
      remove image when removing container.

Description of the rest of the keys can be found in desctiption
of methods in
[an api client for docker.](https://github.com/docker/docker-py)


# Using the plugin

Docker is installed during plugin installation on the host agent if it isn't
already installed. When installing the plugin locally, docker is not installed,
and should be installed manually

## Create task

* Imports or builds image:

    If `image_import` is passed, it imports an image using this dictionary as options.

    If `image_build` is passed, it builds an image using this dictionary as options.

    Either `src` in `image_import` dictionary or `path` in `image_build`
    must be specified.


## Configure task

* Adds `docker_env_var` from context runtime properties with
  `container_config.environment` as environment variables of the container.

* Creates container using the image from `runtime_properties` and options from
  `container_config`. `command` in `container_config` must be specified.

## Run task

* Starts conatiner with `container_start` dictionary as options.

* Logs containers id, list of network interfaces with IPs, ports,
  and top information.

## Stop task

* Stops container with `container_stop` dictionary as options.

## Delete task

* If `remove_image` in `container_remove` dictionary is True then image of
  this container is deleted. If the image is used by another container
  error is raised.

* Deletes container with `container_remove` dictionary as options.

* If container is running, uses `container_stop` configuration to stop the
  container
