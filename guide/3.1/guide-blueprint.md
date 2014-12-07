---
layout: bt_wiki
title: Blueprint Authoring Guide
category: Guides
publish: true
abstract: Blueprint authoring tutorial
pageord: 100

yaml_link: http://www.getcloudify.org/spec/cloudify/3.1/types.yaml
plugin_guide_link: guide-plugin-creation.html
openstack_blueprint_link: guide-openstack-blueprint.html
getting_started_link: quickstart.html
terminology_link: reference-terminology.html

---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

In this tutorial we will create a [blueprint]({{page.terminology_link}}#blueprint) that will describe 
the [topology]({{page.terminology_link}}#topology) of the Nodecellar [application]({{page.terminology_link}}#application)). 
The Nodecellar application is a Node.js web application of a wine catalog.

The blueprint we will be writing is an exact replica of the blueprint we deployed when we [got started]({{page.getting_started_link}}).

It includes the following components:

**Infrastructure:**

- One host that will contain both MongoDB and NodeJS. 
In this tutorial we will use localhost as our host as we want to install the entire application on our Vagrant Cloudify Manager VM.


**Middleware:**

- [Node.JS](http://nodejs.org/) - This is a javascript based application server that serves this web application - It is contained within our host.

- [MongoDB](http://www.mongodb.org/) - This is a JSON document store that serves as the application database - It is contained within our host.

**Application:**

- Nodecellar - This is the application business logic packed as a Node.JS application. It is hosted within the Node.JS server. It requires a connection to the MongoDB Database.

The topology should look like this:

![nodecllar app](/guide/images3/guide/quickstart/nodecellar_singlehost_topology.png)

## Cloudify YAML DSL

Cloudify's Domain Specific Language (DSL) is written in YAML. If you are not familiar with yaml you may want to read the [yaml documentation](http://www.yaml.org/start.html) first.

# Step by Step Walkthrough

## Step 1: Creating the Blueprint

First lets create a folder with the name `nodecellar` and create a blueprint.yaml file within it. This file is the blueprint file.

## Step 2: Adding our Host


Lets add our host as the first node template. To do so we need a `type` as each node template is of a specific node type.
Types are like classes in an Object Oriented program. 
They represent a type of component in an application at any level: 
Infrastructure (hosts, networks etc), middleware (application servers, web servers, etc) 
or application (application modules, database schemas, etc).

Types can be imported from external files or declared inside the blueprint.yaml file.

In this case we will use a type from an external URL. 
Since we are not really going to spawn a VM, 
we will use the basic type of `cloudify.nodes.Compute`. 
This type can get an IP of an existing host (in our case it will be the manager IP) and install the Cloudify agent on it.  
We will use this functionality to simulate the hosts in our application and in order to demonstrate how Cloudify uses application agent plugins such as the script plugin.


In order to use this type we need to add the following yaml in our blueprint file:

{%highlight yaml%}
imports:
	 - {{page.yaml_link}}

{%endhighlight%}

This file contains the declaration of the type:

{%highlight yaml%}
node_types:
  cloudify.nodes.Compute:
        derived_from: cloudify.nodes.Root
        interfaces:
            cloudify.interfaces.worker_installer:
                install: 
                    implementation: agent_installer.worker_installer.tasks.install
                    inputs: {}
                start: 
                    implementation: agent_installer.worker_installer.tasks.start
                    inputs: {}
                stop: 
                    implementation: agent_installer.worker_installer.tasks.stop
                    inputs: {}
                uninstall: 
                    implementation: agent_installer.worker_installer.tasks.uninstall
                    inputs: {}
                restart: 
                    implementation: agent_installer.worker_installer.tasks.restart
                    inputs: {}
            cloudify.interfaces.plugin_installer:
                install: 
                    implementation: plugin_installer.plugin_installer.tasks.install
                    inputs: {}
            cloudify.interfaces.host:
                get_state
        properties:
            install_agent:
                default: true
            cloudify_agent: {}
            ip: ''


{%endhighlight%}


The type has interfaces with operations (hooks) that are implemented using plugin functions.
Plugins are python facades for API's and tools you would like to use (such as IaaS compute API or tools like Chef and Puppet).

In this case you see 2 plugins:
- agent_installer: a manager side plugin that is responsible for SSH-ing into the host and deploying the Cloudify agent.
- plugin_installer: an agent side plugin that installs the agent plugins used in this blueprint on the current agent.

in order to use the worker_installer, we will need a private key file on our manager host (this happens as part of the manager creation process).

The `cloudify.nodes.Compute` type also declares a configuration schema (properties that must have values). 
In this case it declares the install_agent with a default value of `true`, the cloudify_agent map with a default empty map and the ip propety with a default value of an empty string.

Now we can start describing the topology. 
The topology is a yaml object called node_templates. Its value is a yaml dictionary.

now let's add the hosting_vm node that uses the type:

{%highlight yaml%}
node_templates:
  hosting_vm:
    type: cloudify.nodes.Compute
    properties:
      ip: { get_input: host_ip }
      cloudify_agent:
        user: { get_input: agent_user }
        key: { get_input: agent_private_key_path }

{%endhighlight%}


The above yaml snippet specifies a yaml map with the following keys:
type - the type of component this node is an instance-of.
properties - the configuration of this instance.

Under properties you can see 2 key-value pairs:
ip - in this case it is localhost as we are installing the agent on the local host - that is, only simulating another host.
cloudify_agent - is a sub-map with the agent configuration. This is where we specify the private key path.

Notice the `{ get_input: ... }` statements. This means we want the user using this blueprint to specify these values.
For this work we have to add an `inputs` section to our blueprint like so:

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

We will get to how we pass these inputs later on in this tutorial.

## Step 3: Adding MongoDB

Now let’s add the middleware nodes of the application. 


The first node we will add is the `mongod` node that represents the Mongo database server. 
The type we will use here is `cloudify.nodes.DBMS`, which is provided by the default types. 

Now we can declare the mongod node:

{%highlight yaml%}
node_templates:
  hosting_vm:
    type: cloudify.nodes.Compute
    properties:
      ip: { get_input: host_ip }
      cloudify_agent:
        user: { get_input: agent_user }
        key: { get_input: agent_private_key_path }
  mongod:
    type: cloudify.nodes.DBMS
    properties:
      port: 27017
    interfaces:
      cloudify.interfaces.lifecycle:
        create: scripts/mongo/install-mongo.sh
        start: scripts/mongo/start-mongo.sh
        stop: scripts/mongo/stop-mongo.sh
        
{%endhighlight%}

What we see here that lifecycle operations are mapped to bash scripts, that are executed via the script plugin, which is built-in plugin. 

The scripts are uploaded with the blueprint under the sub folder scripts/mongo. 
The plugin has an API to fetch this file from the manager's fileserver and use it. 


## Step 5: Refining the Blueprint with a Custom Type


We have just declared a mongod node of type cloudify.bash.db_server. This type doesn’t enforce any properties except for scripts. In the case of a mongo database we probably need to make sure the user gives us configuration details such as the role in the mongo cluster and the port on which it listens. We will therefore subtype cloudify.bash.db_server and add schema property declarations:


{%highlight yaml%}


mongo_database:
        derived_from: cloudify.types.bash.db_server
        properties:
            -   role
            -   port

{%endhighlight%}

So now our mongod node will look like this:


{%highlight yaml%}

- name: mongod
      type: mongo_database
      properties:
            role: mongod
            port: 27017
            scripts:
                create: mongo-scripts/install-mongo.sh
                start: mongo-scripts/start-mongo.sh
                stop: mongo-scripts/stop-mongo.sh

{%endhighlight%}


Finally we need to add the mongod relationships. 
This node has only one relationship - it is contained in the hosting_vm node

{%highlight yaml%}
- name: mongod
      type: mongo_database
      properties:
            role: mongod
            port: 27017
            scripts:
                create: mongo-scripts/install-mongo.sh
                start: mongo-scripts/start-mongo.sh
                stop: mongo-scripts/stop-mongo.sh
      relationships:
        - target: mongod_vm
          type: cloudify.relationships.contained_in

{%endhighlight%}

## Step 6: Adding nodejs

<a href="https://github.com/cloudify-cosmo/cloudify-nodecellar-singlehost/compare/step5...step6" class="btn btn-default" role="button"><i class="fa fa-search"></i>  Code Diff</a>

Now we can declare the nodejs node:

{%highlight yaml%}
- name: nodejs
      type: cloudify.bash.app_server
      properties:
            scripts:
                create: nodejs-scripts/install-nodejs.sh
      relationships:
        - type: cloudify.relationships.contained_in
          target: nodejs_vm

{%endhighlight%}

This is similar to the mongod node. It uses a bash type (cloudify.bash.app_server).
It uses the same type of relationship (cloudify.relationships.contained_in
) but it’s located in the other vm node.

## Step 7: Refining the nodejs Type

<a href="https://github.com/cloudify-cosmo/cloudify-nodecellar-singlehost/compare/step6...step7" class="btn btn-default" role="button"><i class="fa fa-search"></i>  Code Diff</a>

We can refine this node as well by using a subtype in case we want specific properties in the future. The subtype will look like this:

{%highlight yaml%}
nodejs_server:
        derived_from: cloudify.types.bash.app_server
{%endhighlight%}

as a result the final version of the nodejs node is:

{%highlight yaml%}
- name: nodejs
      type: nodejs_server
      properties:
            scripts:
                create: nodejs-scripts/install-nodejs.sh
      relationships:
        - type: cloudify.relationships.contained_in
          target: nodejs_vm

{%endhighlight%}


Now let’s try and [deploy](quickstart.html) what we have created so far to get a feel of it.

## Step 8: Adding the nodejs Application Code

<a href="https://github.com/cloudify-cosmo/cloudify-nodecellar-singlehost/compare/step7...step8" class="btn btn-default" role="button"><i class="fa fa-search"></i>  Code Diff</a>

we can now add the application layer by adding the nodecellar_app node. it is of type nodejs_app (which again we need to decalre inline).

{%highlight yaml%}
nodejs_app:
    derived_from: cloudify.types.bash.app_module
    properties:
        -   app_name
        -   startup_script
        -   git_url
        -   git_branch
        -   base_port
        -   num_instances
        -   env_file_path
{%endhighlight%}

And now we can add the node in the nodes list

{%highlight yaml%}
 - name: nodecellar_app
      type: nodejs_app
      properties:
            app_name: nodecellar
            startup_script: server.js
            git_url: https://github.com/uric/nodecellar.git
            git_branch: master
            base_port: 8080
            num_instances: 1
            env_file_path: /tmp/mongo_host_and_port.sh
            scripts:
                create: nodejs-scripts/install-app.sh
                start: nodejs-scripts/start-app.sh
                stop: nodejs-scripts/stop-app.sh
      relationships:
        - type: cloudify.relationships.contained_in
          target: nodejs

{%endhighlight%}

Again note the bash scripts used to install the application. This node has a contained_in relationship to the nodejs node which means that it will be deployed inside the node.js server
Lets [deploy](quickstart.html) again and see the entire application stack but without the db connection yet.

## Step 9: Connecting the nodejs Application to MongoDB

<a href="https://github.com/cloudify-cosmo/cloudify-nodecellar-singlehost/compare/step8...step9" class="btn btn-default" role="button"><i class="fa fa-search"></i>  Code Diff</a>

We need to connect the node.js application to the mongo database to make it fully functional. To do so we need a plugin that will get the runtime details of the mongod node and will configure the nodecellar_app node. The plugin API gets both nodes details in the context of a relationship from the workflow engine, so it is easy to code such a plugin. In this case we are going to use a custom plugin called nodecellar_config_plugin.

This plugin is declared in the following manner:

{%highlight yaml%}
plugins:
    nodecellar_config_plugin:
        derived_from: cloudify.plugins.agent_plugin
        properties:
            folder: nodecellar-config-plugin

{%endhighlight%}

We need to add now a custom relationship that will inherit from the connected_to abstract relationship type and will use the plugin.

{%highlight yaml%}
relationships:
    nodecellar_connected_to_mongo:
        derived_from: cloudify.relationships.connected_to
        source_interfaces:
            cloudify.interfaces.relationship_lifecycle:
                postconfigure: 
                    implementation: nodecellar_config_plugin.tasks.get_mongo_host_and_port
                    inputs: {}

{%endhighlight%}


Now lets make use of this relationship in the nodecellar_app node.

{%highlight yaml%}
- name: nodecellar_app
      type: nodejs_app
      properties:
            app_name: nodecellar
            startup_script: server.js
            git_url: https://github.com/uric/nodecellar.git
            git_branch: master
            base_port: 8080
            num_instances: 1
            env_file_path: /tmp/mongo_host_and_port.sh
            scripts:
                create: nodejs-scripts/install-app.sh
                start: nodejs-scripts/start-app.sh
                stop: nodejs-scripts/stop-app.sh
      relationships:
        - type: cloudify.relationships.contained_in
          target: nodejs
        - type: nodecellar_connected_to_mongo
          target: mongod

{%endhighlight%}

# What's Next

* Now that you know how to write a basic blueprint, you can [write an Openstack blueprint]({{page.openstack_blueprint_link}}).
* Or.. you can read the [Write-a-Plugin guide]({{page.plugin_guide_link}}) to gain a better understanding of how plugins work (and write your first plugin if you like).
