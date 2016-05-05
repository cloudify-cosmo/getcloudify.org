---
layout: bt_wiki
title: Offline Guide
category: Guides
publish: true
abstract: Configuring Cloudify to work in an offline environment
pageord: 800


---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

This guide will quickly explain how to bootstrap and install a simple blueprint using an Offline OpenStack environment.

We will create a PyPi mirror and an HTTP server with relevant files, that will serve our Cloudify manager and agents.

We will be using [Bandersnatch](https://pypi.python.org/pypi/bandersnatch) as a PyPi mirror and [NGINX](http://nginx.org/) as an HTTP server for Cloudify and proxy to Bandersnatch.

{%note title=Note%}
For initial setup of our PyPi mirror / HTTP server we will need an internet connection.
{%endnote%}

# Step By Step Tutorial

## Setup the PyPi mirror and HTTP server

### Step 1 - Launch an instance

Launch an Ubuntu instance in OpenStack on a particular network (should be connected to the external network for now) and attach a floating ip to it.
This instance will serve as our PyPi mirror and HTTP server.  
This instance will have to store a full PyPi copy, so consider your disk size.

### Step 2 - Install and configure Bandersnatch and NGINX

- Copy the following files to the instance that you have just created:  

    - [provision.sh](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-packager/7e7ee9c9422b4fe91cba54adcd2ca339b23e8ab9/offline-configuration/provision.sh)
    - [nginx.conf](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-packager/7e7ee9c9422b4fe91cba54adcd2ca339b23e8ab9/offline-configuration/nginx.conf)
    - [bandersnatch.conf](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-packager/7e7ee9c9422b4fe91cba54adcd2ca339b23e8ab9/offline-configuration/bandersnatch.conf)

- Configure the `HOME_FOLDER` and `FILES_DIR` variables in `provision.sh` to point at the user’s home folder and to a folder that stores these files, accordingly.
- Run `provision.sh` , note that this script starts a `nohup` process that clones PyPi (100 GB+), so this process might take some time, depending on your network connection and PyPi.  

After this process has finished we have a PyPi mirror and an HTTP server up and running.

### Step 3 - Adding relevant files to our HTTP server
Now we need to **recursively** add to the HTTP server all the files that will be used by our Blueprint, in order to make them available to Cloudify.  
In our `bandersnatch.conf` file we have configured the following:

    location /cloudify/ {
        root /srv/;
    }

This means that nginx will serve the files located under `/srv/cloudify` on `<server-ip>:<server-port>/cloudify`. So we need to make every file that is used in our blueprint available under /srv/cloudify.  
For example have a look at the [Hello-World example](https://github.com/cloudify-cosmo/cloudify-hello-world-example). In `blueprint.yaml` we import `http://www.getcloudify.org/spec/openstack-plugin/1.1/plugin.yaml`, but you can see that [plugin.yaml](http://www.getcloudify.org/spec/openstack-plugin/1.1/plugin.yaml) is using `https://github.com/cloudify-cosmo/cloudify-openstack-plugin/archive/1.1.zip`. So we must make [plugin.yaml](http://www.getcloudify.org/spec/openstack-plugin/1.1/plugin.yaml) as well as [1.1.zip](https://github.com/cloudify-cosmo/cloudify-openstack-plugin/archive/1.1.zip) available on our HTTP server.

### Step 4 - Creating a template image for Cloudify
In order to configure pip and Easy-install to use our PyPi mirror instead of the PyPi central repository by default we will have to create a template image with configuration files for pip and Easy-install.  
In order to do so we will launch an instance and pre-configure it.  
You can choose any base image that matches the required manager image as described in the [prerequisites](installation-general.html#prerequisites) section. We will be using ubuntu precise.  
After launcing an instance you will have to:

- Download [pip.conf](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-packager/7e7ee9c9422b4fe91cba54adcd2ca339b23e8ab9/offline-configuration/pip.conf) and save it under `$HOME/.pip`. Configure `<PyPi-mirror-ip>` to point at the IP of your PyPi mirror / HTTP server.
- Download [.pydistutils](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-packager/7e7ee9c9422b4fe91cba54adcd2ca339b23e8ab9/offline-configuration/.pydistutils) and save it under `$HOME`. Configure `<PyPi-mirror-ip>` to point at the IP of your PyPi mirror / HTTP server.
- Remove your public key from `~/.ssh` in order to allow other users to connect to this image. 

Create a Snapshot from this image and call it `cfy-template`.

# Test drive your offline configuration

We will be using our configuration to bootstrap Cloudify manager and install the Hello-World Blueprint.

### Step 1 - Launch a client instance

Launch an instance in OpenStack, connect it to the same network as the HTTP server.

### Step 2 - Install Cloudify CLI

Install the CLI package as described in the [installation guide](installation-cli.html) on the client instance that you have just started.

### Step 3 - Download the Hello-World example

Download the Hello-World example to the client instance.
You can either download the zip file from the [hello-World repo](https://github.com/cloudify-cosmo/cloudify-hello-world-example) (use the `3.1` tag)
or 
{%highlight bash%}
git clone https://github.com/cloudify-cosmo/cloudify-hello-world-example.git
cd cloudify-hello-world-example
git checkout tags/3.1
{%endhighlight%}

### Step 4 - Upload the relevant files to the HTTP Server

We need to make all the files required by the Blueprint available in our HTTP server. To do this we will check `blueprint.yaml` for external files **recursively**.  
`blueprint.yaml` is using the following external files:

- [types.yaml](http://www.getcloudify.org/spec/cloudify/3.1/types.yaml)
- [plugin.yaml](http://www.getcloudify.org/spec/openstack-plugin/1.1/plugin.yaml)

`types.yaml` is using the following external files:

- [threshold.clj](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-manager/master/resources/rest-service/cloudify/policies/threshold.clj)
- [host_failure.clj](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-manager/master/resources/rest-service/cloudify/policies/host_failure.clj)
- [execute_workflow.clj](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-manager/master/resources/rest-service/cloudify/triggers/execute_workflow.clj)

`plugin.yaml` is using the following external files:

- [1.1.zip](https://github.com/cloudify-cosmo/cloudify-openstack-plugin/archive/1.1.zip)

We need to make all of these files available under `/srv/cloudify` in our HTTP server. A best practice would be to make each file available under its full path. For example store `http://www.getcloudify.org/spec/cloudify/3.1/types.yaml` under `/srv/cloudify/spec/cloudify/3.1/types.yaml` etc.  

Also note that the location of `types.yaml` has just changed to `<HTTP-server-IP>:<HTTP-server-port>/cloudify/spec/cloudify/3.1/types.yaml` so we will have to change it in our `blueprint.yaml` file as well.  
We need to repeat this process for each of the files that are used by our `blueprint.yaml`, **recursively**.

### Step 5 - Bootstrap, upload a blueprint, create a deployment and install it
Everything is ready for the final step:  

Follow the instructions under the [bootstrapping guide](http://localhost:8080/guide/3.1/installation-bootstrapping.html). Use the `cfy-template` snapshot that you have created before as the image for the Cloudify management machine.  
Then
{% highlight bash %} cfy blueprints upload -p <PATH-TO-BLUEPRINT> -b hello-offline
{%endhighlight%}
in order to upload the blueprint to the management server.

{% highlight bash %} cfy deployments create -b hello-offline -d hello-offline -i <PATH-TO-INPUTS-FILE>
{%endhighlight%}
In order to create a deployment.

{%note title=Note%}
You might want to consult the [inputs reference](dsl-spec-inputs.html), as the Hello-World blueprint requires using inputs.
{%endnote%}

{% highlight bash %} cfy executions start -d hello-offline -w install
{%endhighlight%}
In order to install the deployment.

When the installation of the deployment is finished, you'll have an installed Hello-World app in an offline environment.