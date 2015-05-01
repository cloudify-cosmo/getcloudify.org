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

Cloudify's UI allows the user to upload a packaged blueprint file to the manager. Currently, the only supported file extension is tar.gz.

The packaged blueprint file must include a folder containing the blueprint's resources along with a main blueprint YAML file (defaults to `blueprint.yaml`).

Once the user has the blueprint folder ready with the main blueprint inside it, the user can create a packaged blueprint file by using the command line:

{% highlight bash %}
export COPYFILE_DISABLE=true
tar czf blueprint-name.tar.gz blueprint-folder/
{% endhighlight %}

* The `export` command will prevent unwanted hidden files from being packaged inside the TAR file (i.e .DS_Store on OSX environment)
* The file and folder names are customizable.

The output file of the tar command above will be `blueprint-name.tar.gz`.