---
layout: bt_wiki
title: User guide Cloudify 3.0
category: Getting Started
publish: false
abstract: Explains how to use Cloudify 3.0 for users in different levels
pageord: 100
--- 



# Introduction

This user guide is written to serve different users with different needs and skillsets
We have created sections designated to early begginers. Other sections address more advnaced users and moving forward all the way to very advanced users that need custom workflows.
Here are the sections with their audience and content description
* Early beginners - You need to master YAML and have scripts that install and start your components. This section will teach you how to write basic blueprints using Openstack VMs and Bash executer plugin to run your scripts
* Average users - You need to master YAML and be able to configure Chef or Puppet in the most basic level. In this section we will teach you how to create any blueprint with built in types and plugins and customize it your needs
* Advanced Users - You will need to master YAML and write python. In this section we will teach you how to add your own types to Cloudify and how to add your custom plugins as implementation logic for these types
* Advanced Developers - In this section you will learn how to master the Radial DSL and how to use it in order to write your own custom workflows

# Early Begginers

**Before you start**
Before you start creating and running your first Cloudify blueprints, we recommend that you read the Quick Startup Guide and try it

## Writing Cloudify Blueprints

Cloudify blueprints are YAML documents that describes the application components and the relationships between them. 
each component is a node under the nodes section of the blueprint. Each node is an instance of a Type. These types asre usually out of the box types but more advanced users can add types. The blueprint needs to be portable between Cloud APIs and between DevOps tools used to install the application. Therefore, the nodes in the blueprint will be instances of abstract types that don't have any implementation details associated with them. These types only declare the basic set of properties. Properties that make sense with any deployement.

Each node might also have relationships declared with other nodes. There are 2 types of abstract relationships:
* `contained_in` relationship meaning that the current node is hosted inside the specified node. This can be a middleware component that is hosted within a VM or application package deployed within the middleware component.
* `connected_to` relationship meaning that the current node is connected to the specified node. For example: an appliaction server might have a connection to the database server. The `connected_to` relationship will be implemented by a concrete relationship type with a plugin that has hooks to invoke in order to configure the source or the target nodes or both in order to enable the relationship.

### Cloudify built in portable types

Cloudify portable types will be the one you will use in the portable blueprints you will compose. They are quite easy to master. Here are the most important ones (for additional reference look at [types.yaml](https://github.com/CloudifySource/cosmo-manager/blob/develop/orchestrator/src/main/resources/cloudify/types/types.yaml)
* `Host` - this type represents a server either virtual or physical (if you are using non-virtualized environment). It defines a small set of properties:
`host_name` - the name of the host
`install_agent` - should a Cloudfiy agent be installed by Cloudify on this server so it can later used by other workflow steps to install and manage middleware and application components on this host
* `Network` - a virtual L2 network (virtual switch)
* `Subnet` - L3 IP range subnet. This component is contained within a virtual network
* `Router` - L3 router. Router can be connected to several subnets allowing inter-LAN connectivity. It can also have a gateway to an external network for internet access.
* `Port` - An IP allocated on a subnet
* `Volume` - A block storage volume to which virtual machines can be connected in order to provide persistant storage
* `middleware_server` - this type is the base type of all middleware level components
* `application_module` - this type is the base type of all application level components.
* `web_server` - dervied from `middleware_server`. Indicates this is a webserver
* `db_server` - dervied from `middleware_server`. Indicates this is a database
* `app_server` - dervied from `middleware_server`. Indicates this is an application server


#### The Lifecycle Interface

All of Cloudify portable type types declare the lifecycle interface.  This interface has the following operations:
* **create** - create or install the component (e.g. create a new VM)
* **start** - start the component (e.g. start the Apache webserver)
* **configure** - configure the started component (updates that can only be done once it is up and running)
* **stop** - shutdown the component (e.g. stop the Unicorn Ruby server)
* **delete** - remove / uninstall the component (e.g. delete the virtual network)
Cloudify concrete types implement this interface by using an implementation plugin.This is done by mapping the operations listed above to the plugin coreesponding methods. 


### Working with type implementations

Type implementations are pieces of YAML that holds the concrete properties for one node in the blueprint. This means that the type implementation is an instance of a concrete type (e.g. `openstack_host` that implements host using a Nova API plugin). The type implementation also decalres a reference to a specific node in the portable blueprint using the `node_reference` attribute.

### The Bash Executer Plugin

The bash executer plugin is a plugin that looks for bash scripts uploaded with the blueprint. These files can be mapped as arguments to different lifecycle operations.

### The Bash Middleware Type

The bash middleware type is a concrete type that uses the bash executer plugin to implement the lifecycel operations.
## Putting it all together
**example here**

## Beginners

In this section we will take a step forward and learn how to work with OpenStack built in types

### Working with Openstack built in types

Cloudify 3.0 includes support for OpenStack main types such as:
* Nova Server (VM)
* Neutron Network
* Neutron Subnet
* Neutron Router
* Neutron Security Group
* Neutron Floating IP
* Neutron Port

In this section we will teach you how to create type implementation for each one of this types. We will also show hot to express the dependencies between them in the portable blueprint and in the type implementation section. Let's get started
#### Working with Openstack Nova Server
The Openstack Nova Server is implemented by a type called `openstack_host`. This type uses the `openstack-provisioner` plugin to create, start, stop and delete VMs
It supports any configuration allowed with Nova server create API. 
