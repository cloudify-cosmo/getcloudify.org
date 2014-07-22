---
layout: bt_wiki
title: Workflows Reference
category: Reference
publish: true
abstract: "Cloudify workflows short description and details on install and uninstall default workflows"
pageord: 100

types_yaml_link: http://getcloudify.org/spec/cloudify/3.0/types.yaml
default_workflows_source_link: https://github.com/cloudify-cosmo/cloudify-manager/blob/3.0/workflows/workflows/default.py

---

{%summary%} Install and Uninstall Workflows {%endsummary%}

Cloudify comes with two built-in workflows: `install` and `uninstall`. These workflows are used to install and uninstall a deployment. What follows is a high level description of these workflows.

# Install

For each node, for each node instance (in parallel):

1. Wait for node instance relationships to be started. (Only start processing this node instance when the node instances it depends on are started).
2. Execute `cloudify.interfaces.lifecycle.create` operation. <sup>1</sup>
3. Execute `cloudify.interfaces.relationship_lifecycle.preconfigure` relationship operations.<sup>2</sup>
4. Execute `cloudify.interfaces.lifecycle.configure` operation.<sup>1</sup>
5. Execute `cloudify.interfaces.relationship_lifecycle.postconfigure` relationship operations.<sup>2</sup>
6. Execute `cloudify.interfaces.lifecycle.start` operation.<sup>1</sup>
7. If the node instance is a host node (its type is a subtype of `cloudify.types.host`):
    * Wait for host to be started. (Wait for `cloudify.interfaces.host.get_state` operation on the node instance to return `true`, if mapped, do nothing otherwise).
    * Install agent workers and required plugins on this host.
8. Execute `cloudify.interfaces.relationship_lifecycle.establish` relationship operations.<sup>2</sup>

<sub>
1. Execute the task mapped to the node's lifecycle operation. (do nothing if no task is defined).<br>
2. Execute all tasks mapped to this node's relationship lifecycle operation.
</sub>

# Uninstall

For each node, for each node instance (in parallel):

1. Wait for dependent node instances to be deleted. Only start processing this node instance when the node instances dependent on it are stopped).
2. If node instance is host node (its type is a subtype of `cloudify.types.host`):
    * Stop and uninstall agent workers.
3. Execute `cloudify.interfaces.lifecycle.stop` operation.<sup>1</sup>
4. Execute `cloudify.interfaces.relationship_lifecycle.unlink` relationship operations.<sup>2</sup>
5. Execute `cloudify.interfaces.lifecycle.delete` operation.<sup>1</sup>

<sub>
1. Execute the task mapped to the node's lifecycle operation. (do nothing if no task is defined).<br>
2. Execute all tasks mapped to this node's relationship lifecycle operation.
</sub>

# Under The Hood

When you execute the `install` and `uninstall` workflows, you are actually invoking the workflows defined in [`types.yaml`]({{page.types_yaml_link}}).

{% highlight yaml %}
# snippet from types.yaml
workflows:
    install: workflows.default.install
    uninstall: workflows.default.uninstall
{% endhighlight %}

The `workflows.default.install` and `workflows.default.uninstall` implementations can be found at [`workflows/default.py`]({{page.default_workflows_source_link}}).
