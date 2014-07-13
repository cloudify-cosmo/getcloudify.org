---
layout: bt_wiki
title: Types Reference
category: Reference 
publish: true
abstract: "Reference for Cloudify built in types"
pageord: 100
--- 
{%summary%} {{page.abstract}}{%endsummary%}

# Abstract Types
The following types are basic types from which concrete types with specific plugin implementations are derived.

* `cloudify.types.base` - The base type for all built-in types. declares the `lifecycle interface`

* `cloudify.types.tier` - A marker for a future scale group

* `cloudify.types.host` - A compute resource either a virtual or a physical host


* `cloudify.types.container` - A logical partition in a host such as [linux container](http://en.wikipedia.org/wiki/LXC) or [docker](https://www.docker.io/)

* `cloudify.types.network` - A virtual network

* `clouydify.types.subnet` - A virtual segment of IP addresses in a network

* `cloudify.types.router` - A virtual layer 3 router

* `cloudify.types.port` - An entry in a virtual subnet. Can be used in some clouds to secure a static private IP

* `cloudify.types.virtual_ip` - A virtual IP implemented as [NAT](http://en.wikipedia.org/wiki/Network_address_translation) or in another manner

* `cloudify.types.security_group` - A cloud security group (VM network access rules) 

* `cloudify.types.load_balancer` - A virtualized Load Balancer 

* `cloudify.types.volume` - A persistent block storage volume

* `cloudify.types.object_container` - A BLOB storage segment

* `cloudify.types.middleware_server` - A base type for all middleware level types

* `cloudify.types.web_server` - A web server
	* properties:
		* `port` - the webserver port

* `cloudify.types.app_server` - An application server

* `cloudify.types.db_server` - a Database

* `cloudify.types.message_bus_server` - a message bus server

* `cloudify.types.app_module` - a base type for any application module or artifact



# Infrastructure Types
The following types implement infrastructure components such as hosts, networks, routers etc.

## OpenStack Types

* `cloudify.openstack.server` - a [Nova Server](http://docs.openstack.org/api/openstack-compute/2/content/compute_servers.html)
	* properties:
		- `server` - Mandatory - A dictionary with the instances configurations such as image, flavor, host_name
		- `management_network_name` - Mandatory - The name of the Cloudify Manager network, via which the agent communicates with the manager 
		- `nova_config`: Optional - A dictionary with nova endpoint and credentials. By default takes values from the provider configuration
		- `neutron_config`: Optional - Adictionary with neutron endpoint and credentials. By default takes values from the provider configuration
	* example:
	{% highlight yaml %}
	-   name: vm
			type: cloudify.openstack.server
			instances:
				deploy: 1
			properties:
				install_agent: true
				worker_config:
					user: ubuntu
					key: ~/.ssh/cloudify-agents-kp.pem
				management_network_name: cloudify-admin-network
			  
				server:
					name: bash-web-server
					image:      8672f4c6-e33d-46f5-b6d8-ebbeba12fa02 ### IMAGE_NAME
					flavor:     101 ### FLAVOR_NAME
					key_name:   cloudify-agents-kp ### KEY_NAME
					security_groups: ['cloudify-sg-agents', 'node_cellar_security_group']
	{% endhighlight %}
* `cloudify.openstack.subnet` - a [Neutron Subnet](http://docs.openstack.org/api/openstack-network/2.0/content/subnets.html)
	* properties:
		- `neutron_config`: Optional - Adictionary with neutron endpoint and credentials. By default takes values from the provider configuration
	* example:
	{% highlight yaml %}
	- name: neutron_subnet
	  type: cloudify.openstack.subnet
	  properties:
		subnet: 
		  cidr: 10.10.10.0/24
		  ip_version: 4
		  name: app_subnet
	{% endhighlight %}

* `cloudfiy.openstack.security_group` - a [Neutron Security Group](http://docs.openstack.org/training-guides/content/module002-ch004-security-in-neutron.html)
	* properties:
		- `neutron_config`: Optional - Adictionary with neutron endpoint and credentials. By default takes values from the provider configuration
		- `security_group`: Mandatory - A dictionary with the configuration of the security group object. The mandatory attribute in this map is `name`
		- rules: Optional - A list of security group rules. Each rule has the following attributes:
			- `direction` - Optional - Whether the rule is `ingress` (inbound) or `egress` (outbound). default is `ingress`
			- `remote_ip_prefix` CIDR to which this rule apply.
			- `port` - the port to which this rule apply
			- `protocol` - Optional. By default `tcp`. Specifies the protocol to which this rule applies

		- `disable_egress` - Optional. Boolean settings that defsaults to False. Setting to True blocks all outbound calls except for egress rules specified

	* example:
	{% highlight yaml %}
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

	{% endhighlight %}

* `cloudify.openstack.router` - a [Neutron Router](http://docs.openstack.org/api/openstack-network/2.0/content/router_ext.html)
	* properties:
		- `neutron_config`: Optional - Adictionary with neutron endpoint and credentials. By default takes values from the provider configuration
		- `external_gateway_info`: Optional - the external network from which routing requests flow
	* example:
	{% highlight yaml %}
	- name: app_router
	  type: cloudify.openstack.router
	  properties:
		external_gateway_info:
			enable_snat: True
			network_name: Ext_Net
	{% endhighlight %}

* `cloudify.openstack.port` - a [Neutron Port](http://docs.openstack.org/api/openstack-network/2.0/content/ports.html)
	* properties:
		- `neutron_config`: Optional - Adictionary with neutron endpoint and credentials. By default takes values from the provider configuration
	* example:
	{% highlight yaml %}
	- name: neutron_port1
	  type: cloudify.openstack.port
	  properties:
		port: 
		  name: neutron_app_port1
	{% endhighlight %}

* `cloudify.openstack.network` - a [Neutron Network](http://docs.openstack.org/api/openstack-network/2.0/content/networks.html)
	* properties:
		- `neutron_config`: Optional - Adictionary with neutron endpoint and credentials. By default takes values from the provider configuration
	* example:
	{% highlight yaml %}
	- name: neutron_network
	  type: cloudify.openstack.network
	  properties:
		network: 
		  name: app_network
	{% endhighlight %}

* `cloudify.openstack.floatingip` - a [Neutron Floating IP](http://docs.openstack.org/training-guides/content/module002-ch004-floating-ips.html)
	* properties:
		- `neutron_config`: Optional - Adictionary with neutron endpoint and credentials. By default takes values from the provider configuration
		- `floating_network_name`: Mandatory - name of the external network on which this floating ip is allocated
	* example:
	{% highlight yaml %}
	- name: floatingip
	  type: cloudify.openstack.floatingip    
	  properties:
		floatingip:
		  floating_network_name: Ext-Net
	{% endhighlight %}

## Openstack Relationship Types
* `cloudify.openstack.port_connected_to_security_group` - Materializes connection between a Port and a Security Group
	* Example:
	{% highlight yaml %}
	# TODO: add
	{% endhighlight %}

* `cloudify.openstack.subnet_connected_to_router` - Materializes connection between a Subnet and a Router
	* Example:
	{% highlight yaml %}
	# TODO: add
	{% endhighlight %}

* `cloudify.openstack.server_connected_to_floating_ip` - Materializes connection between a Nova Server and a Floating IP
	* Example:
	{% highlight yaml %}
	- name: nodejs_vm
      type: cloudify.openstack.server
      instances:
          deploy: 1
      relationships:
        - target: floatingip
          type: cloudify.openstack.server_connected_to_floating_ip
        
	{% endhighlight %}

* `cloudify.openstack.server_connected_to_port` - Materializes connection between a Nova Server and a Port
	* Example:
	{% highlight yaml %}
	- name: mongod_vm
      type: cloudify.openstack.server
      instances:
          deploy: 1
      relationships:
        - target: neutron_port1
          type: cloudify.relationships.connected_to
        
	{% endhighlight %}

* `cloudify.openstack.floating_ip_connected_to_port` - Materializes connection between a Floating IP and a Port



# Software Types

## Bash Types
The following are software types implemented using bash scripts for the different lifecycle hooks

* `cloudify.types.bash.web_server` , `cloudify.bash.app_server`, `cloudify.bash.db_server`, `cloudify.bash.message_bus_server`
	* Properties:
		- scripts - Mandatory - a dictionary of scripts for the different lifecycle operations

	* Example:
	{% highlight yaml %}
	- name: mongod
      type: cloudify.bash.db_server
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
        
	{% endhighlight %}

## Chef Types
The following are software types implemented using Chef cookbooks for the different lifecycle hooks

* `cloudify.types.bash.web_server`, `cloudify.types.bash.app_server`, `cloudify.types.bash.db_server`, `cloudify.types.bash.message_bus_server`
	* Properties:
		- chef_config - The chef configuration to use. There are 2 alternatives: Chef Solo and Chef client
			- `cookbooks` - Mandatory for Solo mode - The `cookbooks` property can be either URL or a path relative
                to the root of the cookbook (the "/" is the directory where the main blueprint YAML resides). `cookbooks`, in both cases should reference a `.tar.gz` file with `cookbooks` directory under which all the required cookbooks reside. This works as specified at [http://docs.opscode.com/config_rb_solo.html](http://docs.opscode.com/config_rb_solo.html)
            - `environments` (optional for Solo)
            - `data_bags` (optional for Solo)
            - `roles` (optional for Solo)
            - `chef_server_url`        (required for client)
            - `environment`            (required for client)
            - `validation_client_name` (required for client)
            - `validation_key`         (required for client)
            - `runlist` (optional for both Solo and client) - if not specified then `runlists` must be used
            - `runlists` (optional for both Solo and client). If not specified then `runlist` must be used. A map of runlist strings per lifecycel operation (create, start, configure, stop, delete) or per relationship operation (preconfigure, postconfigure, establish, unlink)
            - `attributes` are the attributes to pass to Chef. They are put in a JSON file. Chef is invoked with the file name as an argument.
            - `version` (required) - version of chef to use
    * Example:

    {% highlight yaml %}
    - name: chef_node_one
            type: cloudify.types.chef.db_server
            properties:
                chef_config:
                    version: 11.10.4-1
                    chef_server_url: https://chef.example.com:443
                    validation_client_name: chef-validator
                    validation_key: "-----BEGIN RSA PRIVATE KEY-----\n.......\n-----END RSA PRIVATE KEY-----\n"
                    node_name_prefix: chef-node-
                    node_name_suffix: .chef.example.com
                    environment: _default
                    attributes:
                        test_attr_1: test_val_1
                        create_file:
                            file_name: /tmp/blueprint.txt
                            file_contents: Great success!
                    runlists:
                        create: recipe[create-file]
            relationships:
                - type: cloudify.relationships.contained_in
                    target: server
    {% endhighlight %}


## Chef Relationships
* `cloudify.chef.depends_on`, `cloudify.chef.connected_to` , `cloudify.chef.contained_in`
	* Properties: They take their runlist form the source node properties
	* Example:
	{% highlight yaml %}
    - name: chef_node_one
            type: cloudify.types.chef.db_server
            properties:
                chef_config:
                    version: 11.10.4-1
                    cookbooks: cookbooks.tar.gz
                    environment: _default
                    attributes:
                        test_attr_1: test_val_1
                        create_file:
                            file_name: /tmp/blueprint.txt
                            file_contents: 'Great success number #2 !'
                    runlists:
                        create: recipe[create-file]
            relationships:
                - type: cloudify.relationships.contained_in
                    target: server
        - name: chef_node_two
            type: cloudify.types.chef.app_server
            properties:
                chef_config:
                    version: 11.10.4-1
                    cookbooks: cookbooks.tar.gz
                    environment: _default
                    attributes:
                        other_file_name: {related_chef_attribute: create_file.file_name}
                        test_attr_2: test_val_2
                        create_file:
                            file_name: /tmp/blueprint2.txt
                            file_contents: {related_chef_attribute: create_file.file_name}
                    runlists:
                        establish: recipe[create-file]
            relationships:
                - type: cloudify.chef.connected_to
                    target: chef_node_one
                - type: cloudify.relationships.contained_in
                    target: server
    {% endhighlight %}






