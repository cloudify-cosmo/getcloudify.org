---
layout: bt_wiki
title: SoftLayer Plugin
category: Plugins
publish: true
abstract: Cloudify SoftLayer plugin description and configuration
pageord: 600
---


{%summary%}
This section describes how to use a SoftLayer based cloud infrastructure in your services and applications.
For more information about SoftLayer, please refer to: [http://www.softlayer.com/](http://www.softlayer.com/).
{%endsummary%}


# Types

## cloudify.softlayer.nodes.VirtualServer


**Derived From:** [cloudify.nodes.Compute](reference-types.html)


**Properties:**

  * **Required Properties:**
    * `location` The short name or id of the data center in which the VS should reside.
    * `domain` The domain to use for the new server.
      * for more information see [Resource Naming Convention](#resource-naming-convention)
    * `ram` The item id of the desired server's RAM, e.g. item id 864 for 8 GB.
    * `cpu` The item id of the desired server's CPU, e.g. item id 859 for 4 X 2.0 GHz Cores.
    * `disk` The item id of the desired server's first disk, e.g. item id 1178 for 25 GB (SAN).

  * **Optional Properties:**
    * `api_config` 
      * A dictionary containing the authentication information for connecting to the SoftLayer API:
        - a SoftLayer username 
        - a user-specific API Key
        - a softLayer endpoint URL of choice
      * for more information see [SoftLayer-API-Overview](http://sldn.softlayer.com/article/SoftLayer-API-Overview)
      * for example:
          {
              "username":     "username",
              "password":     "api-key",
              "endpoint_url": "https://api.softlayer.com/xmlrpc/v3.1/"
          }
      * An empty dictionary by default - will be taken from other resources if not specified - see [SoftLayer authentication](#softlayer-authentication))
    * `hostname` The hostname to use for the new server, e.g. 'my-hostname'
      * An empty string by default - will be generated automatically, see [Resource Naming Convention](#resource-naming-convention)
    * `os` The item id of the operating system to use, e.g. item id 1857 for Windows Server 2008 R2 Standard Edition (64bit)
    * `image_template_global_id` An image template global id to load the server with. 
      * If an image is used, `os` must not be specified.
    * `image_template_id` An image template id to load the server with. 
      * If an image is used, `os` must not be specified.
    * `quantity` The amount of servers to order
      * default: 1
    * `use_hourly_pricing` Flag to indicate whether this server should be billed hourly (default) or monthly
      * default: true
    * `private_network_only` Flag to indicate whether the computing instance only has access to the private network
      * default: false
    * `port_speed` The item id of the port speed
      * default: 187 – the item id of 10 Mbps Public & Private Network Uplinks
    * `private_vlan` The internal identifier of the private VLAN.
      * By default SoftLayer will assign the private VLAN.
    * `public_vlan` The internal identifier of the public VLAN. Cannot be declared if `private_network_only` flag is set to true.
      * By default SoftLayer will assign the public VLAN.
    * `provision_scripts` A list of the URIs of the post-install scripts to run after creating the server
      * Each URI should start with https
    * `ssh_keys` A list of SSH keys to add to the root user
    * `bandwidth` The item id of the amount of bandwidth for this server
      * default: 439 – the item id of 0 GB bandwidth
    * `pri_ip_addresses` The item id of Primary IP Addresses
      * default: 15 – the item id of 1 IP Address
    * `monitoring` The item id of the monitoring
      * default: 49 - the item id of Host Ping
    * `notification` The item id of the notification
      * default: 51 – the item id of Email and Ticket
    * `response` The item id of the response
      * default: 52 - the item id of Automated Notification
    * `remote_management` The item id of the remote management
      * default: 503 – the item id of Reboot / Remote Console
    * `vulnerability_scanner` The item id of the vulnerability scanner
      * default: 307 – the item id of Nessus Vulnerability Assessment & Reporting
    * `vpn_management` The item id of the VPN management
      * default: 309 – the item id of Unlimited SSL VPN Users & 1 PPTP VPN User per account
    * `additional_ids` A list of additional item ids, e.g. [397] when 397 is the item id of McAfee anti-virus.

  * **Notes:**
    * Exactly one of the properties `OS`, `image_template_global_id` or `image_template_id` must be defined.  
    * If `private_network_only` is set to true, the `port_speed` item id should describe a private only port speed, otherwise, it will be changed to a private only port speed.
    * Another way to declare a private only server is to set the port speed property with an item id that describes a private only port speed, e.g. item id 498 for 1 Gbps Private Network Uplink. 
    <br>In that case, the `public_vlan` property cannot be specified.


**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create`
    1. Validates properties as done in creation_validation
    2. Creates a virtual server.
    3. Waits for transactions to begin (the create process has begun).
  * `cloudify.interfaces.lifecycle.start`
    1. Waits for transactions to end if there are any.
    2. Starts the server, if it’s not already running.
  * `cloudify.interfaces.lifecycle.stop`
    1. Waits for transactions to end if there are any.
    2. Stops the server, if it’s not already halted.
  * `cloudify.interfaces.lifecycle.delete`
    1. Deletes the server.
    2. Waits for transactions to start (the delete process has begun). 
    3. Waits for for transactions to end (the delete process has terminated).
  * `cloudify.interfaces.validation.creation_validation`
    1. Validates that all required properties are specified.
    2. Validates that exactly one of the properties `OS`, `image_template_global_id` or `image_template_id` were provided.
    3. Validates that all specified price ids are legal.
    4. Validates private only properties.


**Attributes:**
  See the [Runtime Properties section](#runtime-properties)


## cloudify.softlayer.nodes.WindowsServer


**Derived From:** [cloudify.softlayer.nodes.VirtualServer](#cloudifysoftlayernodesvirtualserver)
	This type has the same properties and operations-mapping as the type above (as it is derived from it), 
	yet it overrides some of the agent and plugin installations operations-mapping derived from the built-in cloudify.nodes.Compute type. 
	
  Use this type when working with a Windows server.


# Runtime Properties

Node instances of any of the types defined in this plugin are set with the following runtime properties:

Two runtime-properties are available on node instances of these types once the `cloudify.interfaces.lifecycle.create` operation succeeds:
  
  * `instance_id` – virtual server instance unique identifier 
  * `hostname` – the hostname determined in the plugin's creation process.

The following runtime-properties are available on node instances of this type once the `cloudify.interfaces.lifecycle.start` operation succeeds: 
  
  * `ip` – the private ip of the server
  * `public_ip` – the public ip of the server
  * `username` – server's username
  * `password` – server's password


# Resource Naming Convention
When creating a virtual server, its name on SoftLayer will be `<hostname>.<domain>` where \<hostname> and \<domain> are the values of the `hostname` and the `domain` proeprties respectively.

In case the `hostname` property is not provided, the value of the server's hostname will default to its node-instance-id, which was generated in the deployment creation process. 

{%note%}
In case this server is created as part of a deployment on a manager, and the `resource_prefix` property is provided on the manager blueprint, the server's full name on SoftLayer will be `<prefix>-<hostname/node-instance-id>.<domain>`.
{%endnote%}

Following the SoftLayer naming convention (see below), some changes may be made to the hostname part of the server's name:

  - The hostname part (`<prefix>-<hostname/node-instance-id>`) will be chopped to 15 chars (out of 15 characters, at most 5 characters will be taken in favor of the prefix and the rest will be chopped from the beginning of the hostname/node-instnace-id)
  - Every '_' will be replace by a '-'
  - If the chopping mentioned above has created two consecutive dashes, then they will be replaced with a single dash.

Examples:
  
  - If `resource_prefix` property was set to "softlayer" and the node's `hostname` property was set to "my_hostname" then the server's hostname on SoftLayer will be 'softl-hostname' (after unifying consecutive dashes in 'softl-\-hostname')
  - If the hostname and prefix weren't provided, and the server node is defined with the name "sl_server", then the server's hostname on SoftLayer will be `sl-server-XXXXX` (where the XXXXX is the autogenerated part of the node instance's ID).

The domain is a required property and it must follow the SoftLayer naming convention.

{%info title=SoftLayer naming convention%}
The correct SoftLayer naming convention is as follows:
  The hostname and domain must be alphanumeric strings that may be separated by periods '.'. 
  
  The only other allowable special character is the dash '-' 
  
  However the special characters '.' and '-' may not be consecutive. 
  
  Each alphanumeric string separated by a period is considered a label. 
  
  Labels must begin and end with an alphanumeric character. 
  
  Each label cannot be solely comprised of digits and must be between 1-63 characters in length. 
  
  The last label, the TLD (top level domain) must be between 2-24 alphabetic characters. 
  
  The domain portion must consist of least one label followed by a period '.' then ending with the TLD label. 
  
  For Microsoft Windows operating systems, the hostname portion may not exceed 15 characters in length. 
  
  Combining the hostname, followed by a period '.', followed by the domain gives the FQDN (fully qualified domain name), which may not exceed 253 characters in total length.
{%endinfo%}


# SoftLayer authentication

The SoftLayer plugin requires credentials and endpoint setup information in order to authenticate and interact with SoftLayer.

**This information will be gathered by the plugin from the following sources:**
  
  * values specified in the `api_config` property (see api_config property)
  * If not specified, will be taken from the JSON configuration file at `~/softlayer_config.json`
  * If `~/softlayer_config.json` is not defined:
    * username and API Key will be taken from the environment variables `SL_USERNAME` and `SL_API_KEY` 
    * An exception is thrown if either of these is not defined
    * The SoftLayer default endpoint will be fine for most use cases.

The mentioned configuration file is a JSON file that holds the username, api_key and endpoint_url. 
Specifically, it is expected to look like so:
{% highlight json %}
{
    "username":     "Enter-SoftLayer-Username-Here",
    "password":     "Enter-SoftLayer-Password-Here",
    "endpoint_url": "Enter-SoftLayer-endpoint-url-Here"
}
{%endhighlight%}

{%note%}
If the Cloudify bootstrap was done using the SoftLayer manager blueprint, the authentication with SoftLayer is taken care of automatically. 
The plugin does this by using configuration files created for it by the manager during the Cloudify bootstrap process.
{%endnote%}



# Examples

## Example I

This example will show how to use linux virtual server type in this plugin, declare all needed properties and use ssh_keys

{% togglecloak id=1 %}
Example I
{% endtogglecloak %}

{% gcloak 1 %}

{% highlight yaml %}
tosca_definitions_version: cloudify_dsl_1_0

imports:
    - http://www.getcloudify.org/spec/cloudify/3.2m4/types.yaml
    - http://www.getcloudify.org/spec/softlayer-plugin/1.2m4/plugin.yaml

inputs:
  username:
    default: ''
  api_key:
    default: ''
  endpoint_url:
    default: ''
  location:
    default: 352494
  domain:
    default: cloudify.org
  ram:
    default: 864
  cpu:
    default: 859
  disk:
    default: 1178
  os:
    default: 4174
  image_template_id:
    default: ''
  private_network_only:
    type: boolean
    default: false
  port_speed:
    type: integer
    default: 187
  private_vlan:
    type: integer
    default: ''
  public_vlan:
    type: integer
    default: ''
  provision_scripts:
    default: []
  additional_ids:
    default: []
  install_agent:
    default: true

node_templates:
  linux_host:
    type: cloudify.softlayer.nodes.VirtualServer
    properties:
      api_config: { get_property: [softlayer_configuration, api_config] }
      location: { get_input: location }
      domain: { get_input: domain }
      ram: { get_input: ram }
      cpu: { get_input: cpu }
      disk: { get_input: disk }
      os: { get_input: os }
      image_template_id: { get_input: image_template_id }
      private_network_only: { get_input: private_network_only }
      port_speed: { get_input: port_speed }
      private_vlan: { get_input: private_vlan }
      public_vlan: { get_input: public_vlan }
      provision_scripts: { get_input: provision_scripts }
      additional_ids: { get_input: additional_ids }
      install_agent: { get_input: install_agent }
  
  softlayer_configuration:
    type: softlayer_configuration
    properties:
      api_config:
        username: { get_input: username }
        api_key: { get_input: api_key }
        endpoint_url: { get_input: endpoint_url }
{%endhighlight%}

{% endgcloak %}


## Example II

This example will show how to use windows virtual server type in this plugin, declare all needed properties and use post provision script


{% togglecloak id=2 %}
Example II
{% endtogglecloak %}

{% gcloak 2 %}

{% highlight yaml %}

tosca_definitions_version: cloudify_dsl_1_0

imports:
    - http://www.getcloudify.org/spec/cloudify/3.2m4/types.yaml
    - http://www.getcloudify.org/spec/softlayer-plugin/1.2m4/plugin.yaml

inputs:
  username:
    default: ''
  api_key:
    default: ''
  endpoint_url:
    default: ''
  location:
    default: 352494
  domain:
    default: cloudify.org
  ram:
    default: 864
  cpu:
    default: 859
  disk:
    default: 1178
  os:
    default: 4248
  image_template_id:
    default: ''
  private_network_only:
    type: boolean
    default: false
  port_speed:
    type: integer
    default: 187
  private_vlan:
    type: integer
    default: ''
  public_vlan:
    type: integer
    default: ''
  provision_scripts:
    default: ['https://raw.githubusercontent.com/cloudify-cosmo/cloudify-softlayer-plugin/master/softlayer_plugin/scripts/postprov.cmd']
  additional_ids:
    default: []
  install_agent:
    default: true

node_templates:
  windows_host:
    type: cloudify.softlayer.nodes.WindowsVirtualServer
    properties:
      api_config: { get_property: [softlayer_configuration, api_config] }
      location: { get_input: location }
      domain: { get_input: domain }
      ram: { get_input: ram }
      cpu: { get_input: cpu }
      disk: { get_input: disk }
      os: { get_input: os }
      image_template_id: { get_input: image_template_id }
      private_network_only: { get_input: private_network_only }
      port_speed: { get_input: port_speed }
      private_vlan: { get_input: private_vlan }
      public_vlan: { get_input: public_vlan }
      provision_scripts: { get_input: provision_scripts }
      additional_ids: { get_input: additional_ids }
      install_agent: { get_input: install_agent }
  
  softlayer_configuration:
    type: softlayer_configuration
    properties:
      api_config:
        username: { get_input: username }
        api_key: { get_input: api_key }
        endpoint_url: { get_input: endpoint_url }
{%endhighlight%}

{% endgcloak %}


## Example III

This example will show how to launch a Flex image on SoftLayer with a local workflow

It will also show how to use the outputs section to get the public ip, username and password of a server, in the same way all the runtime_properties can be achieved (see [Blueprint Authoring Guide - adding-outputs](http://getcloudify.org/guide/3.2/guide-blueprint.html#step-7-adding-outputs))

{% togglecloak id=3 %}
Example III
{% endtogglecloak %}

{% gcloak 3 %}

{% highlight yaml %}
tosca_definitions_version: cloudify_dsl_1_0

imports:
    - http://www.getcloudify.org/spec/cloudify/3.1/types.yaml
    - https://raw.githubusercontent.com/cloudify-cosmo/cloudify-softlayer-plugin/widget/plugin.yaml

inputs:
  username:
    default: ''
  api_key:
    default: ''
  endpoint_url:
    default: ''
  location:
    default: '168642'
  domain:
    default: 'blu.cfy.org'
  ram:
    default: 1155
  os:
    default: ''
    # When you use a FLEX image , leave the os empty ('').
  image_template_id:
    default: ''
  image_template_global_id:
    default: 'b700cf71-3aee-4c67-9040-cfa140ae40cd'
  cpu:
    default: 860
  disk:
    default: 3876
  port_speed:
    default: 188
    # 188 - 1 Gbps Public & Private Network Uplinks
  private_network_only:
    default: false

  ssh_keys:
    default: [REPLACE_THIS_WITH_YOUR_SL_KEY_ITEM_ID]
  ssh_key_filename:
    default: '~/.ssh/id_rsa'

node_templates:
  blu_node:
    type: cloudify.softlayer.nodes.VirtualServer
    properties:
      api_config: { get_property: [softlayer_configuration, api_config] }
      location: { get_input: location }
      domain: { get_input: domain }
      ram: { get_input: ram }
      os: { get_input: os }
      image_template_id: { get_input: image_template_id }
      image_template_global_id: { get_input: image_template_global_id }
      cpu: { get_input: cpu }
      disk: { get_input: disk }

      ssh_keys: { get_input: ssh_keys }
      port_speed: { get_input: port_speed }
      private_network_only: { get_input: private_network_only }
      private_vlan: { get_input: private_vlan }
      public_vlan: { get_input: public_vlan }
      provision_scripts: { get_input: provision_scripts }
      additional_ids: { get_input: additional_ids }
      install_agent: false

  softlayer_configuration:
    type: softlayer_configuration
    properties:
      api_config:
        username: { get_input: username }
        api_key: { get_input: api_key }
        endpoint_url: { get_input: endpoint_url }

outputs:
  blu_ip:
    value: { get_attribute: [blu_node, public_ip] }
  blu_username:
    value: { get_attribute: [blu_node, username] }
  blue_password:
    value: { get_attribute: [blu_node, password] }

{%endhighlight%}

{% endgcloak %}


