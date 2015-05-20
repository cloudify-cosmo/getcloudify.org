---
layout: bt_wiki
title: Bootstrapping
category: Getting Started
publish: true
abstract: Instructions on how to bootstrap a Cloudify Manager
pageord: 100
---
{%summary%}{{page.abstract}}{%endsummary%}

# Overview

While Cloudify's CLI provides [very limited support for deploying an application](LOCAL_WORKFLOWS_LINK!) by itself, you'll have to bootstrap a Cloudify Manager to be able to fully utilize Cloudify to deploy your application.

A Cloudify Manager comprises Cloudify's code and [several underlying open-source tools](overview-components.html), which have been integrated to create a dynamic environment, and will support the different operational flows that you might be interested in when deploying your application.

Using different Cloudify plugins, the bootstrap process will create the infrastructure (servers, networks, security groups and rules, etc..) required for Cloudify's Manager to run in that environment.


# Step 1: Initialize a Working Directory

Navigate to a directory of your choosing, and initialize it as a Cloudify CLI working directory using this command:

{% highlight sh %}
cfy init
{%endhighlight%}

This will create a folder in the current directory named `.cloudify`. (Cloudify will store the current context for the Cloudify CLI, but you shouldn't care about that for now.)


# Step 2: Prepare the Bootstrap Configuration

Bootstrapping a Cloudify Manager uses [Manager Blueprints](reference-terminology.html#manager-blueprints). These are standard Cloudify blueprints that have been constructed to bring up a Manager on various providers.

Clone the [Cloudify-Manager-Blueprints](https://github.com/cloudify-cosmo/cloudify-manager-blueprints) repository from Github, or copy your desired blueprint folder from there.

{% highlight bash %}
mkdir -p ~/cloudify-manager
cd ~/cloudify-manager
git clone https://github.com/cloudify-cosmo/cloudify-manager-blueprints
{% endhighlight %}

{%note title=Note%}
You can download the correct Cloudify-Manager-Blueprints for the CFY version you're using from [Cloudify-Manager-Blueprints](https://github.com/cloudify-cosmo/cloudify-manager-blueprints/releases)
{%endnote%}


Now let's move on to configuration.

We'll configure an Inputs YAML file. This file will serve as the configuration for the manager blueprint inputs. Note that the various manager blueprints folders offer an *inputs.yaml.template* file, which can be copied and edited with the desired values.

Below are examples of input.yaml file configurations for differnet providers. You can also generate a file on your own.


{% togglecloak id=1 %}**Configuring your Manager Blueprint**{% endtogglecloak %}

{% gcloak 1 %}

{% inittab %}

{% tabcontent OpenStack %}

[HP Cloud](http://www.hpcloud.com/) is a public OpenStack cloud. As such it provides a fairly easy starting point for experiencing a fully operational OpenStack environment. To use HP Cloud you need to [Setup an account on the HP Helion Cloud](https://horizon.hpcloud.com/).

This blueprint defines quite a few input parameters we need to fill out.

Let's make a copy of the inputs template already provided and edit it:

{% highlight bash %}
cd cloudify-manager-blueprints/openstack
cp inputs.yaml.template inputs.yaml
{% endhighlight %}

The inputs.yaml file should look somewhat like this:

{% highlight yaml %}
keystone_username: your_openstack_username
keystone_password: your_openstack_password
keystone_tenant_name: your_openstack_tenant
keystone_url: https://region-b.geo-1.identity.hpcloudsvc.com:35357/v2.0/
region: region-b.geo-1
manager_public_key_name: manager-kp
agent_public_key_name: agent-kp
image_id: 8c096c29-a666-4b82-99c4-c77dc70cfb40
flavor_id: 102
external_network_name: Ext-Net

use_existing_manager_keypair: false
use_existing_agent_keypair: false
manager_server_name: cloudify-management-server
manager_server_user: ubuntu
manager_server_user_home: /home/ubuntu
manager_private_key_path: ~/.ssh/cloudify-manager-kp.pem
agent_private_key_path: ~/.ssh/cloudify-agent-kp.pem
agents_user: ubuntu
nova_url: ''
neutron_url: ''
resources_prefix: cloudify
{% endhighlight %}

You will, at the very least, have to provide the following:

* `keystone_username`
* `keystone_password`
* `keystone_tenant_name`

In case you are using a different openstack environment, you should also change the following values:

* `image_id`
* `flavor_id`
* `external_network_name`

...to fit your specific openstack installation.

Notice that the `resources_prefix` parameter is set to "cloudify" so that all resources provisioned during
this guide are prefixed for easy identification.

For more information on the different management environment structures, please refer to [Openstack Manager Reference](reference-openstack-manager.html).

{% endtabcontent %}

{% tabcontent SoftLayer %}

{%note title=Note%}
The Softlayer IaaS plugin is a feature of the commercial version of Cloudify. For more information, [go pro](/goPro.html).
{%endnote%}

This blueprint defines quite a few input parameters we need to fill out.

Let's make a copy of the inputs template already provided and edit it:

{% highlight bash %}
cd cloudify-manager-blueprints/softlayer
cp inputs.yaml.template inputs.yaml
{% endhighlight %}

The inputs.yaml file should look somewhat like this:

{% highlight yaml %}
# mandatory
username: ''
api_key: ''
endpoint_url: ''
location: ''
domain: ''
ram: ''
cpu: ''
disk: ''
os: ''
ssh_keys: []
ssh_key_filename: ''

# optional
hostname: ''
image_template_global_id: ''
image_template_id: ''
private_network_only: false
port_speed: 187
private_vlan: ''
public_vlan: ''
provision_scripts: []
agents_user: root
resources_prefix: ''
{% endhighlight %}

You will, at the very least, have to provide the mandatory inputs.

{%info%}
This tutorial uses softlayer manager blueprint on Docker and it requires:

  * The `os` input should be *4668* - the item id of *Ubuntu Linux 14.04 LTS Trusty Tahr - Minimal Install (64 bit)*
  * A link to a script that installs curl must be specified (needed for the Docket installation) in the `provision_scripts` input.
    * for example: [a script that installs curl](https://raw.githubusercontent.com/cloudify-cosmo/cloudify-softlayer-plugin/master/softlayer_plugin/scripts/postprov.sh)
    * Alternatively, create an image id of a server on SoftLayer that have curl or docker installed on it, and specify the `image_template_id` instead of the `os` input.
{%endinfo%}


For more information see the [Softlayer Manager Reference](reference-softlayer-manager.html).

{% endtabcontent %}

{% tabcontent AWS EC2 %}

[EC2 Compute Classic](http://aws.amazon.com/ec2/) is a public cloud. To use AWS you need to [Setup an account on AWS](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html).

This blueprint defines quite a few input parameters we need to fill out.

Let's make a copy of the inputs template already provided and edit it:

{% highlight bash %}
cd cloudify-manager-blueprints/aws-ec2
cp inputs.yaml.template inputs.yaml
{% endhighlight %}

The inputs.yaml file should look somewhat like this:

{% highlight yaml %}
# mandatory
aws_access_key_id: ''
aws_secret_access_key: ''
image_id: ''
instance_type: ''
manager_keypair_name: ''
agent_keypair_name: ''

# optional
use_existing_manager_group: false
use_existing_agent_group: false
use_existing_manager_keypair: false
use_existing_agent_keypair: false
manager_key_pair_file_path: ~/.ssh/cloudify-manager-kp.pem
agent_key_pair_file_path: ~/.ssh/cloudify-agent-kp.pem
mananger_security_group_name: cloudify-manager-security-group
agent_security_group_name: cloudify-agent-security-group
manager_server_name: cloudify-manager-server
manager_server_user: ubuntu
agents_user: ubuntu
ec2_region_name: ''
{% endhighlight %}

You will, at the very least, have to provide the mandatory inputs.

{%info%}
This tutorial uses AWS EC2 manager blueprint on Docker and it requires:
 * The `image_id` input should be a 64 bit Ubuntu Trusty 14.04 image. Because this plugin currently only supports EC2 Classic, and not VPC, it is most likely that you will be required to use an EBS-backed instance.
 * The `instance_type` input should probably be larger than the `t*.micro` instances.

You will, at the very least, have to provide the following:
* `aws_access_key_id`
* `aws_secret_access_key`

{%endinfo%}

For more information see the [AWS EC2 Manager Reference](reference-aws-ec2-manager.html).

{% endtabcontent %}

{% tabcontent vCloud %}

This blueprint defines quite a few input parameters we need to fill out.

Let's make a copy of the inputs template already provided and edit it:

{% highlight bash %}
cd cloudify-manager-blueprints/vcloud-air
cp inputs.yaml.template inputs.yaml
{% endhighlight %}

The inputs.yaml file should look somewhat like this:

{% highlight yaml %}
vcloud_username: ''
vcloud_password: ''
vcloud_url: ''
vcloud_service: ''
vcloud_vdc: ''
manager_server_name: ''
manager_server_catalog: ''
manager_server_template: ''
management_network_use_existing: true
management_network_name: ''
edge_gateway: ''
floating_ip_public_ip: ''
manager_private_key_path: '~/.ssh/manager.pem'
agent_private_key_path: '~/.ssh/agent.pem'
manager_public_key: ''
agent_public_key: ''
{% endhighlight %}

For more information see the [vCloud Manager Reference](reference-vcloud-manager.html).

{% endtabcontent %}

{% endinittab %}

{% endgcloak %}

## Available manager blueprints
See the reference section in the documentation menu for a reference of all currently available Manager Blueprints.

{%note title=Note%}
The manager blueprints comprise not only the *.yaml* file, but also the entire directory in which the *.yaml* file resides. For example, the manager blueprints map bootstrap operations to scripts that perform many of the bootstrap tasks. Make sure to copy the full directory for when using or editing manager blueprints.
{%endnote%}

## Authoring manager blueprints

If you wish to write a custom manager blueprint (whether it be for a custom behavior or a different provider) or learn more on how manager blueprints work, refer to the [Manager Blueprints Authoring guide](guide-authoring-manager-blueprints.html).


# Install Required Plugins

Manager blueprints can use Cloudify plugins to perform the bootstrapping process. While this is good to know, you can ignore this section as we'll be installing Cloudify plugins as a part of the bootstrap process itself.

Anyhow, you can install the blueprint-specific dependencies by running:

 `cfy local install-plugins -p /path/to/manager/blueprint/file`

For example, on openstack:

 `cfy local install-plugins -p cloudify-manager-blueprints/openstack/openstack-manager-blueprint.yaml`

(Alternatively, you may pass the `--install-plugins` flag to the `cfy bootstrap` command, which follows soon.)

{%note title=Note%}
Ths *install-plugins* functionality only works if you are running from within a virtualenv.
If this is not the case, installing plugins will require sudo permissions and can be done like so:

{% inittab %}

{% tabcontent OpenStack%}
{% highlight sh %}
cfy local create-requirements -o requirements.txt -p openstack-manager-blueprint.yaml
sudo pip install -r requirements.txt
{%endhighlight%}
{% endtabcontent %}

{% tabcontent SoftLayer%}
{% highlight sh %}
cfy local create-requirements -o requirements.txt -p softlayer.yaml
sudo pip install -r requirements.txt
{%endhighlight%}
{% endtabcontent %}

{% tabcontent AWS EC2%}
{% highlight sh %}
cfy local create-requirements -o requirements.txt -p aws-ec2-manager-blueprint.yaml
sudo pip install -r requirements.txt
{%endhighlight%}
{% endtabcontent %}

{% tabcontent vCloud%}
{% highlight sh %}
cfy local create-requirements -o requirements.txt -p vcloud.yaml
sudo pip install -r requirements.txt
{%endhighlight%}
{% endtabcontent %}

{% endinittab %}

{%endnote%}


# Step 3: Bootstrap a Cloudify Manager

{%note title=Note%}
Please verify the [prerequisites](getting-started-prerequisites.html) before bootstrapping.
{%endnote%}

Finally, run the `cfy bootstrap` command, pointing it to the manager blueprint file and the inputs YAML file, like so:

{% highlight sh %}
cfy bootstrap --install-plugins -p /path/to/manager/blueprint/file -i /path/to/inputs/yaml/file
{%endhighlight%}


(Choose the command fitting your provider below.)


{% inittab %}

{% tabcontent OpenStack%}

{% highlight bash %}

cfy bootstrap --install-plugins -p openstack-manager-blueprint.yaml -i inputs.yaml

{% endhighlight %}

{% endtabcontent %}

{% tabcontent SoftLayer%}

{% highlight bash %}

cfy bootstrap --install-plugins -p softlayer.yaml -i inputs.yaml --task-retries 25

{% endhighlight %}

{% endtabcontent %}

{% tabcontent AWS EC2%}

{% highlight bash %}

cfy bootstrap --install-plugins -p aws-ec2-manager-blueprint.yaml -i inputs.yaml --task-retries 10

{% endhighlight %}

{% endtabcontent %}

{% tabcontent vCloud%}

{% highlight bash %}

cfy bootstrap --install-plugins -p vcloud.yaml -i inputs.yaml --task-retries 10

{% endhighlight %}

{% endtabcontent %}

{% endinittab %}




This should take a few minutes to complete (depending on how responsive your cloud environment is).
After validating the configuration, `cfy` will create the management VM, related
networks and security groups, download the relevant Cloudify packages and install all of the components.
At the end of this process you should see the following message:

{% highlight bash %}
bootstrapping complete
management server is up at <YOUR MANAGER IP ADDRESS>
{% endhighlight %}

To validate this installation, point your web browser to the manager IP address (port 80).
If you're using the commercial version, you should see Cloudify's Web UI.
At this point there's nothing much to see since you haven't uploaded any blueprints yet.

When the command is done executing, you'll have an operational Cloudify manager on the desired provider. You may verify this by making a *status* call.

Note that if you're using the commercial version, the Web UI should appear as a running service in the output. If you are using the standard version, the Cloudify UI status should be "unknown".

An example output:

{% highlight sh %}
$ cfy status
Getting management services status... [ip=1.2.3.4]

Services:
+---------------------------------+---------+
|            service              |  status |
+---------------------------------+---------+
| RabbitMQ                        | running |
| Cloudify Manager                | running |
| Elasticsearch                   | running |
| Riemann                         | running |
| Syslog                          | running |
| Celery Management               | running |
| Cloudify UI                     | running |
| Webserver                       | running |
| Logstash                        | running |
| SSH                             | running |
+---------------------------------+---------+

{%endhighlight%}


# What's Next

Next, you should either [try and write your first blueprint](getting-started-write-blueprint.html), or [download an example blueprint and upload it](getting-started-upload-blueprint.html).
