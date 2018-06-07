---
layout: bt_wiki
title: Installation
category: none
publish: true
abstract: Cloudify's CLI installation instructions on multiple platforms
pageord: 300

---
{%summary%}{{page.abstract}}{%endsummary%}

{%tip title=Tip%}
This is documentation for an older version of Cloudify. Go now to the [latest docs](https://docs.cloudify.co/latest/installation/prerequisites/).

{%note title=Known Issue (!)%}
If you have already installed a previous version of the CLI,
Make sure to delete any *.cloudify* folders inside the destination directory you are about to install into (or any of its parent directories).
{%endnote%}

Cloudify's CLI (AKA cfy) is being distributed in two different methods:

### As downloadable packages

{% tip title=Which distribution method should you choose? %} The Binary package provides commercial features such as commercial plugins and manager blueprints. If you wish to only use the Open Source version of Cloudify, you should install from PyPI.{% endtip %}

The downloadable packages allow for an offline installation of the cli and are distributed as:

* rpms for Centos 6.5 and 7 (in the future, tar.gz and deb packages will be added.)
* Executable for Windows.
* An OS X dmg will be added in the future (currently, to install on OS X, the below online installation script method is provided.)


###  As a downloadable installation script

The downloadable `get-cloudify.py` script allows for an online installation of the cli with many different configuration options.
The script can install the cli on different distributions of Linux, OSx (Darwin) and Windows.


# Installing Using Packages

## Windows

The Windows installer is a single executable which performs the following (offline) installation:

* Installs Python 2.7.x
* Installs pip
* Installs Virtualenv
* Installs cfy

{%note title=Installing Prerequisites%}
If Python is not already installed, the executable will attempt to install it. During Python's installation you will be able to choose different installation options such as installing pip, adding the python executable to the path, and so on. If you choose, for instance, to not install pip and continue with the installation, you will be notified that you must install pip and it will be installed for you. The same goes for virtualenv.

Python's installation requires a specific Microsoft Visual C++ 2008 Redistributable Package provided [here](https://www.microsoft.com/en-us/download/details.aspx?id=29). Install it if you stumble upon an error during the Python installation.
{%endnote%}

{%note title=Installation Environment%}
Note that a virtualenv will be automatically created during installation and Cloudify's CLI will be installed within it.
{%endnote%}

To install cfy on Windows:

* Download the installer from the [Downloads page](http://getcloudify.org/downloads/get_cloudify_3x.html) corresponding with the version you would like to install.

### via the installation wizard:

* Run the executable
* Follow the installation instructions.

### via the command-line (silent):

Run:

```shell
setup.exe /SILENT /VERYSILENT /SUPPRESSMSGBOXES /DIR="<destination dir> "'
```

Where <destination dir> is the path to install in. Default path is Program Files (x86).

When the installation is finished, double click the new Cloudify icon on your desktop. This will open a terminal with the virtualenv already activated.

Now try running `cfy -h` in your terminal. You should get an output describing how to use `cfy`.

{%note title=Uninstall%}
Note that uninstalling the package will not remove Python, pip and Virtualenv whether they were or were not installed during the installation process.
{%endnote%}


## Linux

To install via rpm packages, you must have Python2.7.x and pip 1.5+ installed and Python2.7.x must be executable as `python` from the path.

### Centos/RHEL

* Download the installer from the [Downloads page](http://getcloudify.org/downloads/get_cloudify_3x.html) corresponding with the version you would like to install.
* Open a terminal at the directory where you downloaded the file.
* Run (replacing `<pkg.rpm>` with the name of file you downloaded):

{% highlight bash %}
sudo rpm -i <pkg.rpm>
source /cfy/env/bin/activate
{% endhighlight %}

Now try running `cfy -h` in your terminal. You should get an output describing how to use `cfy`.

For more info on the installation script, see [here](#installing-using-the-installation-script).

{%info title=The plugins location%}
After installing the packages, the plugins can be found under `/cfy/cloudify-manager-blueprints-commercial`
{%endinfo%}

{% tip title=Tip %}
It is recommended to copy the manager blueprints to a new folder to avoid dealing with permissions in the future, e.g.
`cp -a /cfy/cloudify-manager-blueprints-commercial ~/my-manager-blueprints`
{% endtip %}

### Ubuntu/Debian

Installers for Debian based distros will be added in the future.

## OS X

Currently, to install Cloudify on OS X, you must use the `get-cloudify.py` [script](#installing-using-the-installation-script).
In following versions, we'll be supplying a package compiled for OS X.

# Installing Using the Installation Script

A script is supplied for you to install Cloudify on different OS distributions.

You can download the script from <a href="http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/get-cloudify.py" class="download" onclick="javascript: _gaq.push(['_trackEvent', 'Product Download', 'Cloudify Pip Install', 'Get-Cloudify.py Install']);" download>here</a>.

{%note title=Script's help%}
Please consider running `python get-cloudify.py -h` before installing to get familiarized with what this script provides.
{%endnote%}

{%warning title=Prerequisites Installation%}
By default, this script will not install any prerequisites. You can supply it with the `--force` flag which will install all prerequisites without prompting you for anything other than a sudoer password (if required).

The prerequisites are:

* pip - for Linux, Windows and OS X
* virtualenv - for Linux, Windows and OS X
* python-dev and gcc - for Ubuntu/Debian to be able to compile Fabric.
* python-devel and gcc - for CentOS/RHEL to be able to compile Fabric.
* gcc - for Arch-Linux to be able to compile Fabric.
* PyCrypto - for Windows as it's not automatically compiled when installing Cloudify's CLI.
{%endwarning%}

{%note title=Update Your Package Manager%}
If you are using Linux, and you choose to use either the `--force` flag or the `--installpythondev` flag, you must first update your package manager:
    sudo apt-get update
    or
    sudo yum update
{%endnote%}


## Installing the latest Stable Release using the default flags

* Download the <a href="http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/get-cloudify.py" class="download" onclick="javascript: _gaq.push(['_trackEvent', 'Product Download', 'Cloudify Pip Install', 'Get-Cloudify.py Install']);" download> script</a>
* Run
{% highlight bash %}
python get-cloudify.py
{% endhighlight %}

{%note title=Installing within a virtualenv%}
If you're already within a virtualenv when running the script and have not supplied the `--virtualenv` flag, the script will install Cloudify within the currently active virtualenv.
{%endnote%}


## Installing the latest Milestone Release

The following commands will install the latest Cloudify milestone:

{% highlight bash %}
python get-cloudify.py --pre
{% endhighlight %}

## Installing a specific Milestone Release

Now let's say you want to install the 3.2a4 release specifically. You should run:

{% highlight bash %}
python get-cloudify.py --version 3.2a4
{% endhighlight %}

# Installing From PyPI

Cloudify's CLI is also distributed to PyPI. You can install Cloudify from PyPI though we recommend using the script as installing from PyPI does not handle prerequisites and does not provide some other comforts the script is designed to provide.

You must have Python 2.7.x and pip installed and configured on your system.

{%tip title=Using virtualenv%}
It's recommended to create a [virtualenv]({{ page.venv_link }}) and install the CLI in it. To do so type the following commands (replace virtual-env-name with the name of your choice, e.g. cloudify:

{% highlight bash %}
virtualenv virtual-env-name
source virtual-env-name/bin/activate
{% endhighlight %}

{%endtip%}

## Prerequisites for Compilation when installing from PyPI
Cloudify's CLI has dependencies that require compilation on your machine:

### Windows
For Windows it's suggested to use [Unofficial Windows Binaries for Python](http://www.lfd.uci.edu/~gohlke/pythonlibs)
and install the following packages:

1. PyCrypto
2. PyYAML (by default, if no compiler is found, PyYAML's installation will fall-through to a non-compiled version.)

### Linux

* Under Ubuntu/Debian, you'll need to install the `python-dev` package.
* Under CentOS/RHEL, you'll need to install the `python-devel` package.

### OS X
You will need Apple's developers tools that are installed with Xcode.

{% tip title=Tip%}
By default, cloudify will place the CLI log file under this path: '{tmp_folder}/cloudify-{username}/cloudify-cli.log'
You can change this by editing the 'config.yaml' file found at '{cli_installation_folder}/.cloudify'
{% endtip %}

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

## Installing a specific Milestone Release
Now let's say you want to install the 3.1rc2 release specifically. You should run:

{% highlight bash %}
pip install cloudify==3.1rc2
{% endhighlight %}

# installing from Github
To install the CLI from Github you must install several modules in the correct order.

Let's say you want to install from the `master` branch. run:

{% highlight bash %}
pip install https://github.com/cloudify-cosmo/cloudify-dsl-parser/archive/master.zip
pip install https://github.com/cloudify-cosmo/cloudify-rest-client/archive/master.zip
pip install https://github.com/cloudify-cosmo/cloudify-plugins-common/archive/master.zip
pip install https://github.com/cloudify-cosmo/cloudify-script-plugin/archive/master.zip
pip install https://github.com/cloudify-cosmo/cloudify-cli/archive/master.zip
{% endhighlight %}

# What's Next?
Now that you know the requirements and have the CLI installed, you can [bootstrap your own manager](getting-started-bootstrapping.html)

