---
layout: bt_wiki
title: Bootstrapping on Openstack
category: Installation
publish: true
abstract: "Tutorial for bootstrapping on Openstack"
pageord: 300
---

{%summary%} Bootstrapping Cloudify on Openstack is done via Cloudify CLI in the same fashion as any other environment. This section will detail the various parameters appearing in the Openstack-specific configuration file. {%endsummary%}

# Initialization

Run this in a shell from an empty directory:

{% highlight sh %}
cfy init openstack
{%endhighlight%}

This command will initialize the Cloudify CLI for the current directory, as well as create a Openstack-specific configuration file named `cloudify-config.yaml`.

# Configuration

Open the configuration file in your favorite editor. This is what you'll see:

{% togglecloak id=1 %}Configuration file template{% endtogglecloak %}
{% gcloak 1 %}
{% highlight yaml %}
# Configuration file for the Cloudify Openstack Provider.
# The settings in this file will be used for configure the Cloudify bootstrap process.
# Please note:
# 1. create_if_missing: Openstack components are references by their name.
#    If this field is set to true (default) in any of the components,Cloudify will attempt to use the component if it already exists, and will create it if it does not.
#    If this field is set to false, Cloudify will only use an existing resource. If it does not exist, bootstrapping will fail.

# Keystone configuration. These settings are mandatory.
# Note that you can set the keystone parameters using the following environment variables:
# OS_USERNAME, OS_PASSWORD, OS_TENANT_NAME, OS_AUTH_URL
# These settings are available in the horizon dashboard (Look for API credentials)
# If using environment variables, you can delete the appropriate entry here, or leave the value empty.
keystone:
    username: Enter-Openstack-Username-Here
    password: Enter-Openstack-Password-Here
    tenant_name: Enter-Openstack-Tenant-Name-Here
    auth_url: Enter-Openstack-Auth-Url-Here


# # Network configuration
#######################
#
#networking:
#    # Indicates if neutron networking is used in the region to be used. Defaults to true
#    neutron_supported_region: true
#    # URL of the neutron service. If not specified or left empty, the first neutron service available in keystone will be used.
#    neutron_url:
#    # Settings for the Cloudify Management Network and its components
#    int_network:
#        create_if_missing: true
#        name: cloudify-admin-network
#    subnet:
#        create_if_missing: true
#        name: cloudify-admin-network-subnet
#        ip_version: 4
#        cidr: 10.67.79.0/24
#        dns_nameservers: []
#    # The external network that Cloudify should plug its router into.
#    # Note that Cloudify does not create the external network.
#    ext_network:
#        create_if_missing: false # this must be set to false
#        name: Ext-Net
#    router:
#        create_if_missing: true
#        name: cloudify-router
#    # Security groups used by Cloudify
#    agents_security_group:
#        create_if_missing: true
#        name: cloudify-sg-agents
#    management_security_group:
#        create_if_missing: true
#        name: cloudify-sg-management
#        cidr: 0.0.0.0/0
#
# # Compute Configuration
########################
#compute:
#    # The region where resources will be provisioned. Defaults to RegionOne.
#    region: [Enter-Region-Name]
#    management_server:
#        # uncomment and provide preallocated ip to disable auto-allocation of new IP on each run
#        #floating_ip: [FLOATING_IP]
#        # username on management machine which Cloudify will use to bootstrap. The user must already exist on the image.
#        user_on_management: ubuntu
#        # Home directory of management user
#        userhome_on_management: /home/ubuntu
#        # Timeout (in seconds) for provisioning of the management machine.
#        creation_timeout: 300
#        # Details of the management machine
#        instance:
#            create_if_missing: true
#            name: cloudify-management-server
#            # Mandatory. Set the image ID to be used for the management machine.
#            # An openstack Image ID is usually a hexadecimal string like this one: 8c096c29-a666-4b82-99c4-c77dc70cfb40
#            image: [Enter-Image-ID]
#            # The flavor used for the management machine. Defaults to 102.
#            flavor: 102
#        # Keypair used for management.
#        management_keypair:
#            create_if_missing: true
#            name: cloudify-management-kp
#            # Local file path where existing key is stored or where generated private key will be saved
#            private_key_path: ~/.ssh/cloudify-management-kp.pem
#    # Agent configuration
#    agent_servers:
#        agents_keypair:
#            create_if_missing: true
#            name: cloudify-agents-kp
#            private_key_path: ~/.ssh/cloudify-agents-kp.pem
#
# # Cloudify Installation Configuration
##################################
# cloudify:
#    # You would probably want a prefix that ends with underscore or dash
#    resources_prefix: your_name_here
#
#    server:
#        packages:
#            components_package_url: "..."
#            core_package_url: "..."
#            ui_package_url: "..."
#    agents:
#        packages:
#            ubuntu_agent_url: "..."
#            windows_agent_url: "..."
#        config:
#            min_workers: 2
#            max_workers: 5
#            remote_execution_port: 22
#            # user: Enter-Default-Image-User-Here-(Optional)
#    workflows:
#        task_retries: -1  # -1 means we retry forever
#        retry_interval: 30
#    bootstrap:
#        ssh:
#            # number of retries for the initial connectivity check with the management server
#            initial_connectivity_retries: 25
#            # wait time (in seconds) in between the aforementioned retries
#            initial_connectivity_retries_interval: 5
#            # number of retries for bootstrap commands run via SSH
#            command_retries: 3
#            # wait time (in seconds) in between the aforementioned retries
#            retries_interval: 3
#            # number of SSH connection attempts (in a single retry)
#            connection_attempts: 1
#            # timeout (in seconds) for an SSH connection
#            socket_timeout: 10
{%endhighlight%}
{% endgcloak %}


