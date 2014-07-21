---
layout: bt_wiki
title: Installing Cloudify CLI
category: Installation
publish: true
abstract: Installation instructions for Cloudify CLI under multiple platforms
pageord: 23
---
{%summary%}{{page.abstract}}{%endsummary%}

Cloudify CLI is being distributed in two different methods:

1. As binary package
1. As Python package (via PyPi)

Installation via Binary package is recommended for all users that do not have
any intent to use Cloudify CLI for development purpose.

# Installing the binary package

## Windows
1. Download [Setup file](http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_6/cloudify-cli_3.0.0-ga-b6.exe)
1. Run setup file by double clicking it
1. Click 'Next'
1. Choose the path you would like CLI to be installed at and click 'Next'.
Default path is `C:\Program Files (x86)\cfy`
1. To use CLI you need the folder to be in your PATH environment variable. If
you leave the checkbox checked, installer will modify your PATH environment
variable for you. Click 'Next' again.
1. Click 'Install' to proceed with file extraction
1. After few seconds installation should be finished, and you can click 'Finish'
1. Open new Command Prompt and check if you can run `cfy -h`. You should get
output describing how to use `cfy`

## Ubuntu
1. Download deb package that appropriate to your system:
[32bit](http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_6/cloudify-cli_3.0.0-ga-b6_i386.deb) or
[64bit](http://gigaspaces-repository-eu.s3.amazonaws.com/org/cloudify3/3.0.0/nightly_6/cloudify-cli_3.0.0-ga-b6_amd64.deb)
1. Open Terminal at the directory where you downloaded the file and run
`sudo dpkg -i <pkg.deb>` replacing `<pkg.deb>` with the name of file you downloaded.
1. After few seconds installation should finish.
1. Try running `cfy -h` command in your Terminal. You should get output
describing how to use `cfy`

## OS X
Coming soon

# Installing from PyPi
Installation via PyPi is intended for mostly developers use. We'll assume you
have Python and PIP installed and configured on your system.

To install run the following command: `pip install cloudify-cli`

## Pre-requirements for compilation
Cloudify CLI has dependency in numerous packages that are required to be compiled on your machine:

### Windows
For Windows it's suggested to use [Unofficial Windows Binaries for Python](http://www.lfd.uci.edu/~gohlke/pythonlibs)
and install the following packages:

1. PyCrypto
2. PyYaml

### Linux
Under Ubuntu, you'll need to install `python-dev` package.

### OS X
You will need Apple's developers tools that are installed with Xcode.
