---
layout: bt_wiki
title: Creating a Deployment
category: Getting Started
publish: true
abstract: Creating a deployment from an uploaded blueprint
pageord: 400

terminology_deployment: http://getcloudify.org/guide/3.1/reference-terminology.html#deployment
terminology_workflow: http://getcloudify.org/guide/3.1/reference-terminology.html#workflow
blueprint_upload: http://getcloudify.org/guide/3.1/ui-blueprint-upload.html
terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

For Cloudify to be able to deploy your application it parses the uploaded blueprint YAML (the logical representation) and manifests a structure we call a Deployment. A deployment is a "Technical" drilled down representation of your application. For instance, if a blueprint describes a Server node with multiple instances, the deployment will be comprised of only the instances themselves provided with their unique identifiers. A deployment's structure is not exposed to the user.


# Creating a Deployment

## CLI

To create a deployment using Cloudify's CLI execute:

{%highlight bash%}
cfy deployments create -b <BLUEPRINT_NAME> -d <DEPLOYMENT_NAME> --inputs </path/to/your/inputs.yaml​>
{%endhighlight%}


## UI

This guide will explain how to create new [deployment]({{page.terminology_deployment}}) using the user interface.<br/>

To Create a new [deployment]({{page.terminology_deployment}}), go to the blueprints screen, choose a blueprint (see [Upload Blueprint]({{page.blueprint_upload}})) and click on the button `Create Deployment`:<br/>
![Create deployment button](/guide/images/ui/ui-create-deployment.jpg)

A create deployment dialog will open.<br/>

Next, please fill out the deployment name and insert raw input params (optional), then click on `create` button:<br/>
![Create deployment box](/guide/images/ui/ui-create-deployment-box.jpg)

After creating the deployment, you will be directed to the deployment's page to follow the initialization stage:<br/>
![Deployment initialize](/guide/images/ui/ui-initialize-deployment.jpg)

Once the initialization is complete, you will be able to start using the deployment and execute [workflows]({{page.terminology_workflow}}):<br/>
![Deployment ready to use](/guide/images/ui/ui-deployment-ready.jpg)