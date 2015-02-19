---
layout: bt_wiki
title: Migrating from Cloudify 3.1
category: Guides
publish: true
abstract: A guide for users upgrading from Cloudify 3.1 to Cloudify 3.2
pageord: 100

---
{%summary%}{{page.abstract}}{%endsummary%}

# What's changed

This release of Cloudify includes a number of major changes. For a full list, see the [Change Log]{{link here}}.
For those upgrading from 3.1, the following items are most relevant. 

# Backwards incompatible changes

* The workflow's Graph framework will now raise an `api.ExecutionCancelled` error on execution cancellation, instead of returning the now-deprecated `api.EXECUTION_CANCELLED_RESULT`. This means that any workflow that used to perform additional operations after the `graph.execute()` call should now use a *try-finally* clause to handle the possible scenario of a cancelled execution.

* The Openstack plugin's `WindowsServer` type will now use the Openstack `get-password` feature by default - meaning it requires either using an image which posts the server's password to Openstack's metadata service, or disabling this behavior by setting the `use_password` property to `false`. See more information in the [Openstack plugin documentation](plugin-openstack.html#cloudifyopenstacknodeswindowsserver)


# Something that was deprecated

* The Openstack plugin's router type supports a sugaring for passing an external network name via the `router` property (via the nested `external_gateway_info`.`network_name` key) that is now deprecated. Use the new `external_network` property of the `cloudify.openstack.Nodes.Router` type to connect a network as the gateway for a router by either the network's ID or name instead. See more information in the [Openstack plugin documentation](plugin-openstack.html).

* The `api.EXECUTION_CANCELLED_RESULT` constant is now deprecated. This constant has been in use to support graceful cancellation of workflow executions, and required workflows to return it if they had been cancelled. Instead, workflow authors should now raise an `api.ExecutionCancelled` error once execution cleanup is complete, to signal that the execution has been cancelled successfully. Note that workflows which use the Graph framework don't need to mind this as the framework will raise the relevant error (however if the error is caught by the specific workflow then it should be reraised, possibly after additional cleanups). See more information in the [Workflows authoring guide](guide-authoring-workflows.html).

* The `cloudify.interfaces.host` interface exposed by the `cloudify.nodes.Compute` type is deprecated. This means that the interface's `get_state` operation which was used for node instances of type `cloudify.nodes.Compute` start detection by polling will be removed. An alternative for using `get_state` is described in the [Asynchronous Operations](guide-plugin-creation.html#asynchronous-operations) section of the plugin authoring guide.

* Cloudify operation context `ctx.operation` API has changed and instead of returning the current operation's name it returns an object with more information about the operation. The operation's name should be retrieved by referencing the `name` property of the operation's context object as follows: `ctx.operation.name`.
