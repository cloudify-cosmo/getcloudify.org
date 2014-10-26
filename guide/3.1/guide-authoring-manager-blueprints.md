---
layout: bt_wiki
title: Manager Blueprints Authoring Guide
category: Guides
publish: true
abstract: "A guide to authoring Manager Blueprints"
pageord: 600
---

{%summary%}This guide explains how to create custom [manager blueprints](reference-terminology.html#manager-blueprints) or edit existing ones{%endsummary%}


UNDER CONSTRUCTION


is this CLI doc or just API to how to write manager blueprints??




tasks.py - bootstraps, copies key, creates and uploads provider context. exports runtime props? basically just dont set others on the manager node after it runs..
the part where it pushes cloudify [bootstrap context] into provider context.
the part with default remote agent key path. also can do with no local key path.

bootstrap.py1: maybe explanation about local directory structure? meh
expects a manager_ip output, a cloudify_manager node type USED ONCE, a provider runtime property, manager user and manager key path




=========================
requirements.txt (at least fabric, common, rest client)
=========================
inputs.json.template
=========================


configure.py
=========================
PUBLIC_IP_RUNTIME_PROPERTY, PRIVATE_IP_RUNTIME_PROPERTY, PROVIDER_RUNTIME_PROPERTY


yaml file:
=========================
import of fabric


outputs - manager_ip

manager node: cloudify property, mandatory type, interface implementation

bootstrap task: takes cloudify_packages, agent_local_key_path, agent_remote_key_path

likely inputs: cloudify_packages, cloudify (bootstrap context)

tip about fabric plugin - how it retrieves ip of host.


a section about teardown.