---
layout: bt_wiki
title: Bootstrapping Manually
category: Installation
publish: false
abstract: Intalling Cloudify on a local machine
pageord: 500

prereqs_link: installation-general.html
downloads_link: http://getcloudify.org/downloads/get_cloudify_3x.html
installation_link: installation-general.html
---
{%summary%}{{page.abstract}}{%endsummary%}

{%warning title=Disclaimer%}This installation method is aimed at advanced users or if [bootstrapping on an existing VM](reference-simple-manager.html) isn't suitable.{%endwarning%}

You can install Cloudify by directly downloading the packages and installing them on a machine of your choosing (just remember to checkout the [Prerequisites]({{page.prereqs_link}}#prerequisites) before installing.)
We'll assume you're installing the manager on Ubuntu and using Centos hosts.


# Download

You will need to download the manager packages.
Please refer to the [Downloads]({{page.downloads_link}}) page.

# Install

For more information on the packages, please refer to the [Cloudify installation page]({{page.installation_link}}).

## Components and Core packages

* run `sudo dpkg -i /path/to/your/cloudify-components-package.deb`
* run `sudo dpkg -i /path/to/your/cloudify-core-package.deb`
* run `sudo /cloudify-components/cloudify-components-bootstrap.sh`
* run `sudo /cloudify-core/cloudify-core-bootstrap.sh #USER# #PRIVATEIP#` where USER is the user you want to use to install (defaults to `ubuntu`) and PRIVATEIP is the IP of the management network the manager is in (defaults to `eth0`).

## Agents

* run `sudo dpkg -i /path/to/your/cloudify-centos-agent-package.deb`
* run `sudo dpkg -i /path/to/your/cloudify-ubuntu-agent-package.deb`
* run `sudo dpkg -i /path/to/your/cloudify-windows-agent-package.deb`

## UI
* run `sudo dpkg -i /path/to/your/cloudify-ui-package.deb`

You can now direct your browser at http://manager-ip-address to access the UI or run `cfy use manager-ip-address` (depending on what interface you're using).

Enjoy!