---
layout: bt_wiki
title: Salt plugin
category: Plugins
publish: true
abstract: "Salt plugin description"
pageord: 215

repo_link: https://github.com/cloudify-cosmo/cloudify-saltstack-plugin
---
{% summary %}
{% endsummary %}


A plugin that adds a [*salt*][salt] layer to a Cloudify agent.

*Salt* is a software infrastucture used for **computer orchestration**,
**remote execution**, **configuration management**, etc.

This plugin can be found at [{{page.repo_link}}][plugin github].

The plugin is currently **under development**.


# What it does

1.  Installs a *salt minion* on specified host.
2.  Configures the minion with provided parameters; most importantly - to work
    with a specific *master*.
3.  Ensures the minion's key is accepted by the master.
4.  Starts the minion service.
5.  Configures minion's [*grains*][grains].
6.  Executes [*highstate*][highstate] on the minion.

{% note title=Note %}
This is a one-time operation. Further management of minion state is left
to the master.
{% endnote %}


# Basic how-to

1.  Import the plugin in blueprint.

2.  Add a node of `saltification` type.

3.  In *properties*:
    *   in `minion_config` section add address to the *salt-master* as `master`
        parameter,
    *   add URL to *salt API*, as `salt_api_url` parameter,
    *   add authorisation data, as `salt_api_auth_data` dictionary parameter,

    for example:

{% highlight yaml %}
properties:
    minion_config:
        master: 127.0.0.1
    salt_api_url: http(s)://url/to/api/here
    salt_api_auth_data:
        eauth: configuration here
{% endhighlight %}


## Minimum working example

The following is a basic working example:

{% highlight yaml %}
tosca_definitions_version: cloudify_dsl_1_0
imports:
    - http://www.getcloudify.org/spec/cloudify/3.1rc1/types.yaml
    - http://127.0.0.1:8001/plugin.yaml
node_templates:
    my_host:
        type: cloudify.nodes.Compute
        properties:
            ip: 127.0.0.1
            cloudify_agent:
                user: cloudify_user
                key: /home/cloudify_user/.ssh/id_rsa
    my_salted_host:
        type: saltification
        properties:
            minion_config:
                master: 127.0.0.1
            salt_api_url: http://127.0.0.1:8000
            salt_api_auth_data:
                eauth: pam
                username: cloudify_user
                password: my secret password
        relationships:
            -   type: cloudify.relationships.contained_in
                target: my host
{% endhighlight %}


## Assumptions for the above example

*   Both `plugin.yaml` and `plugin.zip` are served on `localhost:8001`.
*   Salt master is up and running on `localhost`.
*   Salt API is available on `localhost:8000`.
*   Salt API is configured to work **without _SSL_**.
*   User `cloudify_user` exists and can be accessed with
    `my secret password`.
