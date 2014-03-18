---
layout: bt_wiki
title: Getting Started with Cloudify 3.0
category: Getting Started
publish: false
abstract: Explains how to install Cloudify manager and how to deploy your first application to the Cloud
pageord: 100
--- 
# Meet Cloudify CLI

Cloudify CLI is a tool written in Python that allows the user to init configuration and bootstrap the Cloudify Management Server on different cloud environments (aka Providers). In addition the CLI serves as Cloudify API client providing commands for application deployments and management.

## Providers

A provider is any platform which allows for the creation and bootstrapping of a management server (e.g. Openstack)The CLI can work with any provider. Most providers comes with the CLI package. Custom or additional providers can be installed later. 

Note that the CLI can be used even without the installation / initialization of any providers - if you already possess a bootstrapped management server, you may simply direct the CLI to work with that server (`cfy use <management-ip> -a my-server`), and you can then issue any of the CLI commands to that server (with the exception of the "cfy teardown" command)

# Install Cloudify CLI

For your convinence Cloudify CLI is packaged a self contained executable for different operating systems, so there are no prerequisites or steps to take prior to installation

## Download links

## Install on Windows

## Install on Mac OS

## Install on Linux

# Bootstrapping Your Cloudify Manager

Once you have the CLI installed you can use any of its commands. All the commands start with the keyword **cfy**
Try typing cfy and enter to see all available options.

The next step is to bootstrap a cloudify manager on a cloud. In order to do so you need to take the following steps:

* Initialize the provider
* Edit the provider config file
* Bootstrap the provider

## Initializing a provider

When running the CLI **cfy init** command, a ".cloudify" file will be created in the target directory. All local settings (such as the default management server and aliases) are stored in that file, and only take effect when using the CLI from the target directory.

Additionally to creating the ".cloudify" file, the **cfy init** command will also create a provider-specific configuration file named "cloudify-config.yaml". These files are only required for the **cfy bootstrap** command (which expects to find this file by their default names, but may also accept path as parameter).

<!--All initial configuration parameters in "cloudify-config.yaml" are mandatory fields that must be supplied by the user. "cloudify-config.defaults.yaml", on the other hand, stores more advanced configuration parameters.  
The values of "cloudify-config.defaults.yaml" are only considered if missing from "cloudify-config.yaml", and therefore they can be modified either in-place or simply overridden by assigning different values to them in "cloudify-config.yaml".-->

Note: If the Cloudify working directory is also a git repository, it's recommended to add ".cloudify" to the .gitignore file.

## Configuring the provider

The cloudify-configuration.yaml file, gives you the option to customize anything you want in your environment. However, in most cases you only need to edit the user credentials. Other settings are commented out, so you can see your options and default values. 

