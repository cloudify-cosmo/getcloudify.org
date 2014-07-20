---
layout: bt_wiki
title: Bootstrap Manually
category: Installation
publish: true
abstract: Intalling Cloudify on a local machine
pageord: 29

prereqs_link: installation-general.html
components_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_5/cloudify-components_3.0.0-rc1-b5_amd64.deb
core_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_5/cloudify-core_3.0.0-rc1-b5_amd64.deb
ubuntu_agent_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_5/cloudify-ubuntu-agent_3.0.0-rc1-b5_amd64.deb
centos_agent_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_5/cloudify-centos-agent_3.0.0-rc1-b5_amd64.deb
windows_agent_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_5/cloudify-windows-agent_3.0.0-rc1-b5_amd64.deb
ui_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_5/cloudify-ui_3.0.0-rc1-b5_amd64.deb
linux_cli_64_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_5/cloudify-cli_3.0.0-rc1-b5_amd64.deb
linux_cli_32_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_5/cloudify-cli_3.0.0-rc1-b5_i386.deb
---
{%summary%}{{page.abstract}}{%endsummary%}

{%warning title=Disclaimer%}This installation method is aimed at advanced users or if [bootstrapping on an existing VM](installation-simple-provider.html) isn't suitable.{%endwarning%}

You can install Cloudify by directly downloading the packages and installing them on a machine of your choosing (just remember to checkout the [Prerequisites]({{page.prereqs_link}}#prerequisites) before installing.)
We'll assume you're installing the manager on Ubuntu and using Centos hosts.


# Download

You will need to download the following in the machine you want to install the manager on:

* **[Components Package]({{page.components_link}})**
* **[Core Package]({{page.core_link}})**

You will have to download the agents that correspond with your management server OS distribution and host machines.
For instance, if your manager is installed on Ubuntu and your hosts are running Centos, download both.

* **[Ubuntu Agent Package]({{page.ubuntu_agent_link}})**
* **[Centos Agent Package]({{page.centos_agent_link}})**
* **[Windows Agent Package]({{page.windows_agent_link}})**

and optionally:

* **[UI Package]({{page.ui_link}})**

You can also download the cli to connect to the management machine after it was installed:

* **[Linux CLI 64bit]({{page.linux_cli_64_link}})**
* **[Linux CLI 32bit]({{page.linux_cli_32_link}})**


# Install

## Components and Core packages

* run `sudo dpkg -i /path/to/your/cloudify-components-package.deb`
* run `sudo dpkg -i /path/to/your/cloudify-core-package.deb`
* run `sudo /cloudify-components/cloudify-components-bootstrap.sh`
* run `sudo /cloudify-core/cloudify-core-bootstrap.sh #USER# #PRIVATEIP#` where USER is the user you want to use to install (defaults to `ubuntu`) and PRIVATEIP is the IP of the management network the manager is in (defaults to `eth0`).

## Agents

* run `sudo dpkg -i /path/to/your/cloudify-centos-agent-package.deb`
* run `sudo dpkg -i /path/to/your/cloudify-ubuntu-agent-package.deb`

## UI
* run `sudo dpkg -i /path/to/your/cloudify-ui-package.deb`

You can now direct your browser at http://manager-ip-address to access the UI or run `cfy use manager-ip-address` (depending on what interface you're using).

Enjoy!