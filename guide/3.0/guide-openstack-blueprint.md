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

#Adjusting the Nodecellar Blueprint to run on Openstack

In this section of the tutorial we will learn how to adjust the nodecellar application to run on OpenStack.
The main differences between the mock version and the Openstack version are:

* Create real virtual machines using the nova_plugin that uses the Openstack compute API (Nova)
* Create the application security group and floating IP that uses the Openstack network API (Neutron)

#Step 1: Creating the blueprint
Let's start by using the nodecellar blueprint we used in the [blueprint tutorial](guide-blueprint.html)

{%highlight yaml%}
git clone https://github.com/cloudify-cosmo/cloudify-nodecellar-singlehost.git
{%endhighlight%}

You can see the blueprint with the nodes from the nodecellar_local example.
The first additionwe are going to make to this template is importing the openstack plugins and types

{%highlight yaml%}
imports:
    - http://www.getcloudify.org/spec/3.0/cloudify/openstack.yaml
{%endhighlight%}


#Step 2: Adding a security group
Nowe can start adding the nodes we need.
A security group must be added to allow for specific inbound ports to be opened between the application tiers
The security group node uses the neutron_plugin to create the security group and its rules

{%highlight yaml%}
- name: node_cellar_security_group
      type: cloudify.openstack.security_group
      properties:
        security_group:
          name: node_cellar_security_group
        rules:
          - remote_ip_prefix: 0.0.0.0/0
            port: 8080
          - remote_ip_prefix: 0.0.0.0/0
            port: 27017
          - remote_ip_prefix: 0.0.0.0/0
            port: 28017
{%endhighlight%}

Rules can accept the following properties:
- disable_egress: by default set to false. Set to true if you want only specific egress traffic to be allowed
- direction: by default is ingress. You can use egress in case you disabled the default all open egress communication
- port_range_max: The max bound of the port range to open
- port_range_min: The min bound of the port range to open
- protocol: by default set to tcp. You can use udp as well
- remote_group_id: sets another security group as the source of allowed communication
- remote_ip_prefix: sets the range of IPs (using CIDR notation) to allow as communication source




#Step 3: Adding the floating IP
A floating IP provides a constant public IP for the application. we add it using the floatingip type that uses the neutron_plugin

{%highlight yaml%}
- name: floatingip
      type: cloudify.openstack.floatingip
      properties:
        floatingip:
          floating_network_name: Ext-Net
{%endhighlight%}

The floating IP declares an external network (in Openstack a network that is connected to the internet) as a property

#Step 4: Adding the Virtual Machines

The cloudify.openstack.server type is using the nova_plugin to spawn virtual machines over Openstack.

Adding an instance of this type requires knowledge of the nova API and the allowed arguments.

{%highlight yaml%}
name: mongod_vm
      type: cloudify.openstack.server
      instances:
          deploy: 1
	    properties:
        -   server:

            ### if defined, will serve as the hostname for the started instance,
            ### otherwise, the node_id will be used
                #name: no_name
                image:      8672f4c6-e33d-46f5-b6d8-ebbeba12fa02 #The image ID.
                flavor:     101 #The flavor ID.
                key_name:   cloudify-agents-kp
                security_groups: ['node_cellar_security_group']
{%endhighlight%}

some important points to note here:
- We are using the image ID here but you may want to use the image name in some cases. ou can do this by using image_name
- In similar manner flavor ID can be replaced with flavor name using flavor_name

Note the `instances` property that has the `deploy` sub property. This is how we tell the orchestrator how many instances to initially deploy.

The node.js virtual machine will look the same:
{%highlight yaml%}
name: nodejs_vm
      type: cloudify.openstack.server
      instances:
          deploy: 1
      properties:
        -   server:

            ### if defined, will serve as the hostname for the started instance,
            ### otherwise, the node_id will be used
                #name: no_name
                image:      8672f4c6-e33d-46f5-b6d8-ebbeba12fa02 #The image ID.
                flavor:     101 #The flavor ID.
                key_name:   cloudify-agents-kp
                security_groups: ['node_cellar_security_group']
{%endhighlight%}


#Step 5: adding a relationsip between the VM and the security groups

and we need to add a relationship of depwnds_on between the virtual machines and the security group. That is because the security group must be there when we request to spawn the VMs


{%highlight yaml%}
name: mongod_vm
      type: cloudify.opentstack.server
      instances:
          deploy: 1
      ...
      relationships:
        - target: node_cellar_security_group
          type: cloudify.relationships.depends_on

{%endhighlight%}


# What's Next

Now that you have an Openstack blueprint ready, you can [deploy it]({{page.openstack_deploy_link}}).
