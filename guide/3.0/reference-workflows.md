---
layout: bt_wiki
title: Workflows Reference
category: Reference
publish: true
abstract: "Cloudify workflows short description and details on install and uninstall default workflows"
pageord: 100

types_yaml_link: http://getcloudify.org/spec/cloudify/3.0/types.yaml

# TODO: change develop --> 3.0 right before the release, it is currently develop because there is no 3.0 tag yet
default_workflows_source_link: https://github.com/cloudify-cosmo/cloudify-manager/blob/develop/workflows/workflows/default.py

---

{%summary%} Install and Uninstall Workflows {%endsummary%}

Cloudify comes with 2 built in workflows: `install` and `uninstall`. What follows is a high level description in pseudocode of these workflows.

# Install

{% highlight python %}
for each node
  for each node instance
    1) wait for node instance relationships to be started
    2) execute 'cloudify.interfaces.lifecycle.create' operation
    3) execute 'cloudify.interfaces.relationship_lifecycle.preconfigure' relationship operations
    2) execute 'cloudify.interfaces.lifecycle.configure' operation
    3) execute 'cloudify.interfaces.relationship_lifecycle.postconfigure' relationship operations
    2) execute 'cloudify.interfaces.lifecycle.start' operation
    4) if node instance is host node:
    5)   wait for host to be started
    6)   install agent worker and plugins
    3) execute 'cloudify.interfaces.relationship_lifecycle.establish' relationship operations
{% endhighlight %}

1. Only start processing this node instance when the node instances it depends on are started.
2. Execute the task mapped to the node lifecycle operation. (do nothing if no task is defined).
3. Execute all tasks mapped to this node's relationship lifecycle operation.
4. A node is considered a host node if it's type is a subtype of `cloudify.types.host`
5. Wait for `cloudify.interfaces.host.get_state` operation on the node instance to return `true` (if mapped, do nothing otherwise)
6. Install the agent workers and the required plugins on this host

# Uninstall

{% highlight python %}
for each node
  for each node instance
    1) wait for dependent node instances to be deleted
    2) execute 'cloudify.interfaces.lifecycle.stop' operation
    3) if node instance is host node:
    4)   stop and uninstall agent workers
    5) execute 'cloudify.interfaces.relationship_lifecycle.unlink' relationship operations
    2) execute 'cloudify.interfaces.lifecycle.delete' operation
{% endhighlight %}

1. Only start processing this node instance when the node instances dependent on it are stopeed.
2. Execute all tasks mapped to this node's relationship lifecycle operation.
3. A node is considered a host node if it's type is a subtype of `cloudify.types.host`
4. Uninstall and stop the agent
5. Execute the task mapped to the node lifecycle operation. (do nothing if no task is defined).

# Under The Hood

When you execute the `install` and `uninstall` workflows, you are actually invoking the workflows defined in [`types.yaml`]({{page.types_yaml_link}}) (which is usually imported somewhere in your blueprint).

{% highlight yaml %}
# snippet from types.yaml
workflows:
    install: workflows.default.install
    uninstall: workflows.default.uninstall
{% endhighlight %}

`workflows.default.install` and `workflows.default.uninstall` implementations can be found at [`workflows/default.py`]({{page.default_workflows_source_link}}). It is also possible defining custom workflows but documentation for doing so is not yet available.
