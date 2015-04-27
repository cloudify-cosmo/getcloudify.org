---
layout: bt_wiki
title: Installing the Cloudify CLI
category: Installation
publish: true
abstract: Installation instructions for Cloudify CLI under multiple platforms
pageord: 200

windows_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify-windows-cli_3.1.0-ga-b85.exe
linux32_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify-linux32-cli_3.1.0-ga-b85_i386.deb
linux64_link: http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.1.0/ga-RELEASE/cloudify-linux64-cli_3.1.0-ga-b85_amd64.deb
venv_link: http://virtualenv.readthedocs.org/en/latest/
installation_bootstrapping_link: installation-bootstrapping.html
---
{%summary%}{{page.abstract}}{%endsummary%}


{%note title=Known Issue (!)%}
If you have already installed a previous version of the CLI,
Make sure to delete any *.cloudify* folders inside the destination directory you are about to install into (or any of its parent directories).
{%endnote%}

Cloudify's CLI (AKA cfy) is being distributed in two different methods:

### As downloadable packages

The downloadable packages allow for an offline installation of the cli and are distributed as rpm, deb and tar.gz packages for Linux.

For Windows, there's currently a limited distributable. Read below for Windows support.

For OS X, an online installation script is available. Read below for OS X support.


###  As a downloadable installation script

The downloadable `get-cloudify.py` script allows you to install the cli from the internet with many different configuration options.
The script can install the cli on different distributions of Linux, OSx (Darwin) and Windows.


# Installing using premade packages

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

## Linux

* To install via deb/rpm/tar.gz packages, you must have Python2.7.x and pip 1.5+ installed and Python2.7.x must be executable as `python` from the path.
* Using the tar.gz package allows you to specify another `python` executable path as you're actually running the `get-cloudify.py` script which provides this feature.


### Ubuntu/Debian

1. Download the deb package from the [Downloads page](downloads/get_cloudify_3x.html).
1. Open a Terminal at the directory where you downloaded the file.
1. Run (replacing `<pkg.deb>` with the name of file you downloaded):
{% highlight bash %}
sudo dpkg -i <pkg.deb>
source /cfy/env/bin/activate
{% endhighlight %}

Now try running `cfy -h` in your Terminal. You should get an output describing how to use `cfy`.

### Centos/RHEL

1. Download the rpm package from the [Downloads page](downloads/get_cloudify_3x.html).
1. Open a Terminal at the directory where you downloaded the file.
1. Run (replacing `<pkg.rpm>` with the name of file you downloaded):
{% highlight bash %}
sudo rpm -i <pkg.rpm>
source /cfy/env/bin/activate
{% endhighlight %}

Now try running `cfy -h` in your Terminal. You should get an output describing how to use `cfy`.

### Installing using the tar.gz package

1. Download the tar.gz package from the [Downloads page](downloads/get_cloudify_3x.html).
1. Open a Terminal at the directory where you downloaded the file.
1. Run
{% highlight bash %}
tar -xzvf <pkg.tar.gz>  # replacing `<pkg.tar.gz>` with the name of the file you downloaded.
cd cfy
python get-cloudify.py
source /cfy/env/bin/activate
{% endhighlight %}

Now try running `cfy -h` in your Terminal. You should get an output describing how to use `cfy`.

For more info on the installation script, see [here](#installing-using-the-script).


## OS X

Currently, to install Cloudify on OS X, you must use the `get-cloudify.py` [script](#installing-using-the-script).
In following versions, we'll be supplying a package compiled for OS X.


# Installing using the script

A script is supplied for you to install Cloudify on different OS distributions.

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
* PyCrypto - for Windows as it's not automatically compiled when installin Cloudify's CLI.
{%endwarning%}


## Installing the latest Stable Release using the default flags

1. Download the [script](PROVIDE_LINK_HERE!)
1. Run
{% highlight bash %}
python get-cloudify.py
{% endhighlight %}

{%note title=Installing within a virtualenv%}
If you're already within a virtualenv when running the script and have not supplied the --virtualenv flag, the script will install Cloudify within the currently active virtualenv.
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


# Installing from PyPi

Cloudify's CLI is also distributed to PyPI. You can install Cloudify from PyPI though we recommend using the script as installing from PyPI does not handle prerequisites and does not provide some other comforts the script is designed to provide.

You must have Python 2.7.x and PIP installed and configured on your system.

{%tip title=Using virtualenv%}
It's recommended to create a [virtualenv]({{ page.venv_link }}) and install the CLI in it. To do so type the following commands (replace virtual-env-name with the name of your choice, e.g. cloudify:

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

## Installing a specific Milestone Release
Now let's say you want to install the 3.1rc2 release specifically. You should run:

{% highlight bash %}
pip install cloudify==3.1rc2
{% endhighlight %}


## installing from Github
To install the CLI from Github you must install several modules in the correct order.

Let's say you want to install from the `master` branch. run:

{% highlight bash %}
pip install https://github.com/cloudify-cosmo/cloudify-dsl-parser/archive/master.zip
pip install https://github.com/cloudify-cosmo/cloudify-rest-client/archive/master.zip
pip install https://github.com/cloudify-cosmo/cloudify-plugins-common/archive/master.zip
pip install https://github.com/cloudify-cosmo/cloudify-script-plugin/archive/master.zip
pip install https://github.com/cloudify-cosmo/cloudify-cli/archive/master.zip
{% endhighlight %}

## Prerequisites for Compilation when installing from PyPI
Cloudify's CLI has dependencies that require compilation on your machine:

### Windows
For Windows it's suggested to use [Unofficial Windows Binaries for Python](http://www.lfd.uci.edu/~gohlke/pythonlibs)
and install the following packages:

1. PyCrypto
2. PyYaml

### Linux

* Under Ubuntu/Debian, you'll need to install the `python-dev` package.
* Under CentOS/RHEL, you'll need to install the `python-devel` package.

### OS X
You will need Apple's developers tools that are installed with Xcode.

{% tip title=Tip%}
By default, cloudify will place the CLI log file under this path: '{tmp_folder}/cloudify-{username}/cloudify-cli.log'
You can change this by editing the 'config.yaml' file found at '{cli_installation_folder}/.cloudify'
{% endtip %}


# What's Next
* Now that you know the requirements and have the CLI installed, you can [bootstrap your own manager]({{ page.installation_bootstrapping_link }})

