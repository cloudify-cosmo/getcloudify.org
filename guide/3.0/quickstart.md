---
layout: bt_wiki
title: Getting Started with Cloudify
category: Tutorials
publish: true
abstract: A quick tutorial for getting started with Cloudify
pageord: 100
--- 
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

This tutorial will 

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

The `-b` parameter is the unique name we've given to this blueprint on the Cloudify manager. A blueprint is a template of an application stack. Blueprints cannot be materialize on their own. For that you will need to create a deployment, which is essintially an instance of this blueprint (kind of like what an instance is to a class in an OO model). But first let's go back to the web UI and see what this blueprint looks like. Point your browser to the manager URL again, and refresh the screen. You will see the nodecellar blueprint listed there. 

![Blueprints table](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/blueprints_table.png)

Click the row with the blueprint. You will now see the topology of this blueprint. A topology is consisted of elements called nodes. In our case, we have the following nodes: a network, a subnet, a security group, two VMs, a nodejs server, a mongodb server, and a nodejs application called nodecellar (which is a nice sample nodejs application backed by mongodb). 

![Nodecellar Blueprint](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/blueprint.png)

Next, we need to cretae a deployment so we can create this topology in our OpenStack cloud. To do so, type the following command: 

```
cfy deployments create -b nodecellar1 -d nodecellar1
```

With this command we've created a deployment named `nodecellar1` from a blueprint with the same name. This deployment is not yet materialized, since we haven't issued any command to install it. If you click the "Deployments" icon in the left sidebar in the web UI, you will see that all nodes are labeled with 0/1, which means they weren't yet created. 

## Step 6: Install the Deployment 

In Cloudify, every thing that is executed for a certain deployment is done in the context of a workflow. A workflow is essentially a set of steps, executed by Cloudify agents (which are essentially Celery workers). So whenever a workflow is triggered, it sends a set of tasks to the Cloudify agents, which then execute them and report back the results. For example, the `install` workflows which we're going to trigger, will send tasks to create the various OpenStack resources, and then install and start the application components on them. By default, the Cloudify manager will create one agent per deployment, on the management VM. When application VMs are created by the default `install` workflow (in our case there's two of them), this workflow also installs an agent on each of these VMs, and subsequent tasks to configure these VMs and install application componets are executed by these agents. 
To trigger the `install` workflow, type the following command in your terminal: 

```
cfy deployments execute -d nodecellar1 install
```

These will take a couple of minutes, during which the OpenStack resources and VMs will be create and configured. To track the progress of the installation, you can look at the events emitted to the terminal windows. Each event is labeled with its time, the deployment name and the node in our topology that it relates to, e.g.

```
2014-05-07T12:10:10 CFY <nodecellar1> [neutron_subnet_1100c] Creating node
```

You can also view the events in the deployment screen in the web UI. 

![Events](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/events.png)

## Step 7: Test Drive the Application 

To test the application, you will need to access it using its public IP address. Locate the VM that runs the nodejs server in your OpenStack dashboard, and use port 8080 to access it from your web browser. You should see the nodecellar application. Click the "Browse wines" button to verify that the application was installed suceesfully and can access the mongodb database to read the list of wines. 

![Nodecellar](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-nodecellar-openstack/master/nodecellar.png)

## Step 8: Uninstall the Deployment 

Uninstalling the deployment is just a matter of running another workflow, which will teardown all the resources that were provisionined by the `install` workflow. To run the uninstallation workflow, type the following command: 

```
cfy deployments execute -d nodecellar1 uninstall
```

Similarly to the `install` workflow, you can track the progress of the uninstallation in the CLI or the web UI using the events that are displayed in both. Once the workflow complates, you can verify that the VMs were indeed destroyed and the other application related resources have been also removed. 

## Step 9: Teardown the Manager 

Next, you can also teardown the manager if you have no use for it anymore. This can be done by issuing the following command:

```
cfy teardown -f --ignore-deployments
```

This will terminate the manager VM and delete the resources associated with it. 

## What's Next 

Visit us on the Cloudify community website at [getcloudify.org](http://getcloudify.org), where you'll soon find Cloudify documentation, our mailing lists and other Cloudify goodies. 


