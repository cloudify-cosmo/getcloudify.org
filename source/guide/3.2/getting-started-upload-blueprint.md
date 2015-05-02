---
layout: bt_wiki
title: Uploading a Blueprint
category: Getting Started
publish: true
abstract: How to upload a blueprint to Cloudify's Management Environment
pageord: 300
---
{%summary%} {{page.abstract}}{%endsummary%}

# Uploading a Blueprint

## CLI

To upload a blueprint using Cloudify's CLI execute:

{%highlight bash%}
cfy blueprints upload -b <BLUEPRINT_NAME> -p </path/to/your/blueprint.yaml​>
{%endhighlight%}


## UI

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