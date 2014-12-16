---
layout: bt_wiki
title: Proxy Guide
category: Guides
publish: true
abstract: Configuring Cloudify's Management Environment to work behind a proxy
pageord: 800

---
{%summary%} {{page.abstract}}{%endsummary%}

# Overview

This guide will quickly explain how to bootstrap and install a simple blueprint using proxy machine in Openstack.

All http requests from the manager and the agents will pass through the proxy machine.

{%note title=Note%}
This setup may not work with https proxy because of known issues with Neutron client which doesn't support https proxy.
{%endnote%}

# Step By Step Tutorial

## Setup the (Apache) proxy machine

### Step 1 - Launch the instance

Launch an Ubuntu instance in Openstack on a particular network (should be connected to the external network somehow) and attach a floating ip to it.

### Step 2 - Install Apache

{% highlight bash %}
sudo apt-get install apache2
sudo apt-get install libapache2-mod-proxy-html
sudo apt-get install libxml2-dev
{%endhighlight%}

### Step 3 - Enable Apache mods

{% highlight bash %}
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_ajp
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod headers
sudo a2enmod proxy_connect
sudo a2enmod proxy_html
sudo a2enmod ssl
{%endhighlight%}


### Step 4 - Configure the Proxy

Add to `/etc/apache2/mods-available/proxy.conf`:

    AllowCONNECT 443 563 21 22 35357 9696 <PORT1> <PORT2> <PORT3> ...
    ProxyRequests On
    ProxyVia On
    SSLProxyEngine On

Uncomment the `<Proxy *>` element as this example:

    <Proxy *>
        AddDefaultCharset off
        Order allow,deny
        Allow from all
        #Allow from .example.com
    </Proxy>

### Step 5 - Restart Apache

{% highlight bash %}
sudo service apache2 restart
{%endhighlight%}

## Setup the Management Machine

### Step 1 - Launch the instance

Launch an instance in Openstack, connect it to the same network as the proxy machine and attach a floating ip.

### Step 2 - Configure Environment Variables

in `/etc/environment`, add the following:

    http_proxy="http://<PROXY_IP>:<PROXY_PORT>/"
    https_proxy="http://<PROXY_IP>:<PROXY_PORT>/"
    ftp_proxy="http://<PROXY_IP>:<PROXY_PORT>/"
    no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com"
    HTTP_PROXY="http://<PROXY_IP>:<PROXY_PORT>/"
    HTTPS_PROXY="http://<PROXY_IP>:<PROXY_PORT>/"
    FTP_PROXY="http://<PROXY_IP>:<PROXY_PORT>/"
    NO_PROXY="localhost,127.0.0.1,localaddress,.localdomain.com"

Finally, reboot to make sure the changes take effect and then remove the ~/.ssh content.

### Step 3 - Create an image

Create an image of the instance. The image will be used to bootstrap manager in the following steps.

### Step 4 - Bootstrap Cloudify

Follow the traditional steps to bootstrap Cloudify on Openstack using the image you created.

### Step 5 - Modify your blueprint and upload it

Create a simple blueprint as the attached blueprint in [here](https://cloudifysource.atlassian.net/browse/CFY-1220).

Then, modify the example blueprint to fit the proxy machine's IP address.

Finally, Upload the blueprint, create a deployment, and execute it.

{%note title=Note%}
You can prevent direct connectivity to the internet from the management machine by applying Security Group rules and by checking the proxy machine for traffic using:

{% highlight bash %}
netstat -t -u -c
{%endhighlight%}

or

{% highlight bash %}
tail /var/log/apache2/access.log -f
{%endhighlight%}
{%endnote%}