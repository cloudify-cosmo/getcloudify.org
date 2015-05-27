---
layout: bt_wiki
title: Cloudify Manager Watchdog Guide
category: Guides
publish: true
abstract: "Guide for Cloudify Manager Watchdog"
pageord: 900
---
{%summary%}{{page.abstract}}{%endsummary%}



{%note title=Note%}
The Cloudify manager watchdog is a premium feature, available only in the commercial version of Cloudify.
{%endnote%}


# Overview

The Cloudify manager watchdog is a long-running Python process which monitors a Cloudify manager, and attempts to revive it if it goes down or is unresponsive.


# Usage

The manager watchdog may run in any environment which contains the requirements for performing recovery of the manager - meaning that it requires connectivity to the manager machine and the private key file used to connect to the manager's host (The key will be used to connect to the new host, which will be assigned with the same public key as the original host, in a recovery scenario).

{%info title=Information%}
The manager watchdog is agnostic to Cloudify's security features, in the sense that it'll use them transparently when they're configured, without any additional setup or configuration to the watchdog itself.
{%endinfo%}

The manager watchdog is operated via the command-line program `cfy-watchdog`. Mandatory arguments are the monitored manager's IP and the path to the private key file.

{%note title=Note%}
When attempting recovery of the manager, the watchdog will run a local workflow similar to the one run during bootstrap. It is therefore needed for any plugins required by the manager-blueprint which was used in bootstrap to be installed in the manager watchdog's environment as well.

The `cfy-watchdog` program provides an option (similar to the one provided by the Cloudify CLI) to install any required plugins, by using the `--install-plugins` flag when launching the manager watchdog.
{%endnote%}

Additional configuration parameters include the watchdog's intervals and thresholds settings (e.g. watch interval, cooldown period etc.), as well as logging options (by default, the watchdog will log all output inside the process' stdout).

{%tip title=Tip%}
Use `-h` with any incomplete `cfy-watchdog` command to learn about the syntax and options.
{%endtip%}


The manager must be up and available at the time when the watchdog is first launched, since the watchdog requires context information from the manager.
However, it's important to note that the manager is not required to be so when the watchdog is re-launched (e.g. when the watchdog is installed as a service and its host rebooted) - the watchdog will recognize its target manager is down and perform recovery as expected.



# Examples

An example for an Openstack manager blueprint which deploys the manager watchdog during bootstrap is available in the [Cloudify-watchdog repository](https://github.com/cloudify-cosmo/cloudify-watchdog/tree/3.2/examples) (private repository).




# Running as a service

It's recommended to run the manager watchdog as a service.
The following is an example configuration on Ubuntu Trusty (using Upstart)

{% highlight bash %}
start on runlevel [2345]
stop on runlevel [016]

respawn
respawn limit 10 5

env CLOUDIFY_USERNAME=<username>
env CLOUDIFY_PASSWORD=<password>

/usr/local/bin/cfy-watchdog -t <manager_ip> -k <keypair_path> --logger-enabled --logger-file-path <log_file_path>

{%endhighlight%}