---
layout: bt_wiki
title: Bootstrapping on an Existing VM
category: Installation
publish: true
abstract: "Tutorial for bootstrapping on an existing VM"
pageord: 400
---

{%summary%} So, you already have a VM running somewhere and you want to use it to quickly bootstrap a manager on it and start playing around with Cloudify. Hold on tight, because this part is for **you**. {%endsummary%}


# Initialization

First off, in an empty directory, run this from within the shell:

{% highlight sh %}
cfy init simple_provider
{%endhighlight%}

# Configuration

You should now have a file named `cloudify-config.yaml` in this directory which is a configuration skeleton. It should look something along the lines of:


{% highlight yaml %}
public_ip: Enter-Public-IP-Here
private_ip: Enter-Private-IP-Here
ssh_key_path: Enter-SSH-Key-Path-Here
ssh_username: Enter-SSH-Username-Here
context: {} # Optional provider context

# cloudify:
#     server:
#         packages:
#             components_package_url: ""
#             core_package_url: ""
#             ui_package_url: ""
#     agents:
#         packages:
#             ubuntu_agent_url: ""
#             windows_agent_url: ""
#         config:
#             min_workers: 2
#             max_workers: 5
#             remote_execution_port: 22
#             #user: (no default - optional parameter)
#     workflows:
#         task_retries: -1  # -1 means we retry forever
#         retry_interval: 30

#     bootstrap:
#         ssh:
#             initial_connectivity_retries: 20
#             initial_connectivity_retries_interval: 15
#             command_retries: 3
#             retries_interval: 3
#             connection_attempts: 1
#             socket_timeout: 10

{%endhighlight%}

* `public_ip` The ip used to ssh into the VM
* `private_ip` The ip that will be used by services in the manager network to connect to its services (RabbitMQ, etc...)
* `ssh_key_path` The path to the key file used to ssh into the VM
* `ssh_username` The username to ssh into the VM with
* `context` Metadata that should be available to all components/services/agents managed by this manager. Generally, unless you
  have a good reason for doing otherwise, you can leave this property as it is
* `cloudify.agents.config.user` For now this should be the same username entered in `ssh_username`. The need to configure this again
  will be removed in upcoming versions.


# Bootstrapping

When you're done filling in the proper configuration, run this from within the shell, in the same directory as before:


{% highlight sh %}
cfy bootstrap
{%endhighlight%}


{%note title=Note%}
The `bootstrap` command might take some time. If you want to see whats going on during this process, you can run
`cfy bootstrap -v`
{%endnote%}