{%tip title=Tip%}
Most of the parameters don't require changing and are there for flexibility and robustness purposes only. To bootstrap as quickly and easily as possible, You only have to set the following fields:
<br>
<li>The fields under the <code>keystone</code> configuration section (credentials and authentication endpoint)</li>
<li>The `region` field under the <code>compute</code> configuration section</li>
<li>The <code>image</code> and <code>flavor</code> fields under the nested <code>computer.management_server.instance</code> configuration section</li>
<br>
Finally, you should verify that the default value of the `networking.ext_network.name` nested field is the name of the external network in the provided region, or change this value accordingly.
{%endtip%}

{%note title=Note%}All resources which need to be provisioned on the cloud have a `name` field in their configuration section. Before a resource is provisioned, There's a check for whether it already exists or not, which is done by name using the value of that `name` field. If the resource does exist, it'll be used as is, regardless of other definitions under that resource's configuration section which may or may not be true for the existing resource.
<br>
For example, if the `subnet` resource already exists, it'll be used as is even if the `cidr` field value in the configuration file is not the same as defined in the actual resource in the cloud.{%endnote%}


Information on each individual configuration parameter is provided below, separated according to the configuration sections:

{% togglecloak id=2 %}keystone{% endtogglecloak %}
{% gcloak 2 %}
* `username` The username to be used for authentication
* `password` The password to be used for authentication
* `tenant_name` The name of the tenant to use
* `auth_url` The Openstack Identity ('Keystone') service endpoint URL
{% endgcloak %}

{% togglecloak id=3 %}networking{% endtogglecloak %}
{% gcloak 3 %}
* `neutron_supported_region` A flag for whether Neutron (networking) is available in the given Region. If set to False, the rest of the definitions under the 'networking' section will be ignored, and a flat network will be used (this option exists to support legacy Openstack versions e.g. Folsom) (Default: `True`)
* `neutron_url` The Openstack Networking ('Neutron') service endpoint URL. If not provided, the first Neutron service available in Keystone will be used.
* `int_network`
  * `create_if_missing` A flag for whether to create the internal management network or raise an error if it doesn't yet exist (Default: `True`)
  * `name` The name of the internal management network (Default: `cloudify-admin-network`)
