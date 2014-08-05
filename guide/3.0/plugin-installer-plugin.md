---
layout: bt_wiki
title: Plugin Installer Plugin
category: Plugins
publish: true
abstract: "Cloudify plugin installer description"
pageord: 650
---

{%summary%}
The plugin installer plugin is responsible for installing Cloudify plugins on Cloudify agents and is pre-installed on every Cloudify agent installed using Cloudify's Linux/Windows agent installer.
{%endsummary%}

# Automatic Plugins Installation

When installing a deployment, Cloudify automatically identifies which plugins need to be installed and where (Management/Application machine) and invokes the plugin installer's **install** operation which receives a list of plugins required to be installed.


# Usage

User custom workflows which require plugin installations should invoke the plugin installer's **install** operation - `plugin_installer.tasks.install`.

Plugin installer's **install** operation receives a `plugins` argument which is a list of plugins to install.

Each item in the provided plugins list should be a dictionary containing the following keys:

* `name` - the plugin's name (name in plugin's setup.py file).
* `folder` - the plugin's folder if bundled within a blueprint's plugins folder (optional).
* `url` - the plugin's archive url which will be used by Python pip for installing the plugin (optional).

{%note title=Note%}
Plugin definition should contain one of folder/url keys.
{%endnote%}


In order for installed plugins to be recognized by Cloudify's agent, it is required to restart the agent by invoking the following task - `worker_installer.tasks.restart`.


## Example:

For the following setup.py file:
{% highlight python %}
from setuptools import setup

setup(
    name='cloudify-bash-plugin',
    version='1.0',
    ...
)
{% endhighlight %}

The following `plugins` argument should be provided:

{% highlight python %}

plugins = [
  {
    'name': 'cloudify-bash-plugin',
    'url': 'https://github.com/cloudify-cosmo/cloudify-bash-plugin/archive/1.0.zip'
  }
]

{% endhighlight %}
