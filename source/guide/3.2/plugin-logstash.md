---
layout: bt_wiki
title: Logstash Plugin
category: Contributed Plugins
publish: true
abstract: Cloudify Logstash Plugin description and usage
pageord: 650
---

{%summary%}The Logstash plugin allows users to provide a static logstash config and install a logstash agent on their Cloudify Compute nodes.
{%endsummary%}

# Plugin Requirements

* Python Versions:
  * 2.7.x

# Compatibility

* This is tested with Logstash Version 1.5.0.

# Node Types

## logstash.nodes.Service

**Derived From:** [cloudify.nodes.ApplicationServer](reference-types.html)

**Properties:**

  * `conf` *Required*.
    * A dict containing these keys:
      * `type`: Possible values: static or template (Not currently supported.). Default: static.
      * `path`: The path to a static or template configuration file. (Relative in Blueprint archive.)
      * `destination_path`: The full path where you want to save the file described in conf. Default: /etc/logstash/conf/logstash.conf
      * `inline`: An inline static configuration if you want.

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` Installs logstash.
    * **Inputs:**
      * `package_url` An alternate download url for rpm or deb files.
  * `cloudify.interfaces.lifecycle.configure` Puts your configuration in the desired path.
    * **Inputs:**
      * `conf` Sources from the above conf in the properties. Override allowed.
  * `cloudify.interfaces.lifecycle.start` Starts logstash.
    * **Inputs:**
      * `command` Allows you to override the start command.
  * `cloudify.interfaces.lifecycle.stop` Stops logstash.
      * `command` Allows you to override the stop command.


# Node Template Examples

The first example shows an inline config.

{% highlight yaml %}

  logstash_node:
    type: logstash.nodes.Service
    properties:
      conf:
        type: static
        destination_path: /etc/logstash/conf.d/logstash.conf
        inline: |
          input { stdin { type => "stdin-type"}}
          output { stdout { debug => true debug_format => "json"}}


{% endhighlight %}

The next example shows providing the path to a static config, and also overriding the start command.

{% highlight yaml %}

  logstash_node:
    type: logstash.nodes.Service
    properties:
      conf:
        type: static
        path: logstash/somenode.logstash.conf
        destination_path: /opt/logstash/conf
    interfaces:
      cloudify.interfaces.lifecycle:
        start:
          implementation: logstash.logstash_plugin.tasks.start
          inputs:
            command:
              default: /opt/logstash/bin/logstash -f /opt/logstash/conf

{% endhighlight %}