The following snippet applies to the OpenStack provider. For other providers read [Cloudify Providers](#)

    keystone:
        username: [ENTER YOUR USERNAME HERE]
        password: [ENTER YOUR PASSWORD HERE]
        tenant_name: [ENTER YOUR PROJECT NAME HERE]




## Bootstrapping Cloudify 

Now you are ready to bootstrap using the `cfy bootstrap` command

You can use the `cfy bootstrap -h` for more options. 

Be patient, this task can take sometime based on the network speed between your laptop to the cloud and the cloud speed of provsioning network and hosts




# Deploy your first application

  - Upload your blueprint:  
  `cfy blueprints upload my-app/blueprint.yaml -a my-blueprint`

  - Create a deployment of the blueprint:  
  `cfy deployments create my-blueprint -a my-deployment`

  - Execute an install operation on the deployment:  
  `cfy deployments execute install my-deployment`

This will install your deployment - all you have left to do is sit back and watch the events flow by until the deployment is complete.


# Command Reference

**Command:** status

**Description:** queries the status of the management server

**Usage:** `cfy status [-t, --management-ip <ip>]`

**Parameters**:

- management-ip: the management-server to use (Optional)

**Example:** `cfy status`

------
  
**Command:** use

**Description:** defines a default management server to work with

**Usage:** `cfy use <management_ip> [-a, --alias <alias>] [-f, --force]`

**Parameters**:

- management_ip: the management-server to define as the default management server
- alias: a local alias for the given management server address (Optional)
- force: a flag indicating authorization to overwrite the alias provided if it's already in use (Optional)

**Example:** `cfy use 10.0.0.1 -a my-mgmt-server`
  
------
  
**Command:** init

**Description:** initializes a cloudify working directory for a given provider

**Usage:** `cfy init <provider> [-t, --target-dir <dir>]`

**Parameters**:

- provider: the cloudify provider to use for initialization
- target-dir: the directory that will be used as the cloudify working directory (Optional)

**Example:** `cfy init openstack`
  
------
  
**Command:** bootstrap

**Description:** bootstraps cloudify on the current provider

**Usage:** `cfy bootstrap [-c, --config-file <file>] [-d, --defaults-config-file <file>]`

**Parameters**:

- config-file: path to the config file (Optional)
- defaults-config-file: path to the defaults config file (Optional)

**Example:** `cfy bootstrap`
  
------
  
**Command:** teardown

**Description:** tears down the management-server, as well as any local aliases under its context

**Usage:** `cfy teardown [-f, --force] [-t, --management-ip <ip>]`

**Parameters**:

- force: a flag indicating confirmation for this irreversable action (Optional)
- management-ip: the management-server to use (Optional)

**Example:** `cfy teardown -f`
  
------
  
**Command:** blueprints upload

**Description:** uploads a blueprint to the management server
  
**Usage:** `cfy blueprints upload <blueprint_path> [-a, --alias <alias>] [-t, --management-ip <ip>]`

**Parameters**:

- blueprint_path: path to the blueprint (yaml file) to upload
- alias: a local alias for the blueprint id that will be created for the uploaded blueprint (Optional)
- management-ip: the management-server to use (Optional)

**Example:** `cfy blueprints upload blueprint.yaml -a my-blueprint`
  
------
  
**Command:** blueprints list

**Description:** lists the blueprint on the management server, as well as the blueprints local aliases
  
**Usage:** `cfy blueprints list [-t, --management-ip <ip>]`

**Parameters**:

- management-ip: the management-server to use (Optional)

**Example:** `cfy blueprints list`
  
------
  
**Command:** blueprints delete

**Description:** deletes the blueprint from the management server
  
**Usage:** `cfy blueprints delete <blueprint_id> [-t, --management-ip <ip>]`

**Parameters**:

- blueprint_id: the id or alias of the blueprint to delete
- management-ip: the management-server to use (Optional)

**Example:** `cfy blueprints delete my-blueprint`
  
------
  
**Command:** blueprints alias

**Description:** creates a local alias for a blueprint id
  
**Usage:** `cfy blueprints alias <alias> <blueprint_id> [-f, --force] [-t, --management-ip <ip>]`

**Parameters**:

- alias: the alias for the blueprint id
- blueprint_id: the id of the blueprint
- force: a flag indicating authorization to overwrite the alias provided if it's already in use (Optional)
- management-ip: the management-server to use (Optional)

**Example:** `cfy blueprints alias my-blueprint 38f8520f-809f-4162-ae96-75555d906faa`

------
  
**Command:** deployments create

**Description:** creates a deployment of a blueprint
  
**Usage:** `cfy deployments create <blueprint_id> [-a, --alias <alias>] [-t, --management-ip <ip>]`

**Parameters**:

- blueprint_id: the id or alias of the blueprint to deploy
- alias: a local alias for the deployment id that will be created for the new deployment (Optional)
- management-ip: the management-server to use (Optional)

**Example:** `cfy deployments create my-blueprint -a my-deployment`  

------
  
**Command:** deployments execute

**Description:** executes an operation on a deployment
  
**Usage:** `cfy deployments execute <operation> <deployment_id> [-t, --management-ip <ip>]`

**Parameters**:

- operation: the name of the operation to execute
- deployment_id: the deployment id or alias on which the operation should be executed
- management-ip: the management-server to use (Optional)

**Example:** `cfy deployments execute install my-deployment`
  
------
  
**Command:** deployments alias

**Description:** creates a local alias for a deployment id
  
**Usage:** `cfy deployments alias <alias> <deployment_id> [-f, --force] [-t, --management-ip <ip>]`

**Parameters**:

- alias: the alias for the deployment id
- deployment_id: the id of the deployment
- force: a flag indicating authorization to overwrite the alias provided if it's already in use (Optional)
- management-ip: the management-server to use (Optional)

**Example:** `cfy deployments alias my-deployment 38f8520f-809f-4162-ae96-75555d906faa` 


# Creating a new provider extension:
Provider extensions are simply Python modules which adhere to certain conventions and implement a certain interface.  

By convention, the module name is called "cloudify_<provider-name>.py". While any name is viable in practice, the CLI **cfy init** command, which receives a '*provider*' parameter, is set to first search for a module named by the convention, and only search for the exact '*provider*' value given if such a module was not found.

Every provider extention is expected to implement the following interface:

  - **init**(*logger*, *target_directory*, *config_file_name*, *defaults_config_file_name*)  
    this method is used to create the two configuration files with the supplied names at the given target directory, as well as make any other initializations required by the specific provider
  
  - **bootstrap**(*logger*, *config*)  
    this method is used to bootstrap the management server as well as the environment (e.g. network) in which it resides. The method must then __return the IP of the bootstrapped management server__
  
  - **teardown**(*logger*, *management_ip*)  
    this method is used to tear down the server at the address supplied, as well as any environment objects related to the server which will no longer be of use.



