---
layout: bt_wiki
title: Python Client
category: APIs
publish: true
abstract: REST Client API Documentation for the Cloudify Manager
pageord: 400
---

{%summary%}
In this section you will find information about our python API client.
Read our <a href="http://cloudify-rest-client.readthedocs.org/en/3.2/" target="_blank">technical documentation</a> for more information
{%endsummary%}


# Python Client

To use this client run the command `pip install  cloudify-rest-client==3.2.0` or add it to your dependencies file.

Here is an example of how to get blueprints

{% highlight python %}

from cloudify_rest_client import CloudifyClient

client = CloudifyClient('http://MANAGER_HOST')
blueprints = client.blueprints.list()

for blueprint in blueprints:
print blueprint.id

{%endhighlight%}