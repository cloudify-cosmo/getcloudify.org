---
layout: bt_wiki
title: Requirements
category: Tutorials
publish: true
abstract: What's required for Cloudify to run?
pageord: 20
---
{%summary%}{{page.abstract}}{%endsummary%}

Cloudify comes as a set of packages containing (almost) all requirements within them.

## The Components Package (Mandatory)
Contains all 3rd party components Cloudify uses.
This is the largest package and should rarely change from version to version.
You might want to host it in a local repository and only update it if something changes.

## Core Package (Mandatory)
Contains Cloudify's code.
This is what makes everything tick.

## UI Package (Optional)
Contains Cloudify's Web UI.
This is optional since Cloudify can be managed using the CLI.

## Agent Packages (At least one is mandatory)
Contains Cloudify's agent code and is OS distribution specific.
Cloudify supplies agent packages for both Linux (several distros) and Windows.
You must at least have an agent that corresponds with your Manager's distribution.

## Base Requirement
Cloudify does require that you have Python 2.7 and above to run.
