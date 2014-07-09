---
layout: bt_wiki
title: Cloudify Blueprint Guide
category: Tutorials
publish: false
abstract: Blueprint authoring tutorial
pageord: 200
--- 
{%summary%} {{page.abstract}}{%endsummary%}

#Overview
In this tutorial we will create a blueprint that will describe the topology of the Nodecellar application. The Nodecellar application is a Node.js web application of wine catalog
It includes the following components:


**Infrastructure:**

- Two hosts (we will call them nodejs_host and mongodb_host) that contain the application. One contains the Node.JS and the other the MongoDB. In this tutorial we will use mock hosts (we make Cloudify report 2 hosts that are not really out there) as we want to install the entire application on our Vagrant VM


**Middleware:**

- [Node.JS](http://nodejs.org/) - This is a javascript based application server that serves this web application - It is contained within the nodejs_host 

- [MongoDB](http://www.mongodb.org/) - This is a JSON document store that serves as the application database - It is contained within the mongodb_host

**Application:** 

- Nodecellar - This is the application business logic packed as Node.JS application. It is hosted within the Node.JS server. It needs a connection to the MongoDB Database

The topology would look like this:

##Cloudify YAML DSL

Cloudify Domain Specific Language (DSL) is written in YAML. If you are not familiar with yaml you may want to read the [yaml documentation](http://www.yaml.org/start.html) first

#Step 1: Creating the blueprint

First lets create a folder with the name of nodecellar and create a blueprint.yaml file within it. This file is the blueprint file

Now lets declare the name of this blueprint
{%highlight yaml%}
blueprint:
    name: nodecellar
{%endhighlight%}


Now we can start the topology. The topology is a yaml object called nodes. Its value is a yaml list.
{%highlight yaml%}
blueprint:
    name: nodecellar
    nodes:
{%endhighlight%}

#Step 2: Creating a host for the Node.JS

Lets add the nodejs_host as the first node in the list of nodes. To do so we need first a type as each node is an instance of a type.
Types are like classes in an OO program. They represent a type of component in an application at any level: Infrastructure (hosts, networks etc), middleware (application servers, web servers etc) or application (application modules, database schemas etc.).

Types can be imported from external files or declared inside the blueprint.yaml file. 
In this case let’s create an inline type named vm_host. It is a mock host since we are not really going to spawn a VM. it only serves as a placeholder in the topology for real VM nodes that we can put in later when we take this application to a different environment.

{%highlight yaml%}
types:
    vm_host:
        derived_from: cloudify.types.host
        interfaces:
            cloudify.interfaces.lifecycle:
                - start: mock_host.tasks.start
                - stop: mock_host.tasks.stop
                - delete: mock_host.tasks.delete
            cloudify.interfaces.host:
                - get_state: mock_host.tasks.get_state


{%endhighlight%}

The vm_host type is dervied from the cloudify.types.host basic type. Therefore, we need to import the library of basic types:

[importing cloudify types snippet here]

The type has interfaces with operations (hooks) that are implemented using plugins functions. Plugins are python facades for APIs and tools you would like to use (such as IaaS compute API or tools like Chef and Puppet).



Since we are using a plugin, we need to decalre it as well:

In this case we are using the mock_host plugin. Plugins can be downloaded from URLs or from a subfolder in the blueprint archive. In both cases they need to be declared. Let’s add the plugin declaration

{%highlight yaml%}
plugins:
    mock_host:
        derived_from: cloudify.plugins.manager_plugin
        properties:
            folder: mock-plugin

{%endhighlight%}

The type also declares configuration schema (properties that must have values). In this case it assigns a value for a mandatory property install_agent that it inherited from cloudify.types.host

{%highlight yaml%}
types:
    vm_host:
        derived_from: cloudify.types.host
        interfaces:
            cloudify.interfaces.lifecycle:
                - start: mock_host.tasks.start
                - stop: mock_host.tasks.stop
                - delete: mock_host.tasks.delete
            cloudify.interfaces.host:
                - get_state: mock_host.tasks.get_state

        properties:
            -   install_agent: false

{%endhighlight%}

now let's add the nodejs_vm node that uses the type:
{%highlight yaml%}
	-   name: nodejs_vm
	    type: vm_host

{%endhighlight%}



The above yaml snippet specifies an anonymous yaml map with the following keys:
name - the name of the node (in this case nodejs_host)
type - the type of component this node is instance-of. 


#Step 3: Adding a host for the Mongo DB
In similar manner we add should now add the mongod_vm node (it is a simple copy and paste with a different name and hostname)

{%highlight yaml%}
	-   name: mongod_vm
	    type: vm_host

{%endhighlight%}

#Step 4: Creating Mongo Database

Now let’s add the middleware nodes of the application. In this blueprint we are using the bash types, that uses the bash plugin to install and start the nodes.

The first node we will add is the mongod node that represents the Mongo database server. The type we will use here is cloudify.bash.db_server. This type is imported from the bash plugin types and use the bash plugin to execute scripts listed in the node configuration (under mandatory property scripts).

The reason why we have specific types for db_server, app_server etc. is that we want the user to be able to differentiate between nodes based on their role in the application. We therefore using marking types.

We need to import the bash types and plugins to use this type

[Import bash types and plugins here]


Now we can declare the mongod node:

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

What we see here is the scripts property which is a map of scripts mapped to lifecycle events. In this case we see the create event mapped to mongo-scripts/install-mongo.sh

a script uploaded with the blueprint under the subfolder of mongo-scripts. The plugin has API to fetch this file from Cloudify manager fileserver and use it. The bash plugin knows which lifecycle event was assigned to the agent by the workflow engine and search the scripts dictionary for the right script name and path.



#Step 5: Refining the blueprint using mongo custom type

We have just declared a mongod node of type cloudify.bash.db_server. This type doesn’t enforce any properties except for scripts. In the case of mongo database we probably need to make sure the user give us configuration details such the role in the mongo cluster and the port to which it listens. We will therefore subtype cloudify.bash.db_server and add schema properties declarations

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
      






Finally we need to add the mongod relationships. This node has only one relationship - it is contained in the mongod_host node (In reality it is not in this deployment as the host is a mock)

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

#Step 6: Creating the Node.JS Server

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

We can refine this node as well by using a subtype in case we want specific properties in the future. The subtype will look like this:

{%highlight yaml%}
nodejs_server:
        derived_from: cloudify.types.bash.app_server
as a result the final version of the nodejs node is:
- name: nodejs
      type: nodejs_server
      properties:
            scripts:           
                create: nodejs-scripts/install-nodejs.sh
      relationships:
        - type: cloudify.relationships.contained_in
          target: nodejs_vm

{%endhighlight%}


 




Now let’s try and deploy what we have created so far to get a fill of it


#Step 7: Adding the application layer
we can now add the application layer by adding the nodecellar_app node. it is of type nodejs_app

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

Again note the bash scripts used to install the application.  This node has a contained_in relationship to the nodejs node which means that it will be deployed inside the node.js server
Lets deploy again and see the entire application stack but without the db connection yet

#Step 8: Adding the Node.JS application to DB Connection

We need to connect the node.js application to the mongo database to make it fully functional. To do so we need a plugin that will get the runtime details of the mongod node and will configure the nodecellar_app node. The plugin API gets both nodes details in the context of a relationship from the workflow engine, so it is easy to code such a plugin. In this case we are going to use a custom plugin called nodecellar_config_plugin.

This plugin is declared in the following manner:

{%highlight yaml%}
plugins:
    nodecellar_config_plugin:
        derived_from: cloudify.plugins.agent_plugin
        properties:
            folder: nodecellar-config-plugin

{%endhighlight%}

We need to add now a custom relationship that will inherit from connected_to abstract relationship type and will use the plugin.

{%highlight yaml%}
relationships:
    nodecellar_connected_to_mongo:
        derived_from: cloudify.relationships.connected_to
        source_interfaces:
            cloudify.interfaces.relationship_lifecycle:
                - postconfigure: nodecellar_config_plugin.tasks.get_mongo_host_and_port

{%endhighlight%}


Now lets a use of this relationship to the nodecellar_app node. 

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


Read the plugins tutorial to gain a better understanding of plugin code

Now let’s deploy the full application



















