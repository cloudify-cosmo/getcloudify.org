---
layout: bt_wiki
title: CLI Tasks Reference
category: Reference
publish: true
abstract: "high level information on the Cloudify CLI tasks"
pageord: 900
---

{%summary%}
These tasks are used in [Manager blueprints](reference-terminology.html#manager-blueprints) to bootstrap a Cloudify Manager.
This page will give a high level description of them.
{%endsummary%}


# bootstrap

## Overview

This bootstrap task uses the Fabric plugin to bootstrap a Cloudify Manager.

It's currently a part of the CLI code, and can be found at / mapped to: `cloudify_cli.bootstrap.tasks.bootstrap`.

The task does the following:

1) It connects to the Manager machine, downloads the various Cloudify packages and installs them.

2) If supplied with one, it uploads an agent private key file to the Manager machine.

3) It sets various runtime-properties on the *manager* node instance - this will later be used by the CLI to extract data in order to set the configuration for the local environment.

4) It uploads the [*provider context*](reference-terminology.html#provider-context) object to the Manager via the Manager's REST service.


## API

The bootstrap task takes several parameters:

  * ***cloudify_packages*** - This is the only required parameter. It points at links of Cloudify packages to be installed on the Manager, and it should be in the same schema as the *manager*'s node `cloudify_packages` property. See the reference for the [CloudifyManager type](reference-types.html#cloudifymanager-type) for more information.

  * ***agent_local_key_path*** - Optional parameter. Sets the agent private key local file path. This file will be uploaded to the Manager machine and be used by default for setting up and connecting to Cloudify agent hosts. If omitted, no agent key file will be uploaded to the Manager machine.

  * ***agent_remote_key_path*** - Optional parameter. Sets the agent private key remote file path. This is the path on the manager to which the agent private key file will be uploaded. If this parameter is omitted, the file will placed in `~/.ssh/agent_key.pem`.

  * ***manager_private_ip*** - Optional parameter. This is the IP that will be used by agent hosts to communicate with the Manager machine (it should be the private IP since they communicate via an internal network). If this parameter is omitted, the *manager*'s node instance's `host_ip` will be used instead.

  * ***provider_context*** - Optional parameter. *Provider context* is a deprecated feature that allows for setting Manager-level context information with data created during the bootstrap process, used primarily to improve accessibility in plugins. Note that whether this parameter is supplied or not, a *provider context* object will be uploaded to the server, as additional information is automatically appended to it by the bootstrap task.


{%note title=Note%}
While not explicitly a part of the signature of the bootstrap task,
the Manager's private IP is somewhat of a parameter to the task as well: If it isn't set explicitly for
the Fabric plugin (using the `host_string` parameter), then the Fabric plugin will attempt to use
the *manager*'s node instance's `host_ip` instead, and try and connect to it.
{%endnote%}

# bootstrap_docker

## Overview

This bootstrap_docker task uses the Fabric plugin to bootstrap a Cloudify Manager docker containers.

It's currently a part of the CLI code, and can be found at / mapped to: `cloudify_cli.bootstrap.tasks.bootstrap_docker`.

The task does the following:

1) It connects to the Manager machine.

  - if the machine is an Ubuntu 14.04 without docker installed, it installs docker.
  - otherwise, docker must be installed on the machine.

2) It download the cloudify manager docker container and starts it.

3) If supplied with one, it uploads an agent private key file to the Manager machine.

4) It sets various runtime-properties on the *manager* node instance - this will later be used by the CLI to extract data in order to set the configuration for the local environment.

