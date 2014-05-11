---
layout: bt_wiki
title: Type Reference
category: Cloudify Development
publish: false
abstract: "Reference for Cloudify built in types"
pageord: 600
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


# Software Types