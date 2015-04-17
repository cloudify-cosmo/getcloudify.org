---
layout: bt_wiki
title: vCloud Blueprint Authoring Guide
category: Guides
publish: true
abstract: vCloud blueprint authoring tutorial
pageord: 300

vcloud_deploy_link: quickstart-vcloud.html

---
{%summary%} {{page.abstract}}{%endsummary%}


# vCloud Adjustments

In this section of the tutorial we will learn how to adjust the *nodecellar* application to run on vCloud.
We will show what necessary `node_templates` should be added, all of which relate to vCloud.
To learn more about how to configure each and every node, refer to [vCloud Plugin](plugin-vcloud.html).

# Step by Step Walk-through

## Step 1: Creating the blueprint

Let's start by using the *nodecellar* blueprint we used in the [Blueprint Authoring Guide](guide-blueprint.html).

The first addition we are going to make to this blueprint is importing the vCloud plugin YAML file. <br>
This file contains the vcloud plugin and types definitions.

{%highlight yaml%}
imports:
  - https://raw.githubusercontent.com/cloudify-cosmo/tosca-vcloud-plugin/master/plugin.yaml
{%endhighlight%}

## Step 2: Changing our inputs

If you recall, when we built the Single Host version of the blueprint in the [Blueprint Authoring Guide](guide-blueprint.html), we defined some `inputs`:

{%highlight yaml%}
inputs:
  host_ip:
    description: >
      The ip of the host the application will be deployed on
  agent_user:
    description: >
      User name used when SSH-ing into the started machine
  agent_private_key_path:
    description: >
      Path to a private key that resided on the management machine.
      SSH-ing into agent machines will be done with this key.
{%endhighlight%}

Now, we are not using an existing vm, but rather letting vCloud provision vm's by demand, so instead, we will use these inputs:

{%highlight yaml%}
inputs:
  vcloud_username:
      type: string

  vcloud_password:
      type: string

  vcloud_url:
      type: string

  vcloud_service:
      type: string

  vcloud_vcd:
      type: string

  catalog:
    type: string

  template:
    type: string

  agent_user:
    type: string
    default: ubuntu

  agent_public_key:
    type: string

  management_network_name:
    type: string

  floating_ip_gateway:
    type: string

  nodecellar_public_ip:
    type: string
{%endhighlight%}


## Step 3: Adding the floating IP

A floating IP provides a constant public IP for the application.

{%highlight yaml%}
  nodecellar_floatingip:
    type: cloudify.vcloud.nodes.FloatingIP
    properties:
        floatingip:
            edge_gateway: { get_input: floating_ip_gateway }
{%endhighlight%}

## Step 4: Adding management network ports

A port allows to specify VM's network interface parameters.

{%highlight yaml%}
  management_port:
    type: cloudify.vcloud.nodes.Port
    properties:
        port:
            network: { get_input: management_network_name }
            ip_allocation_mode: dhcp
            primary_interface: true
{%endhighlight%}

## Step 5: Adding the Virtual Machines

The `cloudify.vcloud.nodes.Server` type uses the vCloud REST API to spawn VApps over vCloud.
We will need two VM's, one for mongod and one for nodejs.

{%highlight yaml%}
  mongod_host:
    type: cloudify.vcloud.nodes.Server
    properties:
        cloudify_agent:
            user: { get_input: agent_user }
        server:
           catalog: { get_input: catalog }
           template: { get_input: template }
           guest_customization:
             public_keys:
               - key:  { get_input: agent_public_key }
                 user: { get_input: agent_user }
    relationships:
        - target: management_port
          type: cloudify.vcloud.server_connected_to_port

  nodejs_host:
    type: cloudify.vcloud.nodes.Server
    properties:
        cloudify_agent:
            user: { get_input: agent_user }
        server:
           catalog: { get_input: catalog }
           template: { get_input: template }
           guest_customization:
             public_keys:
               - key:  { get_input: agent_public_key }
                 user: { get_input: agent_user }
    relationships:
        - target: management_port
          type: cloudify.vcloud.server_connected_to_port
        - target: nodecellar_floatingip
          type: cloudify.vcloud.server_connected_to_floating_ip
{%endhighlight%}

## Step 6: Refining our outputs

If you recall, when we built the Single Host version of the blueprint in the [Blueprint Authoring Guide](guide-blueprint.html), we defined `outputs`:

{%highlight yaml%}
outputs:
  endpoint:
    description: Web application endpoint
    value:
      ip_address: { get_property: [host, ip] }
      port: { get_property: [nodecellar, port] }
{%endhighlight%}

Notice we extracted the host ip by using the `get_property` *intrinsic function*. This will have to be different now.
The purpose of this output was to expose the application url endpoint.
The relevant ip address in this case, is the address of the assigned floating ip (external ip),
to extract this information we use the `get_attribute` *intrinsic function*, which can access node *runtime properties*, the floating ip node exposes a runtime property
called *floating_ip_address*, so we can do:

{%highlight yaml%}
outputs:
  endpoint:
    description: Web application endpoint
    value:
      ip_address: { get_attribute: [ nodecellar_floatingip, public_ip ] }
      port: { get_property: [ nodecellar, port ] }
{%endhighlight%}

