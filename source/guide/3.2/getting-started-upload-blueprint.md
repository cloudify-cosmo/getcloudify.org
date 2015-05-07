---
layout: bt_wiki
title: Uploading a Blueprint
category: Getting Started
publish: true
abstract: How to upload a blueprint to Cloudify's Management Environment
pageord: 300
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

For Cloudify to be able to deploy your application's blueprint, you need to upload the blueprint to Cloudify's Management Environment where it, and its resources will be available for deployment. You can upload a blueprint via the CLI or the Web UI.

If you haven't already written a blueprint, you can either [write one now](getting-started-write-bluerpint.html) or you can download an [example blueprint](https://github.com/cloudify-cosmo/cloudify-nodecellar-example) for you to upload.

# Uploading via the CLI

To upload a blueprint using Cloudify's CLI execute:

{%highlight bash%}
cfy blueprints upload -b <BLUEPRINT_NAME> -p </path/to/your/blueprint.yaml​>
{%endhighlight%}


# Uploading via the Web UI

The upload blueprint button can be found in the "Blueprints" section in the UI:

![The blueprint upload button](/guide/images/ui/ui_upload_blueprint_button.png)

Clicking on it will cause the blueprint upload dialog to appear.

The user can either type in the path to the blueprint file, or select it from the filesystem by pressing the `+` button:

![The blueprint upload dialog](/guide/images/ui/ui-upload-blueprint.png)

The `Blueprint ID` field is required.

The `Blueprint filename` field is optional. If left blank, the default `blueprint.yaml` file will be used. To override, The user should fill out the name of the YAML file to be used.

Once all the required fields are filled, the `Save` button becomes available.

![The user can enter a custom blueprint name](/guide/images/ui/ui-upload-blueprint-with-input.png)

Clicking the `Save` button will cause it to be grayed out until the blueprint file is fully uploaded to Cloudify. After the upload is done, the user will be redirected to the blueprint's page.

# Upload the blueprint

