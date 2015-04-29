---
layout: bt_wiki
title: Uploading a Blueprint
category: User Interface
publish: true
abstract: Blueprint packing & uploading guide
pageord: 100

terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}


# Packaging a Blueprint

Cloudify's UI allows the user to upload a packaged blueprint file to the manager.

The packaged blueprint file must include a folder containing the blueprint's resources along with a main blueprint YAML file (defaults to `blueprint.yaml`).

Once the user has the blueprint folder ready with the main blueprint inside it, the user can create a blueprint TAR file by using the command line:

{% highlight bash %}
export COPYFILE_DISABLE=true
tar czf blueprint-name.tar.gz blueprint-folder/
{% endhighlight %}

* The `export` command will prevent unwanted hidden files from being packaged inside the TAR file (i.e .DS_Store on OSX environment)
* The file and folder names are customizable.

The output file of the tar command above will be `blueprint-name.tar.gz`.

Supported file extension are:

* tar
* tar.gz
* archive

# Uploading a Blueprint

Cloudify's UI allows the user to upload a packaged blueprint TAR file to the Cloudify Manager.
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