---
layout: bt_wiki
title: Tearing Down
category: Getting Started
publish: true
abstract: How to delete the management environment related resources
pageord: 700
---
{%summary%} {{page.abstract}}{%endsummary%}


# Overview

Cloudify also exposes a function for deleting the management environment and its accompanying resources (the servers, networks, security groups and any other resources that were configured within the manager blueprint).


# Teardown the management environment

Next, you can teardown the management environment if you have no use for it anymore.

This can be done by issuing the following command:

{% highlight bash %}
cfy teardown -f
{% endhighlight %}

This will terminate the manager VM and delete the resources associated with it.