*   User `cloudify_user` has access to wheel module and is allowed to execute
    commands on appropriate minions (check
    [Salt's external authentication documentation][salt-auth] for more
    information on *eauth* topic).

Example Salt master configuration fulfilling the above assumptions:

{% highlight yaml %}
rest_cherrypy:
    port: 8000
    disable_ssl: True
    webhook_disable_auth: True
external_auth:
    pam:
        cloudify_user:
            - 'my salted host*'
            - '@wheel'
{% endhighlight %}

Plugin easily can be served with Python's SimpleHTTPServer. Run:

{% highlight bash %}
python -m SimpleHTTPServer 8001
{% endhighlight %}

in a directory containing `plugin.yaml` and `plugin.zip`. Also edit
`plugin.yaml` so that it points to localhost.


# Properties description

Important properties:

*   `minion_config` - *optional* - a dictionary of configuration parameters.

    Minion's configuration file will be updated with parameters supplied
    in this dictionary.

*   `salt_api_url` - *required* - URL to master's REST API.

*   `salt_api_auth_data` - *required* - a dictionary containing authorisation
    data.

*   `grains` - *optional* - a list of grains for current minion.

    Format is: a list of pairs (`grain name: grain value`), for example:

{% highlight yaml %}
properties:
    grains:
        - my grain: my grain's value 1
        - my grain: my grain's value 2
        - my other grain: my grain's value
{% endhighlight %}


Other optional but useful properties:

*   `minion_id` - *optional* - current minion's identifier.

    If not supplied, a generated identifier will be used.

*   `minion_installation_script` - *optional* - path to the installation
    script.

    If not supplied a default script will be used.

*   `session_options` - *optional* - a dictionary of parameters to be injected
    into `requests.Session` objects.

    See the documentation of [*Requests*][requests-session] library
    for details.

*   `logger_injection` - *optional* - a dictionary of logger parameters
    to be injected into Cloudify logger.

    If not specified, no injection will take place.

    If specified, a logger will be injected, inheriting Cloudify logger's
    properties. Log level can be overridden with `level` property.

    By default all authorisation data will be covered in logs. To disable this
    functionality use `show_auth` property.


# Under the hood

What happens inside during the plugin's lifecycle.


## Minion installation

If provided in properties, `minion_installation_script` will be called
to do the actual installation. Otherwise there is a default (and recommended)
installation procedure that works on both Debian- and RedHat-derived systems
(it has been tested on RHEL6 and Ubuntu 14.04).

{% note title=Note 1 %}
Minion installation takes place **only if** minion package has not already been
installed.

The actual check is whether `salt-minion` executable is visible in *PATH*.
{% endnote %}

{% note title=Note 2 %}
Remember that the default installation procedure utilises `apt-get` or `yum`
which in turn require **Internet access**.
{% endnote %}

When deciding to provide a custom installation script, bear in mind that:

*   the script must **return 0** on success, nonzero values are treated
    as errors,
*   it is assumed that minion process will **not be running** after
    the installation script exits,
*   minion will be installed as a **system service**, that means - there will
    be a **_SYSV_ init script**.


## Minion configuration

Minion's configuration file will be **updated** with parameters provided in
`minion_config` property. This is the right place to put Salt master's IP
or a DNS-resolvable host.

Unless provided explicitly (in `minion_id` property) a default ID will
be generated. The plugin will use node's instance ID as minion's identifier
(for example *my_salted_host_a4fe3*).

It is assumed that minion configuration files reside in **default locations**,
that is:

*   main configuration file: `/etc/salt/minion`,
*   minion ID file: `/etc/salt/minion_id`,
*   PKI directory: `/etc/salt/pki`,
*   public/private key file names: `minion.pub` and `minion.pem`.


### Minion authorisation

After successful configuration the minion will be authorised. The process
is performed the following way:

1.  A *HTTP* session with *Salt REST API* is initiated. All operations
    regarding authorisation process are performed over this channel.
2.  The plugin checks whether the minion has already been authorised.
3.  The plugin generates a keypair that is already accepted by the master.
4.  The plugin writes the keypair to PKI directory.


## Starting the minion service

After successful configuration and authorisation the minion service is started.


### Setting up *grains*

The first set of operations after starting the minion is setting up
[*grains*][grains], if `grains` property has been defined. This process
is performed over a *HTTP* session with *Salt REST API*.


### Highstate

After setting up grains [*highstate*][highstate] is **always** executed.



[plugin github]: {{page.repo_link}} "Salt plugin on GitHub"
[salt]: http://www.saltstack.com "SaltStack"
[grains]: http://docs.saltstack.com/en/latest/topics/targeting/grains.html "Salt grains description"
[highstate]: http://docs.saltstack.com/en/latest/ref/states/highstate.html "Salt highstate description"
[salt-auth]: http://docs.saltstack.com/en/latest/topics/eauth/index.html "Salt External Authentication System"
[requests-session]: http://docs.python-requests.org/en/latest/user/advanced/#session-objects "Documentation of session objects in Requests library"