In case you've already [written a blueprint](getting-started-write-blueprint.html), you can upload it now; otherwise, We'll now upload a sample [blueprint]({{page.terminology_link}}#blueprint) and create a [deployment]({{page.terminology_link}}#deployment) based on it.

  {% highlight bash %}
  cd ~/cloudify-manager
  git clone https://github.com/cloudify-cosmo/cloudify-nodecellar-example.git
  cd cloudify-nodecellar-example
  use -t <YOUR MANAGER IP ADDRESS>
  {% endhighlight %}

  In the `cloudify-nodecellar-example` directory you just cloned, you can see blueprint files alongside other resources related to this blueprint.

  To upload the blueprint run:

  {% inittab %}

  {% tabcontent OpenStack%}
  {%highlight bash%}
  cfy blueprints upload -b nodecellar -p openstack-blueprint.yaml
  {%endhighlight%}
  {% endtabcontent %}

  {% tabcontent SoftLayer%}
  {%highlight bash%}
  cfy blueprints upload -b nodecellar -p softlayer-blueprint.yaml
  {%endhighlight%}
  {% endtabcontent %}

  {% tabcontent AWS EC2%}
  {%highlight bash%}
  cfy blueprints upload -b nodecellar -p aws-ec2-blueprint.yaml
  {%endhighlight%}
  {% endtabcontent %}

  {% tabcontent vCloud %}
  {%highlight bash%}
  cfy blueprints upload -b nodecellar -p vcloud-blueprint.yaml
  {%endhighlight%}
  {% endtabcontent %}

  {% endinittab %}

  The `-b` flag assigns a unique name to this blueprint on the Cloudify manager.
  Before creating a deployment though, let's see what this blueprint looks like.

  Point your browser at the manager's URL again and refresh the screen, you will see the nodecellar blueprint listed there.

  ![Blueprints table](/guide/images3/guide/quickstart/blueprints_table.png)

  Click the blueprint, and you can see its topology.

  A [topology]({{page.terminology_link}}#topology) consists of elements called [nodes]({{page.terminology_link}}#node).

  In our case, we have the following nodes:

  * Two VM's (one for mongo and one for nodejs)
  * A nodejs server
  * A MongoDB database
  * A nodejs application called nodecellar (which is a nice sample nodejs application backed by mongodb).

  ![Nodecellar Blueprint](/guide/images3/guide/quickstart-openstack/nodecellar_openstack_topology.png)


  {% togglecloak id=2 %}
  **Define inputs for this blueprint**
  {% endtogglecloak %}

  {% gcloak 2 %}

  {% inittab %}

  {% tabcontent OpenStack%}

  {%highlight yaml%}
  inputs:

    image:
      description: >
        Image to be used when launching agent VM's
    flavor:
      description: >
        Flavor of the agent VM's
    agent_user:
      description: >
        User for connecting to agent VM's
  {%endhighlight%}

  Let's make a copy of the inputs template already provided and edit it:

  {% highlight bash %}
  cd cloudify-nodecellar-example/inputs/openstack.yaml.template
  cp openstack.yaml.template inputs.yaml
  {% endhighlight %}
  The inputs.yaml file should look somewhat like this:
  {%highlight yaml%}
  image: 8c096c29-a666-4b82-99c4-c77dc70cfb40
  flavor: 102
  agent_user: ubuntu
  {%endhighlight%}

  {% endtabcontent %}

  {% tabcontent SoftLayer%}

  {% highlight yaml %}
  inputs:

    location:
      description: >
        Location of the data center
        Default value is the location id of Hong kong 2
      default: 352494
    domain:
      description: The domain
      default: nodecellar.cloudify.org
    ram:
      description: >
        Item id of the ram
        Default value is the item id of 16 GB
      default: 1017
    cpu:
      description: >
        Item id of the cpu
        Default value is the item id of 4 x 2.0 GHz Cores
      default: 859
    disk:
      description: >
        Item id of the disk
        Default value is the item id of 25 GB (SAN)
      default: 1178
    os:
      description: >
        Item id of the operating system
        Default value is the item id of Ubuntu Linux 12.04
      default: 4174
  {%endhighlight%}

  All inputs have default values so no input file is needed.

  To specify differnet values for one or more inputs, create inputs.yaml file with the wanted inputs, for example:
  {% highlight bash %}
  echo -e "domain: 'my_domain.org'\nlocation: '168642'" > inputs.yaml
  {% endhighlight %}
  The inputs.yaml file will look like this:
  {% highlight yaml %}
  domain: 'my_domain.org'
  location: '168642'
  {% endhighlight %}

  {% endtabcontent %}

  {% tabcontent AWS EC2%}

  {%highlight yaml%}
  inputs:

    image:
      description: >
        Image to be used when launching agent VM's
    flavor:
      description: >
        Flavor of the agent VM's
    agent_user:
      description: >
        User for connecting to agent VM's
  {%endhighlight%}

  Let's make a copy of the inputs template already provided and edit it:

  {% highlight bash %}
  cd cloudify-nodecellar-example/inputs
  cp aws-ec2.yaml.template inputs.yaml
  {% endhighlight %}
  The inputs.yaml file should look somewhat like this:
  {%highlight yaml%}
    image: ''
    size: ''
    agent_user: ''
  {%endhighlight%}

  The image is again the AMI image ID. The size is the instance_type, and the agent user is the default user agent on the image type.

  {% endtabcontent %}

  {% tabcontent vCloud %}

  {%highlight yaml%}
  inputs:

    vcloud_username:
        type: string

    vcloud_password:
        type: string

    vcloud_url:
        type: string

    vcloud_service:
        type: string

    vcloud_vcd:
        type: string

    catalog:
      type: string

    template:
      type: string

    agent_user:
      type: string
      default: ubuntu

    management_network_name:
      type: string

    floating_ip_gateway:
      type: string

    nodecellar_public_ip:
      type: string

  {%endhighlight%}

  Let's make a copy of the inputs template already provided and edit it:

  {% highlight bash %}
  cd cloudify-nodecellar-example/inputs
  cp vcloud.yaml.template inputs.yaml
  {% endhighlight %}
  The inputs.yaml file should look somewhat like this:
  {%highlight yaml%}
  {
      "vcloud_username": "your_vcloud_username",
      "vcloud_password": "your_vcloud_password",
      "vcloud_url": "https://vchs.vmware.com",
      "vcloud_service": "service_name",
      "vcloud_vdc": "virtual_datacenter_name",
      "manager_server_name": "your_manager",
      "manager_server_catalog": "templates_catalog",
      "manager_server_template": "template",
      "edge_gateway": "gateway_name",
      "floating_ip_public_ip": "",
      "management_network_name": "management",
      "manager_private_key_path": "~/.ssh/vcloud_template.pem",
      "agent_private_key_path": "~/.ssh/vcloud_template.pem"
  }
  {%endhighlight%}

  {% endtabcontent %}

  {% endinittab %}

  {% endgcloak %}


# What's Next

You should now have a Blueprint ready for you to [deploy](getting-started-create-deployment.html)