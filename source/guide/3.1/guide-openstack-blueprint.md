---
layout: bt_wiki
title: OpenStack Blueprint Authoring Guide
category: Guides
publish: true
abstract: Openstack blueprint authoring tutorial
pageord: 300

openstack_deploy_link: quickstart-openstack.html

---
{%summary%} {{page.abstract}}{%endsummary%}

# Openstack Adjustments

In this section of the tutorial we will learn how to adjust the *nodecellar* application to run on OpenStack.
The main differences between the single host version and the Openstack version are:

* Create real virtual machines using the openstack plugin that uses the Openstack compute API (Nova)
* Create the application security group and floating IP that uses the Openstack network API (Neutron)

We will show what necessary `node_templates` should be added, all of which relate to openstack.
To learn more about how to configure each and every node, refer to [Openstack Plugin](plugin-openstack.html).

# Step by Step Walk-through

## Step 1: Creating the blueprint

Let's start by using the *nodecellar* blueprint we used in the [Blueprint Authoring Guide](guide-blueprint.html).

The first addition we are going to make to this blueprint is importing the openstack plugin YAML file. <br>
This file contains the openstack plugin and types definitions.

{%highlight yaml%}
imports:
  - http://www.getcloudify.org/spec/openstack-plugin/1.1/plugin.yaml
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

Now, we are not using an existing vm, but rather letting openstack provision vm's by demand, so instead, we will use these inputs:

{%highlight yaml%}
inputs:
  image:
    description: >
      Image to be used when launching agent VM's
  flavor:
    description: >
      Flavor of the agent VM's
  agent_user:
    description: >
      User for connecting to agent VM's
{%endhighlight%}


## Step 3: Adding security groups

A security group must be added to allow for specific inbound ports to be opened between the application tiers.
The security group node uses the Neutron API to create the security group and its rules.
We have two security groups: <br>
One to allow the nodecellar application to access mongod:

{%highlight yaml%}
mongod_security_group:
  type: cloudify.openstack.nodes.SecurityGroup
  properties:
    security_group:
      name: mongod_security_group
    rules:
      - remote_ip_prefix: 0.0.0.0/0
        port: { get_property: [mongod, port] }
      - remote_ip_prefix: 0.0.0.0/0
        port: 28017
{%endhighlight%}

And one to allow access to the nodecellar application:

{%highlight yaml%}
nodecellar_security_group:
  type: cloudify.openstack.nodes.SecurityGroup
  properties:
    security_group:
      name: nodecellar_security_group
    rules:
      - remote_ip_prefix: 0.0.0.0/0
        port: { get_property: [nodecellar, port] }
{%endhighlight%}

## Step 4: Adding the floating IP

A floating IP provides a constant public IP for the application. We add it using the floatingip type that uses the Neutron API.

{%highlight yaml%}
  nodecellar_floatingip:
    type: cloudify.openstack.nodes.FloatingIP
{%endhighlight%}

## Step 5: Adding the Virtual Machines

The `cloudify.openstack.nodes.Server` type uses the Nova API to spawn virtual machines over Openstack.
We will need two VM's, one for mongod and one for nodejs.

{%highlight yaml%}
mongod_vm:
  type: cloudify.openstack.nodes.Server
  properties:
    cloudify_agent:
      user: { get_input: agent_user }
    server:
      image: { get_input: image }
      flavor: { get_input: flavor }
  relationships:
    - target: mongod_security_group
      type: cloudify.openstack.server_connected_to_security_group

nodejs_vm:
  type: cloudify.openstack.nodes.Server
  properties:
    cloudify_agent:
      user: { get_input: agent_user }
    server:
      image: { get_input: image }
      flavor: { get_input: flavor }
  relationships:
    - target: nodecellar_security_group
      type: cloudify.openstack.server_connected_to_security_group
    - target: nodecellar_floatingip
      type: cloudify.openstack.server_connected_to_floating_ip

{%endhighlight%}

Some important points to note here:
- We are using the image ID here but you may want to use the image name in some cases. you can do this by using *image_name* as the key. In a similar manner flavor ID can be replaced with flavor name using *flavor_name*.
- We have used a built-in openstack `relationship` type, `server_connected_to_security_group`, to attach the previously defined security groups to the servers.
- In the *nodejs_host* we also used the `server_connected_to_floating_ip` `relationship` type to attach a floating ip to this VM.

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
      ip_address: { get_attribute: [nodecellar_floatingip, floating_ip_address ] }
      port: { get_property: [nodecellar, port] }
{%endhighlight%}

# Final Result

Lets take a look at our full blueprint:

{%highlight yaml%}
imports:
  - {{page.types_yaml_link}}

inputs:
  image:
    description: >
      Image to be used when launching agent VM's
  flavor:
    description: >
      Flavor of the agent VM's
  agent_user:
    description: >
      User for connecting to agent VM's

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

  mongod_vm:
    type: cloudify.openstack.nodes.Server
    properties:
      cloudify_agent:
        user: { get_input: agent_user }
      server:
        image: { get_input: image }
        flavor: { get_input: flavor }
    relationships:
      - target: mongod_security_group
        type: cloudify.openstack.server_connected_to_security_group

  nodejs_vm:
    type: cloudify.openstack.nodes.Server
    properties:
      cloudify_agent:
        user: { get_input: agent_user }
      server:
        image: { get_input: image }
        flavor: { get_input: flavor }
    relationships:
      - target: nodecellar_security_group
        type: cloudify.openstack.server_connected_to_security_group
      - target: nodecellar_floatingip
        type: cloudify.openstack.server_connected_to_floating_ip

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
    type: cloudify.openstack.nodes.FloatingIP

  mongod_security_group:
    type: cloudify.openstack.nodes.SecurityGroup
    properties:
      security_group:
        name: mongod_security_group
      rules:
        - remote_ip_prefix: 0.0.0.0/0
          port: { get_property: [mongod, port] }
        - remote_ip_prefix: 0.0.0.0/0
          port: 28017

  nodecellar_security_group:
    type: cloudify.openstack.nodes.SecurityGroup
    properties:
      security_group:
        name: nodecellar_security_group
      rules:
        - remote_ip_prefix: 0.0.0.0/0
          port: { get_property: [nodecellar, port] }

outputs:
  endpoint:
    description: Web application endpoint
    value:
      ip_address: { get_attribute: [nodecellar_floatingip, floating_ip_address] }
      port: { get_property: [nodecellar, port] }

{%endhighlight%}

That's it, this a fully functioning blueprint that can be used with a Cloudify Manager to install the nodecellar application on an Openstack Cloud.

# What's Next

Now that you have an Openstack blueprint ready, you can [deploy it]({{page.openstack_deploy_link}}).
