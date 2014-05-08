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
		- server - Mandatory - A dictionary with the instances configurations such as image, flavor, host_name
        - management_network_name - Mandatory - The name of the Cloudify Manager network, via which the agent communicates with the manager 
        - nova_config: Optional - A dictionary with nova endpoint and credentials. By default takes values from the provider configuration
        - neutron_config: Optional - Adictionary with neutron endopoint and credentials. By default takes values from the provider configuration
    * example:
    {% highlight yaml %}
    # enter snippet here
    {% endhighlight %}
* `cloudify.openstack.subnet` - a [Neutron Subnet](http://docs.openstack.org/api/openstack-network/2.0/content/subnets.html)
	* properties:
		- server - Mandatory - A dictionary with the instances configurations such as image, flavor, host_name
        - management_network_name - Mandatory - The name of the Cloudify Manager network, via which the agent communicates with the manager 
        - nova_config: Optional - A dictionary with nova endpoint and credentials. By default takes values from the provider configuration
        - neutron_config: Optional - Adictionary with neutron endopoint and credentials. By default takes values from the provider configuration
    * example:
    {% highlight yaml %}
    # enter snippet here
    {% endhighlight %}

* `cloudfiy.openstack.security_group` - a [Neutron Security Group](http://docs.openstack.org/training-guides/content/module002-ch004-security-in-neutron.html)
	* properties:
		- server - Mandatory - A dictionary with the instances configurations such as image, flavor, host_name
        - management_network_name - Mandatory - The name of the Cloudify Manager network, via which the agent communicates with the manager 
        - nova_config: Optional - A dictionary with nova endpoint and credentials. By default takes values from the provider configuration
        - neutron_config: Optional - Adictionary with neutron endopoint and credentials. By default takes values from the provider configuration
    * example:
    {% highlight yaml %}
    # enter snippet here
    {% endhighlight %}

* `cloudify.openstack.router` - a [Neutron Router](http://docs.openstack.org/api/openstack-network/2.0/content/router_ext.html)
	* properties:
		- server - Mandatory - A dictionary with the instances configurations such as image, flavor, host_name
        - management_network_name - Mandatory - The name of the Cloudify Manager network, via which the agent communicates with the manager 
        - nova_config: Optional - A dictionary with nova endpoint and credentials. By default takes values from the provider configuration
        - neutron_config: Optional - Adictionary with neutron endopoint and credentials. By default takes values from the provider configuration
    * example:
    {% highlight yaml %}
    # enter snippet here
    {% endhighlight %}

* `cloudify.openstack.port` - a [Neutron Port](http://docs.openstack.org/api/openstack-network/2.0/content/ports.html)
	* properties:
		- server - Mandatory - A dictionary with the instances configurations such as image, flavor, host_name
        - management_network_name - Mandatory - The name of the Cloudify Manager network, via which the agent communicates with the manager 
        - nova_config: Optional - A dictionary with nova endpoint and credentials. By default takes values from the provider configuration
        - neutron_config: Optional - Adictionary with neutron endopoint and credentials. By default takes values from the provider configuration
    * example:
    {% highlight yaml %}
    # enter snippet here
    {% endhighlight %}

* `cloudify.openstack.network` - a [Neutron Network](http://docs.openstack.org/api/openstack-network/2.0/content/networks.html)
	* properties:
		- server - Mandatory - A dictionary with the instances configurations such as image, flavor, host_name
        - management_network_name - Mandatory - The name of the Cloudify Manager network, via which the agent communicates with the manager 
        - nova_config: Optional - A dictionary with nova endpoint and credentials. By default takes values from the provider configuration
        - neutron_config: Optional - Adictionary with neutron endopoint and credentials. By default takes values from the provider configuration
    * example:
    {% highlight yaml %}
    # enter snippet here
    {% endhighlight %}

* `cloudify.openstack.floatingip` - a [Neutron Floating IP](http://docs.openstack.org/training-guides/content/module002-ch004-floating-ips.html)
	* properties:
		- server - Mandatory - A dictionary with the instances configurations such as image, flavor, host_name
        - management_network_name - Mandatory - The name of the Cloudify Manager network, via which the agent communicates with the manager 
        - nova_config: Optional - A dictionary with nova endpoint and credentials. By default takes values from the provider configuration
        - neutron_config: Optional - Adictionary with neutron endopoint and credentials. By default takes values from the provider configuration
    * example:
    {% highlight yaml %}
    # enter snippet here
    {% endhighlight %}


# Software Types