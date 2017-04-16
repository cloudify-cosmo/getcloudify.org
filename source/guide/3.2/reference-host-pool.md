---
layout: bt_wiki
title: Host pool reference
category: Reference
publish: true
abstract: reference on Host pool, it's blueprints and installation
pageord: 1200
---

{%summary%}
This page briefly describes Host pool, is a reference to it's blueprints
and installation process.
{%endsummary%}


# Host pool

The [Host pool service][host-pool-github] stores connection details, leases
and credentials for a preconfigured pool of hosts. It's RESTful API allows
to "allocate" (= lease) a host from the pool, use it for deployment
and release it to be reused in future. The service also takes care to return
only "alive" (connectable) hosts.

Briefly Host pool behaves like OpenStack Nova but uses a preallocated pool
of VMs.

There is also a dedicated project, called
[Cloudify Host pool plugin][host-pool-plugin-github], which allows using
the Host pool service in Cloudify deployments. Check the plugin's
[reference page][host-pool-plugin-reference] for more information.


# Installation

## Using a manager blueprint

Currently there are two blueprints available:

*   `simple-manager-with-host-pool` is a fork of
    the [simple manager blueprint][simple-manager-blueprint-github],
    that additionally installs the Host pool service on specified host

    and

*   `only-host-pool` which installs only the Host pool service.


### Inputs

Both the above blueprints accept the following inputs:

*   `host_pool_public_address` (*required*) - the address used by Fabric
    to perform Host pool installation, this is **not** used in the same way
    as in case of the manager,
*   `host_pool_ssh_user` (*optional*) - username used by Fabric, `ubuntu`
    by default,
*   `host_pool_ssh_key_path` (*optional*) - private key used by Fabric,
    `/home/ubuntu/.ssh/id_rsa` by default,
*   `host_pool_directory` (*optional*) - directory in which Host pool service
    will run and store its files, `/home/ubuntu/host_pool` by default.

Inputs required by the Cloudify manager have not been listed here. Check
the [manager blueprint's reference][simple-manager-blueprint-reference]
for their descriptions.


### Topology

The Host pool's setup consists of a host node, on which the Host pool service
is installed.  The service does not depend on the manager, so they can be
installed both on separate and also on the same host.


### Nodes

*   `host_pool_host` - a node representing the host, on which Host pool service
    will be installed.
*   `host_pool_server` - a node representing the Host pool service instance.

Nodes defining the Cloudify manager have not been listed here. Check
the [manager blueprint's reference page][simple-manager-blueprint-reference]
for their descriptions.


## Manually

It is safe to test or develop Host pool **without** running
it on a virtual machine.

### Prerequisites

*   Python C headers

{% highlight bash %}
sudo apt-get install python-dev
{% endhighlight %}

*   `pip`

{% highlight bash %}
sudo apt-get install python-pip
sudo -H pip install -U pip
{% endhighlight %}

*   `virtualenv`

{% highlight bash %}
sudo -H pip install virtualenv
{% endhighlight %}


### Installation and execution

*   Download Host pool's sources (by cloning
    it's [repository][host-pool-github], downloading and unpacking
    a [zip package][host-pool-zip-package] or any other means).

*   Create a virtualenv and activate it

{% highlight bash %}
virtualenv /path/to/virtualenv/directory
. /path/to/virtualenv/directory/bin/activate
{% endhighlight %}

*   Install Host pool

{% highlight bash %}
pip install /path/to/host/pool/directory
{% endhighlight %}

*   Install gunicorn (if it is desired)

{% highlight bash %}
pip install gunicorn
{% endhighlight %}

*   Prepare a configuration file for Host pool. An example can be found
    [here][host-pool-sample-config].

*   Run the service with gunicorn (recommended):

{% highlight bash %}
HOST_POOL_SERVICE_CONFIG_PATH=/path/to/host/pool/configuration/file \
    gunicorn cloudify_hostpool.rest.service:app
{% endhighlight %}

{% tip title=Tip %}
Run:
{% highlight bash %}
gunicorn --help
{% endhighlight %}
to see all available gunicorn parameters.
{% endtip %}

*   or run it directly with Flask (development only):

{% highlight bash %}
HOST_POOL_SERVICE_CONFIG_PATH=/path/to/host/pool/configuration/file \
    python cloudify_hostpool/rest/service.py
{% endhighlight %}

*   Check if everything has booted correctly:

{% highlight bash %}
curl -XGET http://127.0.0.1:<port>/hosts
{% endhighlight %}

The above call should return an empty JSON list.

If not modified explicitly the default port is:

*   8000, if running with gunicorn,
*   5000, if running with Flask.


[simple-manager-blueprint-github]:  https://github.com/cloudify-cosmo/cloudify-manager-blueprints/tree/master/simple    "Simple manager blueprint's source on GitHub"
[simple-manager-blueprint-reference]:   reference-simple-manager.html   "Simple manager's blueprint reference page"
[host-pool-github]: https://github.com/cloudify-cosmo/cloudify-host-pool-service    "Host pool's GitHub repository"
[host-pool-zip-package]:    https://github.com/cloudify-cosmo/cloudify-host-pool-service/archive/master.zip "Host pool's source zip package"
[host-pool-sample-config]:  https://github.com/cloudify-cosmo/cloudify-host-pool-service/blob/master/host-pool-service-blueprints/resources/host-pool.yaml "Host pool's sample configuration file"
[host-pool-plugin-github]:  https://github.com/cloudify-cosmo/cloudify-host-pool-plugin "Cloudify Host pool plugin's GitHub repository"
[host-pool-plugin-reference]:  plugin-hostpool.html "Cloudify Host pool plugin's reference page"