* `subnet`
  * `create_if_missing` A flag for whether to create the subnet on the internal management network or raise an error if it doesn't yet exist (Default: `True`)
  * `name` The name of the subnet on the internal management network (Default: `cloudify-admin-network-subnet`)
  * `ip_version` The IP version for the subnet (Default: `4`)
  * `cidr` the subnet's address range (Default: `10.67.79.0/24`)
  * `dns_nameservers` A list of DNS servers (Default: `[]`)
* `ext_network`
  * `create_if_missing` A flag for whether to create the external network or raise an error if it doesn't yet exist (Default: `False`) **Note:** Currently, creating the external network is only possible by the cloud admin, meaning it has to be created manually prior to bootstrapping. It is therefore also recommended this property is set to False
  * `name` The name of the external network (Default: `Ext-Net`)
* `router`
  * `create_if_missing` A flag for whether to create the management network router or raise an error if it doesn't yet exist (Default: `True`)
  * `name` The name of the management network router (Default: `cloudify-router`)
* `agents_security_group`
  * `create_if_missing` A flag for whether to create the agents security group or raise an error if it doesn't yet exist (Default: `True`)
  * `name` The name of the agents security group. This security group will be used by default for all agent machines (Default: `cloudify-sg-agents`)
* `management_security_group`
  * `create_if_missing` A flag for whether to create the management security group or raise an error if it doesn't yet exist (Default: `True`)
  * `name` The name of the management security group. This security group will be used for the management server (Default: `cloudify-sg-management`)
  * `cidr` The address range for the rules of the management security group. The management server will only be available for addresses within this range (Default: `0.0.0.0/0`) **Note:** The local machine's address must be within this address range for the bootstrap process to work
{% endgcloak %}

{% togglecloak id=4 %}compute{% endtogglecloak %}
{% gcloak 4 %}
* `region` The region where resources will be provisioned (Default: `RegionOne`)
* `management_server`
  * `floating_ip` A pre-allocated floating IP on the cloud which will be used for the management server. If not provided, a floating IP will be automatically allocated and used
  * `user_on_management` The username Cloudify will use to bootstrap the management server. The user must already exist on the image (Default: `Ubuntu`)
  * `userhome_on_management` The home directory of the username provided on the management server (Default:  `/home/ubuntu`)
  * `creation_timeout` Timeout (in seconds) for the provisioning of the management server (Default: `300`)
  * `instance`
    * `name` The name of the management server (Default: `cloudify-management-server`)
    * `image` The image ID on the cloud. This is the image for the management server
    * `flavor` The flavor ID on the cloud. This is the flavor for the management server (Default: `102`) **Note:** Make sure the flavor used satisfies the minimum requirements for the management server as specified [here](installation-general.html#prerequisites)
  * `management_keypair`
    * `create_if_missing` A flag for whether to create the management keypair or raise an error if it doesn't yet exist on Openstack (Default: `True`)
    * `name` The name of the management keypair. This keypair will be used to authenticate with the management server (Default: `cloudify-management-kp`)
    * `private_key_path` The local path where the private key file is at or where it will be saved if automatically created. **Note:** If the key is to be created, this file path must not already exist (Default: `~/.ssh/cloudify-management-kp.pem`)
* `agent_servers`
  * `agents_keypair`
    * `create_if_missing` A flag for whether to create the agents keypair or raise an error if it doesn't yet exist on Openstack (Default: `True`)
    * `name` The name of the agents keypair. This keypair will be used by the management server to authenticate with the agent machines (Default: `cloudify-agents-kp`)
    * `private_key_path` The local path where the private key file is at or where it will be saved if automatically created. **Note:** If the key is to be created, this file path must not already exist (Default: `~/.ssh/cloudify-agents-kp.pem`)

{% endgcloak %}

{% togglecloak id=5 %}cloudify{% endtogglecloak %}
{% gcloak 5 %}
Since this section is for generic CLI parameters, documentation for these parameters can be found in the [CLI guide](guide-cli.html#configuration)
{% endgcloak %}


# Bootstrapping

Once you're done editing the configuration, run this from within the shell, in the same directory as before:


{% highlight sh %}
cfy bootstrap
{%endhighlight%}
