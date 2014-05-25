---
layout: bt_wiki
title: Getting Started with Cloudify 3.0
category: Getting Started
publish: false
abstract: Explains how to install Cloudify manager and how to deploy your first application to the Cloud
pageord: 100
--- 
{%summary%} {{page.abstract}}{%endsummary%}

# Before You Begin

Before you can deploy this application using Cloudify, you'll need to have the following setup in your environment: 
* Linux or Mac OSX. For Linux, the Cloudify CLI has been tested with Ubuntu 13.04 or higher, and Arch Linux (but should work just as well on other Linux distros). For Mac it's been tested with OSX mavericks. Windows support will be added in the near future. 
* An OpenStack cloud environment and credentials. Cloudify defaults to [HP Cloud](http://www.hpcloud.com/) endpoint URLs, so the easiest would be to [setup an account with HP Helion Cloud](https://horizon.hpcloud.com/). 
* Python 2.7 or higher installed
* `python-dev` installed. In Ubuntu you can use `apt-get install python-dev`, for Mac you can use homebrew or macports. 
* Pip (Python package manager) 1.5 or higher installed 



## Step 1: Install the Cloudify CLI

The first thing you'll need to do is install the Cloudify CLI, which will let you upload blueprints, create deployments from them and execute workflows on these deployments. This is quite simple once you have Python and pip installed. It is recommended to install the CLI in a new python [virtual environment](http://docs.python-guide.org/en/latest/dev/virtualenvs/). That will make it easier to upgrade and remove, and will also save you the need to you use `sudo` with the installation. To install the CLI follow the following steps: 
* If you're using a python `virtualenv`, activate it. 

```
cd /path/to/virtualenv
source bin/activate
```

* Type the following command: 

```
pip install https://github.com/cloudify-cosmo/cloudify-cli/archive/3.0.zip --process-dependency-links
```

The `--process-dependency-links` flag is not required if you're using pip versions older than 1.5.  

After the installation completes, you will have `cfy` command installed. Type `cfy -h` to verify that the installation completed successfully. You should see the help message. 

## Step 2: Install the Cloudify OpenStack Provider 

Next, you need to install the Cloudify OpenStack provider. The provider allows the CLI to initialize an OpenStack Havana configuration and bootstrap a Cloudify manager on an OpenStack Havana cloud (we used [HP Helion Cloud](https://www.hpcloud.com/) for this example). The bootstrap process creates a network called `cloudify-admin-network` and subnet under it, two keypairs (named `cloudify-agents-kp` and `cloudify-management-kp`), two security groups (named `cloudify-sg-agents` and `cloudify-sg-management`), starts a management VM on the OpenStack cloud, and installs the Cloudify management components on it. These include (among other things) an Nginx proxy, a nodejs server for the Cloudify Web UI, an Flask API server, a Ruby based workflow engine, ElasticSearch and Logstash for log aggregation and runtime state, RabbitMQ for messaging, and a Python Celery worker for processing tasks that are created when triggering workflows. But from a user's perspective, all it takes to bootstrap a manager is a few simple steps. To install the OpenStack provider, type the following command in your CLI:

```
pip install https://github.com/cloudify-cosmo/cloudify-openstack-provider/archive/1.0.zip --process-dependency-links
```

Note for Mac users: One of the libraries that's installed with the OpenStack provider (`pycrypto`) may fail to compile. This seems to be a [known issue](http://stackoverflow.com/questions/19617686/trying-to-install-pycrypto-on-mac-osx-mavericks/22868650#22868650). To solve it, type the following command in your terminal windows and try the installation again: 

```
export CFLAGS=-Qunused-arguments
export CPPFLAGS=-Qunused-arguments
```

## Step 3: Initialize an OpenStack Configuraton 

Next, you need to create an OpenStack congifuration and save your credentials into it. To create the configuration, type the following command: 

```
cfy init openstack
```

This will create a Cloudify configuration file named `cloudify-config.yaml` in the current directory (it will also create a file named `.cloudify` to save the current context for the `cfy` tool, but you shouldn't care about that for now). 

Next, open the file `cloudify-config.yaml` in your text editor of choice. If you're going to use HP Cloud, you will only need to change the following lines in this file and type in your account username, password and tenant name. The tenant name is the project in the HP Cloud consone (or your OpenStack Horizon dashboard). 

```yaml
keystone:
    username: Enter-Openstack-Username-Here
    password: Enter-Openstack-Password-Here
    tenant_name: Enter-Openstack-Tenant-Name-Here
```

If you're using another OpenStack cloud, there's a bit more work for you. Uncomment the `networking` and `compute` elements in the file (including all of their sub elements), and change the following elements so that they match your own OpenStack environment (note that this will leave a few elements still commented out, leave them as is): `auth_url`, `neutron_url`, `image` and `flavor`. This is what your file should look like after uncommenting: 

```yaml
keystone:
    username: Enter-Openstack-Username-Here
    password: Enter-Openstack-Password-Here
    tenant_name: Enter-Openstack-Tenant-Name-Here
    auth_url: [YOUR KEYSTONE ENDPOINT URL]

networking:
   neutron_supported_region: true
   neutron_url: [YOUR NEUTRON ENDPOINT URL]
   int_network:
       create_if_missing: true
       name: cloudify-admin-network
   subnet:
       create_if_missing: true
       name: cloudify-admin-network-subnet
       ip_version: 4
       cidr: 10.67.79.0/24
       dns_nameservers: []
   ext_network:
       create_if_missing: false #For now, this must be 'create_if_missing': False
       name: Ext-Net
   router:
       create_if_missing: true
       name: cloudify-router
   agents_security_group:
       create_if_missing: true
       name: cloudify-sg-agents
   management_security_group:
       create_if_missing: true
       name: cloudify-sg-management
       cidr: 0.0.0.0/0

compute:
   region: region-b.geo-1
   management_server:
       #floating_ip: [FLOATING_IP] #uncomment and provide preallocated ip to disable auto-allocation of new IP on each run
       user_on_management: ubuntu
       userhome_on_management: /home/ubuntu
       instance:
           create_if_missing: true
           name: cloudify-management-server
           image: [YOUR UBUNTU 13.04 OR HIGHER IMAGE ID]
           flavor: [YOUR HARDWARE FLAVOR]
       management_keypair:
           create_if_missing: true
           name: cloudify-management-kp
           #provided:
               #public_key_filepath: [PUBLIC-KEY-PATH]
               #private_key_filepath: [PRIVATE-KEY-PATH]
           auto_generated:
               private_key_target_path: ~/.ssh/cloudify-management-kp.pem
   agent_servers:
       agents_keypair:
           create_if_missing: true
           name: cloudify-agents-kp
           #provided:
               #public_key_filepath: [PUBLIC-KEY-PATH]
               #private_key_filepath: [PRIVATE-KEY-PATH]
           auto_generated:
               private_key_target_path: ~/.ssh/cloudify-agents-kp.pem
```

## Step 4: Boostrap the Cloudify Manager 
Now you're ready to bootstrap your cloudify manager. To do so type the following command in the terminal windows: 

```
cfy bootstrap
```

This should take a few minutes to complete. After validating the configuration, `cfy` will list all of the resources created, create the management VM and related networks and security groups (the latter two will not be created if they already exist), download the relevant Cloudify manager packages from the internet and install all of the components. At the end of this process you should see the following message: 

```
bootstrapping complete
management server is up at <YOUR MANAGER IP ADDRESS> (is now set as the default management server)
```

To validate this installation, point your web browser to the manager IP address (port 80). You should see the Cloudify web UI. At this point there's nothing much to see since you haven't yet uploaded any blueprint. 

## Step 5: Upload the Bluprint and Create a Deployment 

Next, we'll upload the sample blueprint and create a deployment based on it. You will first need to clone this repository into your local file system. To do so type the following command: 

```
git clone https://github.com/cloudify-cosmo/cloudify-nodecellar-openstack.git
```

This will create a directory called `cloudify-nodecellar-openstack` in your current directory. cd to this directory. You can see the blueprint file (named `blueprint.yaml`) alongside other resources related to this blueprint. 
To upload the blueprint type the following command: 

```
cfy blueprints upload -b nodecellar1 blueprint.yaml
```