# Final Result

Lets take a look at our full blueprint:

{%highlight yaml%}
imports:
  - http://www.getcloudify.org/spec/cloudify/3.2/types.yaml
  - https://raw.githubusercontent.com/cloudify-cosmo/tosca-vcloud-plugin/master/plugin.yaml

inputs:
  vcloud_username:
      type: string

  vcloud_password:
      type: string

  vcloud_url:
      type: string

  vcloud_service:
      type: string

  vcloud_vcd:
      type: string

  catalog:
    type: string

  template:
    type: string

  agent_user:
    type: string
    default: ubuntu

  agent_public_key:
    type: string

  management_network_name:
    type: string

  floating_ip_gateway:
    type: string

  nodecellar_public_ip:
    type: string

node_types:

  nodecellar.nodes.MongoDatabase:
    derived_from: cloudify.nodes.DBMS
    properties:
      port:
        description: MongoDB port
        type: integer
    interfaces:
      cloudify.interfaces.lifecycle:
        create: scripts/mongo/install-mongo.sh
        start: scripts/mongo/start-mongo.sh
        stop: scripts/mongo/stop-mongo.sh

  nodecellar.nodes.NodeJSServer:
    derived_from: cloudify.nodes.ApplicationServer
    interfaces:
      cloudify.interfaces.lifecycle:
        create: scripts/nodejs/install-nodejs.sh

  nodecellar.nodes.NodecellarApplicationModule:
    derived_from: cloudify.nodes.ApplicationModule
    properties:
      port:
        description: Web application port
        type: integer
      application_url:
        description: >
          URL to an archive containing the application source.
          The archive must contain one top level directory.
        default: https://github.com/cloudify-cosmo/nodecellar/archive/master.tar.gz
      startup_script:
        description: >
          This script will be used to start the nodejs application.
          The path is relative to the top level single directory inside
          the archive
        type: string
        default: server.js
    interfaces:
      cloudify.interfaces.lifecycle:
        configure: scripts/nodecellar/install-nodecellar-app.sh
        start: scripts/nodecellar/start-nodecellar-app.sh
        stop: scripts/nodecellar/stop-nodecellar-app.sh

relationships:

  node_connected_to_mongo:
    derived_from: cloudify.relationships.connected_to
    target_interfaces:
      cloudify.interfaces.relationship_lifecycle:
        postconfigure: scripts/mongo/set-mongo-url.sh

  node_contained_in_nodejs:
    derived_from: cloudify.relationships.contained_in
    target_interfaces:
      cloudify.interfaces.relationship_lifecycle:
        preconfigure: scripts/nodejs/set-nodejs-root.sh

node_templates:

  management_port:
    type: cloudify.vcloud.nodes.Port
    properties:
        port:
            network: { get_input: management_network_name }
            ip_allocation_mode: dhcp
            primary_interface: true

  mongod_vm:
    type: cloudify.vcloud.nodes.Server
    properties:
      cloudify_agent:
        user: { get_input: agent_user }
      server:
        catalog: { get_input: catalog }
        template: { get_input: template }
        guest_customization:
          public_keys:
            - key:  { get_input: agent_public_key }
              user: { get_input: agent_user }
      management_network: { get_input: management_network_name }
    relationships:
      - target: management_port
        type: cloudify.vcloud.server_connected_to_port

  nodejs_vm:
    type: cloudify.vcloud.nodes.Server
    properties:
      cloudify_agent:
        user: { get_input: agent_user }
      server:
        catalog: { get_input: catalog }
        template: { get_input: template }
        guest_customization:
          public_keys:
            - key:  { get_input: agent_public_key }
              user: { get_input: agent_user }
      management_network: { get_input: management_network_name }
    relationships:
      - target: management_port
        type: cloudify.vcloud.server_connected_to_port
      - target: nodecellar_floatingip
        type: cloudify.vcloud.server_connected_to_floating_ip

  mongod:
    type: nodecellar.nodes.MongoDatabase
    properties:
      port: 27017
    relationships:
      - type: cloudify.relationships.contained_in
        target: mongod_vm

  nodejs:
    type: nodecellar.nodes.NodeJSServer
    relationships:
      - type: cloudify.relationships.contained_in
        target: nodejs_vm

  nodecellar:
    type: nodecellar.nodes.NodecellarApplicationModule
    properties:
      port: 8080
    relationships:
      - type: node_connected_to_mongo
        target: mongod
      - type: node_contained_in_nodejs
        target: nodejs

  nodecellar_floatingip:
    type: cloudify.vcloud.nodes.FloatingIP
    properties:
      floatingip:
        edge_gateway: { get_input: floating_ip_gateway }
        public_ip: { get_input: nodecellar_public_ip }

outputs:
  endpoint:
    description: Web application endpoint
    value:
      ip_address: { get_attribute: [ nodecellar_floatingip, public_ip ] }
      port: { get_property: [ nodecellar, port ] }

{%endhighlight%}

That's it, this a fully functioning blueprint that can be used with a Cloudify Manager to install the nodecellar application on vCloud.

# What's Next

Now that you have vCloud blueprint ready, you can [deploy it]({{page.vcloud_deploy_link}}).