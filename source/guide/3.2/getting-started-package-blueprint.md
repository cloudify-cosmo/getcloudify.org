---
layout: bt_wiki
title: Packaging a Blueprint
category: Getting Started
publish: true
abstract: How to package a Cloudify Blueprint and its resources
pageord: 200
---
{%summary%} {{page.abstract}}{%endsummary%}


# Packaging a Blueprint

There are 2 methods for uploading a blueprint:

* Provide the directory in which the blueprint YAML file resides - which will create a tar.gz from the parent folder and upload it.
* Create a package manually prior to uploading it (steps described below).


When creating a package, the blueprint's archive must include a folder containing the blueprint's resources along with a main blueprint YAML file (defaults to `blueprint.yaml`).

Once the user has the blueprint folder ready with the main blueprint inside it, the user can create a blueprint archive by using the command line:

{% highlight bash %}
export COPYFILE_DISABLE=true
tar czf blueprint-name.tar.gz blueprint-folder/
{% endhighlight %}

* The `export` command will prevent unwanted hidden files from being packaged inside the archive (i.e .DS_Store on OSX environment)
* The file and folder names are customizable.

The output file of the tar command above will be `blueprint-name.tar.gz`.

## CLI Archive Formats Support

Currently uploading a blueprint via the CLI supports the following blueprint archive formats:

* tar
* tar.gz
* zip
* tar.bz

## UI Archive Formats Support

Currently, the only supported file extension is tar.gz.