5) It uploads the [*provider context*](reference-terminology.html#provider-context) object to the Manager via the Manager's REST service.

## API

The bootstrap task takes several parameters:

  * ***cloudify_packages*** - This is the only required parameter. It points at links of Cloudify packages to be installed on the Manager, and it should be in the same schema as the *manager*'s node `cloudify_packages` property. See the reference for the [CloudifyManager type](reference-types.html#cloudifymanager-type) for more information.

  * ***agent_local_key_path*** - Optional parameter. Sets the agent private key local file path. This file will be uploaded to the Manager machine and be used by default for setting up and connecting to Cloudify agent hosts. If omitted, no agent key file will be uploaded to the Manager machine.

  * ***agent_remote_key_path*** - Optional parameter. Sets the agent private key remote file path. This is the path on the manager to which the agent private key file will be uploaded. If this parameter is omitted, the file will placed in `~/.ssh/agent_key.pem`.

  * ***manager_private_ip*** - Optional parameter. This is the IP that will be used by agent hosts to communicate with the Manager machine (it should be the private IP since they communicate via an internal network). If this parameter is omitted, the *manager*'s node instance's `host_ip` will be used instead.

  * ***provider_context*** - Optional parameter. *Provider context* is a deprecated feature that allows for setting Manager-level context information with data created during the bootstrap process, used primarily to improve accessibility in plugins. Note that whether this parameter is supplied or not, a *provider context* object will be uploaded to the server, as additional information is automatically appended to it by the bootstrap task.

  * ***docker_path*** - Optional parameter. Sets the docker executable file path to be used on the host VM. If this parameter is omitted, `docker` command will be used instead thereby having the docker executable be determined by the paths defined in the ***PATH*** environment variable.

  * ***use_sudo*** - Optional parameter. This flag is used to set run permissions on the host VM during bootstrap. If this parameter is omitted, sudo permissions will be used by default.

  * ***docker_service_start_command*** - Optional parameter. The command to use in order to start the docker daemon. If not set, `service docker start` will be assumed.


{%note title=Note%}
While not explicitly a part of the signature of the bootstrap task,
the Manager's private IP is somewhat of a parameter to the task as well: If it isn't set explicitly for
the Fabric plugin (using the `host_string` parameter), then the Fabric plugin will attempt to use
the *manager*'s node instance's `host_ip` instead, and try and connect to it.
{%endnote%}

# stop_manager_container

## Overview

The stop_manager_container task uses the Fabric plugin to stop the cloudify manager docker container.

It's currently a part of the CLI code, and can be found at / mapped to: `cloudify_cli.bootstrap.tasks.stop_manager_container`.

The task does the following:

1) It connects to the Manager machine and run the command that stops the container (usually `sudo docker stop cfy`)

## API

The bootstrap task takes several parameters:

  * ***docker_path*** - Optional parameter. Sets the docker executable file path to be used on the host VM. If this parameter is omitted, `docker` command will be used instead thereby having the docker executable be determined by the paths defined in the ***PATH*** environment variable.

  * ***use_sudo*** - Optional parameter. This flag is used to set run permissions on the host VM during bootstrap. If this parameter is omitted, sudo permissions will be used by default.

# stop_docker_service

## Overview

The stop_docker_service task uses the Fabric plugin to stop the docker service.

It's currently a part of the CLI code, and can be found at / mapped to: `cloudify_cli.bootstrap.tasks.stop_docker_service`.

The task does the following:

1) It connects to the Manager machine and run the command that stops the docker service.

## API

The bootstrap task takes several parameters:

  * ***docker_service_stop_command*** - Optional parameter. The command to use in order to stop the docker daemon. If not set, `service docker stop` will be assumed.

  * ***use_sudo*** - Optional parameter. This flag is used to set run permissions on the host VM during bootstrap. If this parameter is omitted, sudo permissions will be used by default.

# Internals

* Before being uploaded to the Manager, the *provider context* that was passed to the bootstrap method via the *provider_context* parameter is transformed: it is augmented with a new field named `cloudify` (if no *provider_context* was passed at all, this will be the only field). This field is then filled with the data from the *manager* node's `cloudify` property. Additionally, the `cloudify`.`cloudify_agent`.`agent_key_path` property is reassigned with the path of the agent private key remote file path.

* The runtime properties set by the bootstrap task on the *manager* node instance are:
  
  * *provider* - holds the actual *provider context* object that was uploaded to the Manager.
  * *manager_ip* - holds the Manager machine's public IP.
  * *manager_user* - holds the user that is used to connect to the Manager machine.
  * *manager_key_path* - holds the path to the local private key file that is used to connect to the Manager machine.

  These runtime properties are later extracted and stored by the CLI in a local context, which simplifies working with the new Manager.
