---
layout: bt_wiki
title: Installing Blueprints Locally
category: Getting Started
publish: true
pageord: 100
---
{%summary%} Locally installing Blueprints via Local Workflows. {%endsummary%}

# Overview

While you might use Cloudify's Manager (discussed later on in the Getting Started section) when deploying applications regularly, you can deploy your applications on your local machine or on a designated VM by utilizing Cloudify's Local Workflows.

Local workflows allow you to execute Cloudify [Workflows](workflows-general.html) on your local environment.

It is important to note that executing workflows locally is not limited to installing a Blueprint on the machine you're on or even to installing a Blueprint in general. For instance, you can use a local workflow to execute workflows on existing environments. You can also use local workflows along with different Cloud plugins to provision environments directly from your CLI.

# Actionable: Nodecellar example

{%warning title=Use clean environments%}
Since this mechanism runs locally, it might pollute your environemnt. We recommend spinning up a VM running Cloudify's CLI and executing your workflow there.
{%endwarning%}

In particular, we'll be executing the [Install Workflow](workflows-built-in.html#the-install-workflow) locally now.

Now whether you previously cloned the Nodecellar Blueprint repo or written your own blueprint, you should now be inside the Blueprint's root folder. If you've written your own Blueprint, fill in the inputs yaml file and execute:

{%highlight bash%}
cfy local init --blueprint-path your-blueprint.yaml --inputs your-inputs-file.yaml
{%endhighlight%}

If you're using the cloned Blueprint, execute:

{%highlight bash%}
cfy local init --blueprint-path local-blueprint.yaml
{%endhighlight%}

All you have to do to deploy the blueprint is execute:

{%highlight bash%}
cfy local execute -w install
{%endhighlight%}

{%warning title=The Subfolder Conundrum%}
Part of the `local workflow` mechanism is to process the blueprint's directory and subdirectories. You need to run the following commands from the Blueprint's root directory.
{%endwarning%}

# What's Next

By the way, this same mechanism is used by Cloudify when [bootstrapping a Cloudify Manager](getting-started-bootstrapping.html) which is what you should do now. Oh wait, you might want [verify the prerequisites for bootstrapping a Cloudify Manager](getting-started-prerequisites.html) first.
