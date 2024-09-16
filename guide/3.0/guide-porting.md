---
layout: bt_wiki
title: Cloudify 3.0 Recipe Porting Guide
category: none
publish: true
abstract: Best practices for porting Cloudify 2.x recipes to Cloudify 3.0
pageord: 100

---
{%summary%} Best practices for porting recipes from Cloudify 2.x to Cloudify 3.0 blueprints{%endsummary%}

# Cloudify 3.0 Recipe Porting Guide

## Scope

Cloudify recipes define configuration and functionality that can be categorized roughly into provisioning, installation, orchestration, management, and visualization.  This guide, in concert with the capabilities of Cloudify 3.0, addresses provision, installation, a subset of 2.x orchestration, and a portion of management.

## Development Topics

Prior to digging into individual recipe functional categories, there are broad development environment topics to be discussed.

### Recipe DSL: Groovy to YAML

Cloudify adopts YAML (1.0) as its configuration language, replacing the groovy DSL of version 2.x.  Familiarity with basic YAML is required to understand and create blueprints for Cloudify 3.0.  Note that because YAML is a declarative (not procedural) language, actual code (formerly Groovy closures) is not allowed.  Executable code is referenced as Python plugins, either user defined or built in.  Getting a YAML plugin or equivalent for your development environment can help you see the structure easier, and catch formatting errors that a flat text editor doesn't.

### Recipe Implementation: Groovy to Python (and bash)

Cloudify 3.0 adopts Python 2.7 (and newer) as its implementation language, both internally and for Blueprint plugins.  While not always necessary, if you need to write custom behavior to wire or orchestrate your system, you will likely need Python knowledge.  This custom behavior includes custom commands or any recipe logic that relies on the ServiceContext object.  Getting an IDE plugin for Python is important for making sense of and efficiently authoring Cloudify 3 Blueprint logic.

### Blueprint concept: TOSCA

