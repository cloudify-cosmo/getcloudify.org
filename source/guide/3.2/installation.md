---
layout: bt_wiki
title: Installation
category: none
publish: true
abstract: Installation instructions for Cloudify CLI under multiple platforms
pageord: 300

windows_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify-windows-cli_3.1.0-ga-b85.exe
linux32_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify-linux32-cli_3.1.0-ga-b85_i386.deb
linux64_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify-linux64-cli_3.1.0-ga-b85_amd64.deb
venv_link: http://virtualenv.readthedocs.org/en/latest/
installation_bootstrapping_link: installation-bootstrapping.html
---
{%summary%}{{page.abstract}}{%endsummary%}


{%note title=Reinstallation (!)%}
If you have already installed a previous version of the CLI, make sure to delete any *.cloudify* folders inside the current working directory (or any of its parent directories).
{%endnote%}

Cloudify CLI (AKA cfy) is distributed in three different methods:

1. As a binary package
1. As a Python module (via PyPi)
1. As original source code

{% tip title=Which distribution method should you choose? %}
The Binary package provides commercial features such as commercial plugins and manager blueprints. If you wish to only use the Open Source version of Cloudify, you should install from PyPI.
{% endtip %}

# Installing the binary package

## Windows

1. Download the [Setup file]({{ page.windows_link }})
1. Run the setup file by double clicking on it.
1. Click 'Next'
1. Choose the path you would like the CLI to be installed at and click 'Next'.
Default path is `C:\Program Files (x86)\cfy`
1. To use the CLI you need the folder to be in your PATH environment variable. If
you leave the checkbox checked, the installer will modify the PATH environment
variable for you. Click 'Next' again.
1. Click 'Install' to proceed with file extraction.
1. After a few seconds, installation should be finished, and you can click 'Finish'.
1. Open a new Command Prompt and check if you can run `cfy -h`. You should get
an output describing how to use `cfy`.

## Ubuntu

1. Download a deb package that matches your system:
[32bit]({{ page.linux32_link }}) or
[64bit]({{ page.linux64_link }})
1. Open a terminal at the directory where you downloaded the file and run
`sudo dpkg -i <pkg.deb>` replacing `<pkg.deb>` with the name of file you downloaded.
1. After a few seconds installation should finish.
1. Try running `cfy -h` command in your Terminal. You should get an output
describing how to use `cfy`.

## OS X

Coming soon, please follow the Python package installation below ([Installing from PyPi](#installing-from-pypi)).

{%note title=Bootstraping with binary package%}
When using the binary package, there is no need to install blueprint dependencies since binary package already contains these.
{%endnote%}

# Installing Cloudify's CLI from PyPi

You must have Python 2.7.x and PIP installed and configured on your system.

{%tip title=Using virtualenv%}
It's recommended to create a [virtualenv]({{ page.venv_link }}) and install the CLI in it.

To do so type the following commands (replace virtual-env-name with the name of your choice, e.g. cloudify:

{% highlight bash %}
virtualenv virtual-env-name
source virtual-env-name/bin/activate
{% endhighlight %}

{%endtip%}

## Installing the latest Stable Release

To install the CLI run the following command:

{% highlight bash %}
pip install cloudify
{% endhighlight %}

## Installing the latest Milestone Release
The following commands will install the latest Cloudify milestone:

{% highlight bash %}
pip install cloudify --pre
{% endhighlight %}

## installing a specific Milestone Release
Now let's say you want to install the 3.1rc2 release specifically. You should run:

{% highlight bash %}
pip install cloudify==3.1rc2
{% endhighlight %}

## installing from source

You can also install from source using pip.

Let's say you want to install from the `master` branch. run:

{% highlight bash %}
pip install -r https://raw.githubusercontent.com/cloudify-cosmo/cloudify-cli/master/dev-requirements.txt
pip install https://github.com/cloudify-cosmo/cloudify-cli/archive/master.zip
{% endhighlight %}

## Prerequisites for Compilation when installing from Pypi
Cloudify CLI has dependencies that require compilation on your machine:

### Windows
For Windows it's suggested to use [Unofficial Windows Binaries for Python](http://www.lfd.uci.edu/~gohlke/pythonlibs)
and install the following packages:

1. PyCrypto
2. PyYaml

### Linux
Under Ubuntu, you'll need to install the `python-dev` package.

### OS X
You will need Apple's developers tools that are installed with Xcode.

{% tip title=Tip%}
By default, cloudify will place the CLI log file under this path: '{tmp_folder}/cloudify-{username}/cloudify-cli.log'
You can change this by editing the 'config.yaml' file found at '{cli_installation_folder}/.cloudify'
{% endtip %}


# What's Next
* Now that you know the requirements and have the CLI installed, you can [bootstrap your own manager]({{ page.installation_bootstrapping_link }})

