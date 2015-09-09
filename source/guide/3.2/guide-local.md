---
layout: bt_wiki
title: Working Locally
category: Guides
publish: true
abstract: Working with Cloudify in Local Mode
pageord: 400

---
{%summary%}{{page.abstract}}{%endsummary%}

{%note title=Disclaimer%}The functionality of working locally is subject to change in future versions.{%endnote%}

# Overview

Cloudify supports working in *Local Mode*. When working in Local Mode, you can:

* Validate and process blueprints
* Run executions

— without using a Cloudify Manager. This feature is especially useful for debugging and troubleshooting.

# How Does This Work?

Working in Local Mode is done by using the `local` keyword for the `cfy` executable. You can use the `cfy local -h` command to learn about
the available commands supported in Local Mode.

```
usage: cfy local [-h]
                 {execute,install-plugins,instances,init,create-requirements,outputs}
                 ...
```

Working in Local Mode involves:

1. Initializing a working directory for local executions.
2. Executing workflows (such as `install`, `uninstall` etc).
3. (Optionally) Deleting the Local Mode storage directory after use.

**NOTE**: In Local Mode, you can only work with one blueprint and one deployment off that blueprint, at any one time. In other words,
in Local Mode, Cloudify does not support storing multiple blueprints or creating multiple deployments off any blueprint; you always
work with exactly one deployment.

# Initializing a Local Mode Working Directory

Initializing a Local Mode working directory, involves — at the same step — "uploading" a blueprint along with parameters
for a deployment. This is because working in Local Mode is always performed against a single deployment of a single blueprint at any
one time.

To initialize a working directory, enter any directory and type:

```
cfy local init --install-plugins -p <blueprint_path> [-i <inputs_path>]
```

(For additional options, use `cfy local init -h`)

* The `-p` parameter is equivalent to the `-p` parameter of `cfy blueprints upload`, and denotes the path to the blueprint.
* The `-i` parameter is equivalent to the `-i` parameter of `cfy deployments create`, and denotes an input file for creating the single
deployment to work with. This parameter is optional if the blueprint in question contains no `input`s without defaults. 

The `cfy local init` command will create a directory inside your working directory, called `local-storage`. This directory contains
control information used by `cfy local` — basically, contains all information required for `cfy local` operations within your working
directory. As a consequence, the only thing that needs to be done to clean-up is to delete the `local-storage` directory.

Example:

```
cfy local init -p /tmp/my/blueprint.yaml -i /tmp/my/inputs.yaml
```

## Updating a Local Mode Working Directory

Once a working directory is initialized, control information regarding the blueprint, and its implicit deployment, is recorded in the working
directory. If the blueprint changes, or your deployment's inputs change, you need to update the working directory to reflect those changes. This is
*not* done automatically.

To update, repeat the very same command as for initializing a working directory.

# Executing Workflows

To execute a workflow, use the `cfy local execute` command:

```
cfy local execute -w <workflow> [-p <parameters>] ...
```

(For additional options, use `cfy local execute -h`)

This command is equivalent to the `cfy executions start` command: it executes a workflow against the deployment, optionally providing
parameters. The command returns when the execution finishes.

Example:

```
cfy local execute -w install
```

# Displaying Node Instances

You can view information about node instances by using the `cfy local instances` command:

```
cfy local instances [--node-id <node-id>]
```

This command returns a JSON document containing information about node instances in the current deployment. If 
`--node-id` is specified, then only node instances of the given node ID are returned. 

# Displaying Outputs

If the blueprints contains an `outputs` section, you can retrieve the outputs' value by using the following command:

```
cfy local outputs
```

This command is equivalent to the `cfy deployments outputs` command.

# Cleaning Up

All data pertaining to Local Mode is recorded in a subdirectory called `local-storage` underneath your working directory. To clean-up,
either delete your working directory, or alternatively, delete the `local-storage` directory underneath your working directory. 