Cloudify 3.0 is an implementation of the OASIS Topology and Orchestration Specification for Cloud Applications (TOSCA).  TOSCA breaks a deployment architecture into a graph of nodes, where nodes represent any functional component (or even logical component) of the deployment architecture, such as VMs, routers, network, subnets, applications, etc.  Contrast that with the idiosyncratic approach of Cloudify 2.x, which required the DSL to be modified to extend to new component types (storage, networking, etc...).  TOSCA defines a type system that defines interfaces, behavior, and relationship between arbitrary components, implemented as YAML DSL.  When you define a Cloudify 3 Blueprint, you define a graph of "nodes" (for example a Linux VM node with web server node contained in it), and the nodes behavior.  It is good to have a basic understanding of TOSCA concepts prior to creating a blueprint.  Paragraph 3.1 is a concise [introduction.](http://docs.oasis-open.org/tosca/TOSCA/v1.0/os/TOSCA-v1.0-os.html#_Toc356403644)

### Porting Cloudify 2.x Recipes

The central concept of Cloudify 3 is the TOSCA compatible "Blueprint" expressed as YAML.  In Cloudify 2.x, the application and service recipe served the same purpose.  A Blueprint is a complete description of the system to be managed, the rough equivalent of the combination of an application recipe along with all related service recipes.  In Cloudify 3.0, there is no structural separation between overall orchestration (an "application") and the component parts ("the services").  Additionally, in Cloudify 2.x, infrastructure configurations (VMs, network, storage) were defined in the Cloud driver configuration and referred to symbolically.  In Cloudify 3.0, the equivalent of the "cloud driver" configuration is specified in individual blueprints.  

{%tip title=Key Concept%}
application recipe + service recipes + cloud driver config = blueprint
{%endtip%}

Like the Cloudify 2.x service recipe, the blueprint is organized in sections.  There are two major sections in a blueprint: type definitions and the blueprint section which wires the types together.  Many types are provided in Cloudify itself, especially foundational types (like "host"), but you'll typically want to define some types of your own.  Refer to the [blueprint guide](http://getcloudify.org/guide/3.0/guide-blueprint.html) as an introduction to blueprint structure.

Like the Cloudify 2.x service recipe, the blueprint is composed of a directory, possibly subdirectories, and supporting files (including the essential blueprint file, traditionally but not necessarily named "blueprint.yaml".  Unlike in Cloudify 2.x, the blueprint isn't simply zipped and transferred to the target VM.  Any blueprint files not explicitly referred to in the blueprint itself, are not transferred to the target node (even when the agent operates remotely).  To get and use resources in the blueprint directory strucuture at runtime, they must be explicitly downloaded.

The preferred way to port a Cloudify recipe is incrementally, testing as you go.  As such, the process can be described via phases and steps.

{%tip title=Tip}
Work and test incrementally
{%endtip%}

#### Phase 1 - Evaluate Target Recipe

In this phase, you assess the recipe you are targeting for porting, and identify what is necessary (and possible) to port.  Cloudify 3.0 has some limitations, and additional possibilities, compared to version 2.7.  

{: .table .table-bordered}
| 2.7                             | 3.0             |
|:--------------------------------|----------------:|
| VM lifecycle management         | yes             |
| Application lifecycle managment | yes             |
| Application metrics             | no (3.1)        |
| Custom commands                 | yes (workflows) |
| Scaling                         | no              |
| Visualization                   | no              |
| Windows target platform         | no              |

To summarize, you'll be focussing on the core deployment and management of your application.

#### Phase 2 - Prepare Environment

##### Step 1 - Install and Start Cloudify 3 Server

In this phase, you need to make sure you have a environment suitable for blueprint development.    The easiest way to get started is using the preconfigured Vagrant box with Cloudify 3.0 pre-installed.  Refer to steps 1 and 2 in the [Getting Started Guide](http://getcloudify.org/guide/3.0/quickstart.html) to get an environment up and running.  Your VM should be large enough to host at least a minimal representation of the stack you are standing up.  The Cloudify manager itself takes 2 GB.  You'll need something bigger.  To modify the Vagrant VM size, edit the Vagrantfile, uncomment and modify the "config.vm.provider" section to look something like this (for a 4GB VM):

```ruby
config.vm.provider "virtualbox" do |vb|
      # Use VBoxManage to customize the VM. For example to change memory:
     vb.customize ["modifyvm", :id, "--memory", "4096"]
end
```

In addition, modify the Vagrantfile by uncommenting the line that looks like this:

```ruby
# config.vm.network "private_network", ip: "192.168.33.10"
```

This IP will be accessible from your host web browser so you can view the UI.

After "upping" the VM, ssh to it and type "cfy help" to verify all is well.

Like Cloudify 2.x, Cloudify 3.0 has a local cloud concept, which is helpful getting started with blueprint development.  The Vagrant VM has the simple provider pre-installed and running.  If you use one of the other methods to install the CLI, create a directory (e.g. cloudify), and in that directory run "cfy init simple_provider", and then "cfy bootstrap".

{%tip title=Tip%}
Start with "simple provider"
{%endtip%}

##### Step 2 - Start from a Blueprint Template

Rather than starting from scratch, it's much easier to start from an existing blueprint template. You can use any of the sample blueprints, however these might be better used as reference examples rather than starting points.  Instead, get the "blueprint-template" project from github [here](https://github.com/Gigaspaces/cloudify3-blueprints). It also has some associated code, but more focussed on illustrating how blueprints are built.  

The blueprint template illustrates the definition of types, interfaces, workflows, plugins, and nodes for a local cloud (simple provider) targeted blueprint.  This rest of this guide will refer to it.

For a sanity check, make sure you can deploy the blueprint-template project to Cloudify. Start your browser and point it at `http://<vagrant box ip>/`.  You'll see the Cloudify UI.  Select the "blueprints" view and upload the template.

![blueprints view](/guide/images3/guide/porting-blueprint.png "The Cloudify 3 Blueprints view")

Once uploaded, create a deployment and then execute the "install" workflow.

![install workflow](/guide/images3/guide/porting-deploy-install.png "Launching the install workflow")

Rename the blueprint directory, and the name of the blueprint in the actual blueprint file (the name: attribute in the blueprint section of blueprint.yaml).

#### Phase 3 Port The Recipe

##### Step 1: Identify and configure VMs

This step is very simple since you are starting with a simple provider (local cloud).  Ultimately, the image, flavor, storage, and network configuration will need to be added to the blueprint, but not until later.  For now, identify basic VM types, perhaps even taking names from the 2.x cloud driver config, and create nodes in the blueprint.  In blueprint.yaml, a node is declared like so (in the "blueprint" section; ignore other sections for now):

{%highlight yaml%}
        -   name: server_vm
            type: cloudify.types.host
            properties:
                ip: 127.0.0.1
                cloudify_agent:
                    key: /home/vagrant/.ssh/cloudify_private_key
                    user: vagrant
{%endhighlight%}

Rename the existing nodes,and/or add new ones as required for your stack.  For now, we're just declaring concrete "hosts" rather than host "types".  When we get to the point of configurating actual cloud VMS, we'll need the info from the cloud driver config.  More on that later.  At this point, you should comment out the lines provided as examples in the "blueprint" section.  After taking this step, take time to deploy the new blueprint.

##### Step 2: Port the services

Now begins an iterative process of adding individual service functionality (to the limits of simple provider anyway).  If you view your service dependencies (the application recipe from 2.x), you should start the process from services at the root of the dependency graph.  In other words, if you have a database and an app server, start with the database and build upwards through the dependent services.  It is important to test incrementally as features are added to the blueprint so that problems are discovered early.

**Create A New Type for the Service**

In the "types" section of the blueprint, create a new type, extending one of the cloudify bash plugin types, such as: cloudify.types.bash.db_server and cloudify.types.bash.app_server.  Read the [bash plugin guide](http://getcloudify.org/guide/3.0/plugin-bash.html) for details.  By declaring your own subtype of the Cloudify types, you can add your own configuration properties.  These properties might include a URL to download binaries from, ports to open, etc...  The equivalent in Cloudify 2.x would be anything in the services properties file.  For a concrete example, from the [xap-singlenode](https://github.com/Gigaspaces/cloudify3-blueprints) blueprint, the "xap_type" type is the equivalent of the the ["xap_management" service](https://github.com/CloudifySource/cloudify-recipes/tree/master/services/xap9x/xap-management). 

<image showing xap_management properties mapping to xap_type>

Note that properties can be nested arbitrarily.  Once you have a the type defined.  Take the time to install the blueprint to verify your syntax is correct.  If you want default values for the type, you can add a ": value" after a property entry.  See the template for an example.

**Create A New Blueprint Node for the Service**

Thus far, you have only defined a type.  By itself this has no impact on the actual deployment, only entries in the "blueprint" section actually get rendered on the target cloud.  Like we created a node in the blueprint section for the VM, we need to create a node for the application, which runs on the VM.  The template shows this for both "server" and "client" nodes.  You can choose to override the default values for the properties you defined in the types area, if any. Note also that you can reuse the type definition, if applicable, for other nodes.  For example, the xap-singlenode blueprint uses the xap_type definition for both xap_mgmt and xap_container nodes, since they are configured in a similar [manner](https://github.com/Gigaspaces/cloudify3-blueprints/blob/master/xap-singlenode/blueprint.yaml).

*** Add The Node Relationship ***

If you try to deploy the blueprint in it's current state, it will fail.  It will fail because the new node requires a VM to run on.  This is accomplished by defining a relationship.  Cloudify 3 defines a three relationships: `depends_on, connected_to, and contained_in`.  `connected_to` and `contained_in` are derived from `depends_on`.  More on relationships [here](http://getcloudify.org/guide/3.0/reference-terminology.html#relationship).  In this case, the "contained_in" relationship causes the orchestrator to wait for the hosting VM to be started, as well as indicating that associated logic be run on that VM.  After adding the relationship, try installing the blueprint.  You should see the VM with the node inside on the Cloudify UI, which will look something like this with your names substituted.

![app in vm](/guide/images3/guide/porting-serverinvm.png "Blueprint with single server in VM")

##### Step 3: Compose Service Relationships

In Cloudify 2.x, the service context and related attributes API was frequently used by services to discover information about other services.  In Cloudify 3.0, these concepts are replaced by the properties configured in the blueprint (equivalent to "details"), and the dynamic "runtime_properties" that contain properties set at runtime (equivalent to the attributes API data).

The template blueprint has an example "client" service that retrieves data set at runtime by the "server" service already described.  In the server service, the `server_scripts/install.sh` script set the IP address as a member of `runtime_properties`.  The `install.sh` script call a utility function that uses the Cloudify REST API via `curl` to set the runtime properties for the server node.  Once set, the IP address is ready to be discovered by other blueprint components. 

In order to fetch the IP address from the runtime_properties, a plugin needs to be created to access the `CloudifyContext` object at runtime.  This is accomplished by defining a custom relationship type that gets activated as the orchestrator runs the install workflow.  In the template, the first step is defining the relationship type:

{%highlight yaml%}
relationships:
    client_relationship:
        derived_from: cloudify.relationships.connected_to
        source_interfaces:
            cloudify.interfaces.relationship_lifecycle:
                - postconfigure: config_plugin.tasks.relationship_get_ip
{%endhighlight%}

Note that the `derived_from` property is a `connected_to` relationship, since clearly this isn't a `contained_in` type of relationship.  This configuration also shows how behavior (i.e. code) is tied to the relationship type.  In this case, a plugin method is referred to called `relationship_get_ip`.  This is the custom python code used to get the IP from the "server" blueprint node.  However where did "config_plugin" get defined?  Look up above the `relationships` section in the blueprint to the `plugins` section.  There you will find that the symbol `config_plugin` is associated with a concrete filesystem path to the actual python code.

{%highlight yaml%}
    config_plugin:
        derived_from: cloudify.plugins.agent_plugin
        properties:
            folder: config-plugin
{%endhighlight%}

Now that the plugin and relationship are defined, the relationship can actually be used in the blueprint section to be used at runtime.

{%highlight yaml%}
    -   name: client_app
        type: client_type
        properties:
            dummy_prop: overridden
        relationships:
            -   target: client_vm
                type: cloudify.relationships.contained_in
            -   target: server
                type: client_relationship
{%endhighlight%}

After the relationship is set, the python code will be executed, passing the `CloudifyContext` object.  The context is used to grab the runtime_properties (as set previously via the REST API), and then writes the result in a file for later consumption by lifecycle scripts.

{%highlight groovy%}
@operation
def relationship_get_ip(ctx, **kwargs):
    ':type ctx: CloudifyContext'
    
    # Get ip address of related node.
    ip_address = ctx.related.runtime_properties['ip_address']

    env_file_path = ctx.properties.get("env_file_path", "/tmp/ip")

    with open(env_file_path, 'a+') as env_file:
        env_file.write("{}\n".format(ip_address))
{%endhighlight}

Note that this method of using a plugin and the file system for getting context info, is driven by the choice of the bash plugin.  The upcoming python plugin (3.1) will permit the context to be passed directly to the lifecycle scripts.  The process, in summary:

* Write a python plugin to grab the runtime_properties you need
* Define the plugin in the plugins section of the blueprint
* Define a relationship that refers to the plugin
* Set the relationship in the "relationships" section of the blueprint node definition
* Finally, have your lifecycle script grab the info the plugin wrote to the filesystem

##### Step 4: Port the Custom Commands

Custom commands in Cloudify 2.x are defined in the service recipe and map a symbolic name to a script (or other action) to be executed remotely.  Custom commands essentially define a runtime service interface.  Cloudify 3.0 extends and formalizes this idea via `workflows`.  A workflow in Cloudify 3 can perform complex operations across the entire blueprint.  For a full description of the scope of workflows, refer to the workflow [guide](http://getcloudify.org/guide/3.0/guide-workflows.html). In the template blueprint, a simple workflow definition is presented that is equivalent to a custom command.

A workflow is implemented via a python plugin, like any other logic in a blueprint.  In the template blueprint, the workflow plugin is defined in a completely separate plugin module, but this is not required.  The plugin definition in the blueprint is like any other plugin definition, however the implementation is significantly different, as it's goal is the construction of workflow that can be executed.  For the simple workflow in the template blueprint, which simply executes an arbitrary script, the implementation is trivial.

{%highligh python%}
@workflow
def simple_workflow(ctx, node_name, operation, **kwargs):
    graph = ctx.graph_mode()
    for node in ctx.nodes:
        if node_name in node.id:
            for instance in node.instances:
                graph.add_task(instance.execute_operation(operation,kwargs))
    return graph.execute()
{%endhighlight}

Note that the use of the "graph" workflow mode is unnecessary, as it is mainly used for assembling more complex workflows, or at least workflows that handle cancellation.  Since workflows operate globally, notice how the node_name (node in the `blueprint` sense) is passed in as an argument.  The workflow merely locates all instances of the supplied node name, and executes the named operation.

To provide a task execution target for the workflow, an interface is defined on the server node.  The interface is the closest analog for the Cloudify 2.7 custom command definition.  The interface defines the "commands" available for a particular node in the topology.  To provide high flexibility, the template blueprint workflow even takes the operation (i.e. interface method) as an argument.  A "real" workflow probaby wouldn't need this level of flexibility.  To recap the "custom command" to "workflow" process:

* if your existing command is implemented in groovy, you may need to rewrite it in bash or python, unless you prepare the node with java/groovy.  If you need/want to rewrite it in python, you'll probably want to simply implement it in a plugin operation.
* create a plugin operation that will implement the command logic, or call your script implementation.
* create an interface on the node in the blueprint that will map a command name to your plugin operation, and provide whatever configuration properties are needed.
* make sure the plugin is defined in the plugins section of the blueprint.  If you just add the new operation to a pre-existing plugin module, no change is needed.
* write a workflow plugin to call the node interface you've defined.
* create a workflow definition in the blueprint that will map a workflow name to a workflow plugin implementation.

