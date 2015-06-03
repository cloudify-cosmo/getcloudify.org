---
layout: bt_wiki
title: Deploying Locally
category: Getting Started
publish: true
pageord: 225
---
{%summary%} In this section we will talk about how to use local workflows which can ease on your blueprint development cycle {%endsummary%}

# Overview

When you write a blueprint you can first verify it works by installing it locally and spare the upload + deploy cycle until it is ready.

This mechanism is used by cloudify during the bootstrap mechanism to install the manager blueprint.

{%warning title=Use clean environments%}
This mechanism runs locally. So when you install the blueprint it will install it locally - which means it will pollute your environment.

We strongly recommend you keep your environment clean and use a virtual machine to install the blueprint locally.
{%endwarning%}

# Nodecellar example

So lets say you have a blueprint, for example we will use the (nodecellar local blueprint)[https://github.com/cloudify-cosmo/cloudify-nodecellar-example/blob/master/local-blueprint.yaml].

To install this blueprint without a manager, you need to do the following:

 - install the `cfy` command
 - create a new folder (make sure it is not a subdirectory of the folder with the blueprint)
 - run the commands below


{%warning title=The Subfolder Conundrum%}
Part of the `local workflow` mechanism is to process the blueprint's directory and subdirectories.

This process is similar to the one on the manager when you upload and deploy the blueprint.

If you execute the workflow from within that directory or a subdirectory of it, it will cause problems.
{%endwarning%}



{%highlight bash%}

# simulates upload + deploy to the blueprint
cfy local init --blueprint-path /path/to/nodecellar-clone/cloudify-nodecellar-example/local-blueprint.yaml

# execute install workflow. in this example we do not require an inputs file, but you can add one.
cfy local execute -w install [-i inputs.yaml]

{%endhighlight%}

