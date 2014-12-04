---
layout: bt_wiki
title: Debugging Reference
category: Reference
publish: true
abstract: "Reference on how to debug Cloudify plugins and extensions"
pageord: 400
---

{%summary%} Cloudify is very pluggable and extendible by its nature; This page explains how to debug custom plugins, workflows and other extensions or components of Cloudify. {%endsummary%}


# REST Service Logs

The REST service runs using the Flask web framework on top of the Gunicorn HTTP server, which is run as an Upstart service. Each of these layers has its own logs.


## Flask logs

The Flask logger, using which the REST service writes custom logs, additionally records each request-response pair with their relevant parameters and information.

The main log file sits at `/var/log/cloudify/cloudify-rest-service.log`.

This file will grow up to a maximum size of 100MB, after which older logs will be renamed to `cloudify-rest-service.log.1`, `cloudify-rest-service.log.2`, and so on, with new logs being written to the main log file.
After a maximum of 20 files, older files will get deleted when new logs arrive.

{% togglecloak id=1 %} Example output {% endtogglecloak %}
{% gcloak 1 %}
{% highlight yaml %}
10:35:21 [DEBUG] [manager-rest] 
Request (42314640):
        path: /deployments/dep4
        http method: PUT
        json data: {u'blueprint_id': u'bp2'}
        query string data: {}
        form data: {}
        headers: 
                Accept: */*
                Host: 15.126.253.45
                Connection: close
                X-Real-Ip: 62.90.11.161
                Content-Length: 23
                User-Agent: python-requests/2.2.1 CPython/2.7.6 Linux/3.13.0-39-generic
                Content-Type: application/json
                X-Forwarded-For: 62.90.11.161
                Accept-Encoding: gzip, deflate, compress

10:35:23 [DEBUG] [manager-rest] 
Response (42314640):
        status: 201 CREATED
        headers: 
                Content-Type: application/json
                Content-Length: 2410

10:35:23 [DEBUG] [manager-rest] 
Request (42314640):
        path: /nodes
        http method: GET
        json data: None
        query string data: {'deployment_id': [u'dep4']}
        form data: {}
        headers: 
                Host: 10.67.79.2
                Connection: close
                X-Real-Ip: 10.67.79.2
                Accept: */*
                User-Agent: python-requests/2.4.3 CPython/2.7.3 Linux/3.2.0-32-virtual
                Content-Type: application/json
                X-Forwarded-For: 10.67.79.2
                Accept-Encoding: gzip, deflate

10:35:24 [DEBUG] [manager-rest] 
Response (42314640):
        status: 200 OK
        headers: 
                Content-Type: application/json
                Content-Length: 44018
{%endhighlight%}
{%note title=Note%}
The IDs which appear in the *Request* and *Response* lines are meant to help understand which response belongs to which request. However, these IDs might not (and will not) be unique over time - yet it's always certain that a response with a specific ID is linked to the request with that same ID which came right before it.
{%endnote%}
{% endgcloak %}


## Gunicorn logs

There are two log files Gunicorn writes to: an access log and a general log.

The access log simply logs a concise entry for each request made to the web server.

This log file sits at `/var/log/cloudify/gunicorn-access.log`

{% togglecloak id=2 %} Example output {% endtogglecloak %}
{% gcloak 2 %}
{% highlight yaml %}
62.90.11.161 - - [27/Nov/2014:10:35:23] "PUT /deployments/dep4 HTTP/1.0" 201 2410 "-" "python-requests/2.2.1 CPython/2.7.6 Linux/3.13.0-39-generic"
10.67.79.2 - - [27/Nov/2014:10:35:24] "GET /nodes?deployment_id=dep4 HTTP/1.0" 200 44018 "-" "python-requests/2.4.3 CPython/2.7.3 Linux/3.2.0-32-virtual"
10.67.79.2 - - [27/Nov/2014:10:35:24] "GET /node-instances?deployment_id=dep4 HTTP/1.0" 200 2236 "-" "python-requests/2.4.3 CPython/2.7.3 Linux/3.2.0-32-virtual"
{%endhighlight%}
{% endgcloak %}


The general log mostly has information on Gunicorn workers. It is usually only interesting when there was a problem in starting up the REST service and Flask.

This log file sits at `/var/log/cloudify/gunicorn.log`

{% togglecloak id=3 %} Example output {% endtogglecloak %}
{% gcloak 3 %}
{% highlight yaml %}
2014-11-27 10:33:40 [20264] [INFO] Starting gunicorn 18.0
2014-11-27 10:33:40 [20264] [INFO] Listening at: http://0.0.0.0:8100 (20264)
2014-11-27 10:33:40 [20264] [INFO] Using worker: sync
2014-11-27 10:33:40 [20270] [INFO] Booting worker with pid: 20270
2014-11-27 10:33:40 [20271] [INFO] Booting worker with pid: 20271
{%endhighlight%}
{% endgcloak %}


## Upstart logs

The upstart log with regards to the REST service sits at `​/var/log/upstart/manager.log`.

It shouldn't have any interesting information, unless there was a problem in starting up the service and Gunicorn.
