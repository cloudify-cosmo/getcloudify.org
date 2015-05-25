---
layout: bt_wiki
title: Tearing Down
category: Getting Started
publish: true
abstract: How to delete the management environment related resources
pageord: 800
---
{%summary%} {{page.abstract}}{%endsummary%}


# Overview

It's also possible to delete the Manager and its accompanying resources (the servers, networks, security groups and any other resource that was configured within the Manager Blueprint) via the CLI.


# Actionable: Teardown the management environment

Next, you can teardown the management environment if you have no use for it anymore.

This can be done by issuing the following command:

{% highlight bash %}
cfy teardown -f
{% endhighlight %}

This will terminate the manager VM and delete the resources associated with it.

# So What Now?

* You can now [write your own plugin](guide-plugin-creation.html) to be able to utilize tools of your chooseing via Cloudify.
* Product Overview will provide you with deeper understanding on how Cloudify is built.