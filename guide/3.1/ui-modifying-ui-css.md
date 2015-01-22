---
layout: bt_wiki
title: Modifying the UI CSS
category: User Interface
publish: true
abstract: Modifying the UI CSS
pageord: 100

terminology_link: reference-terminology.html
---
{%summary%} {{page.abstract}}{%endsummary%}

# Modifying the UI CSS
This guide will explain how to unpack and modify the CSS for Cloudify's UI prior to bootstrapping.

## Unpack and modify
Please follow the instruction below:

1. Download the UI package you want to install (a deb file).

2. Extract the deb file using the command:<br>
{%highlight bash%}
ar vx cloudify-ui_3.1.0-ga-b85_amd64.deb
{%endhighlight%}

3. Extract the tar file "data.tar.gz" to folder "data":<br>
{%highlight bash%}
mkdir data && tar -xzvf data.tar.gz -C data
{%endhighlight%}

4. Extract the UI's tar file:<br>
{%highlight bash%}
mkdir cosmo-ui && tar -xzvf data/packages/cloudify-ui/cosmo-ui-3.X.X.tgz -C cosmo-ui
{%endhighlight%}

5. Append the CSS rules to `cosmo-ui/package/styles/*.main.css` (the * part is changing on every build).

## Save your changes
To repack everything, please follow the instructions below:

1. Pack the UI's tar:<br>
{%highlight bash%}
tar -czvf  data/packages/cloudify-ui/cosmo-ui-3.1.0.tgz cosmo-ui/* && rm -rf cosmo-ui
{%endhighlight%}

2. Compress the data folder:<br>
{%highlight bash%}
tar -czvf data/* data.tar.gz && rm -rf data
{%endhighlight%}

3. Repack the deb file:<br>
{%highlight bash%}
ar r my-cosmo-ui.deb debian-binary control.tar.gz data.tar.gz && rm -rf control.tar.gz && rm -rf data.tar.gz &&rm -rf debian binary
{%endhighlight%}
