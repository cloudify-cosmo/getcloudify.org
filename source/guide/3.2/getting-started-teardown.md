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

It's also possible to delete the Manager and its accompanying resources (the servers, networks, security groups and any other resources that were configured within the manager blueprint) via the CLI.


# Step 11: Teardown the management environment

Next, you can teardown the management environment if you have no use for it anymore.

This can be done by issuing the following command:

{% highlight bash %}
cfy teardown -f
{% endhighlight %}

This will terminate the manager VM and delete the resources associated with it.

# So What Now?

* You can now [write your own plugin](guide-plugin-creation.html) to be able to utilize tools of your chooseing via Cloudify.
* Product Overview will provide you with deeper understanding on how Cloudify is built.