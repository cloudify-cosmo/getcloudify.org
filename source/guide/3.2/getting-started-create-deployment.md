---
layout: bt_wiki
title: Creating a Deployment
category: Getting Started
publish: true
abstract: Creating a deployment from an uploaded blueprint
pageord: 400

terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

For Cloudify to be able to deploy your application it reads the uploaded blueprint YAML (the logical representation) and manifests a structure we call a Deployment. A deployment is a "Technical" drilled down representation of your application. For instance, if a blueprint describes a Server node with multiple instances, the deployment will be comprised of only the instances themselves provided with their unique identifiers.


## Creating a Deployment via the CLI

To create a deployment using Cloudify's CLI execute:

{%highlight bash%}
cfy deployments create -b <BLUEPRINT_NAME> -d <DEPLOYMENT_NAME> --inputs </path/to/your/inputs.yaml​>
{%endhighlight%}


## Creating a Deployment via the Web UI

This guide will explain how to create new [deployment]({{page.terminology_link#deployment}}) using the user interface.<br/>

To Create a new deployment, go to the blueprints screen, choose a blueprint and click on the button `Create Deployment`:<br/>
![Create deployment button](/guide/images/ui/ui-create-deployment.jpg)

A create deployment dialog will open.<br/>

Next, please fill out the deployment name and insert raw input params (optional), then click on `create` button:<br/>
![Create deployment box](/guide/images/ui/ui-create-deployment-box.jpg)

After creating the deployment, you will be directed to the deployment's page to follow the initialization stage:<br/>
![Deployment initialize](/guide/images/ui/ui-initialize-deployment.jpg)

Once the initialization is complete, you will be able to start using the deployment and execute [workflows]({{page.terminology_link#workflow}}):<br/>
![Deployment ready to use](/guide/images/ui/ui-deployment-ready.jpg)

# Step 6: Create a Deployment

We'll now create the deployment for our blueprint.

To do so, we'll first create an inputs file (just like our Manager Blueprint's inputs file):

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


Now that we have an inputs file, type the following command:

{%highlight bash%}

cfy deployments create -b nodecellar -d nodecellar --inputs inputs.yaml

{%endhighlight%}

We've now created a deployment named `nodecellar` based on a blueprint with the same name.

This deployment is not yet materialized, since we haven't issued an installation command.

If you click the "Deployments" icon in the left sidebar in the Web UI, you will see that all nodes are labeled with 0/1, which
ans they're pending creation.

![Nodecellar Deployment](/guide/images3/guide/quickstart-openstack/nodecellar_deployment.png)


# What's Next

After creating a deployment, you're now ready to [execute it!](getting-started-execute-workflow.html)