---
layout: bt_wiki
title: JavaScript Client
category: APIs
publish: true
abstract: REST Client API Documentation for the Cloudify Manager
pageord: 400
---

{%summary%}
In this section we will talk about our javascript client and show how you can overcome CORS problems and use it to build your own UI.
Read our <a href="https://s3.amazonaws.com/cloudifyjs.gsdev.info/3.2.0/index.html" target="_blank">technical documentation</a> for more information.
{%endsummary%}

{%note title=Note%}
For using the javascript client from frontend, you will need to setup CORS manually.
Read below to see how.
{%endnote%}


# NodeJS Client

To use this client run the command `npm install cloudify-cosmo/cloudify-js#3.2.0 --save`

Here is an example of how to get blueprints

{% highlight js %}

var CloudifyClient = require('cloudify-js').CloudifyClient;

var client = new CloudifyClient({'endpoint' : 'http://cloudify.localhost.com'});
var logger = require('log4js').getLogger('index.nodejs');

client.blueprints.list(null, function( err, response, body){
logger.info('this is body',body);
});

{%endhighlight%}

For more examples on how to use in front end please read the official javascript documentation


# JavaScript Client - How to enable CORS

If you wish to use the cloudify javascript client, you will run into CORS issues.

CORS happens when you generate requests from one origin (protocol + domain + port) to another.

However you can easily configure your nginx server to enable CORS for you while keeping your network safe.


{% highlight  text %}
location ^/restapi {
  add_header 'Access-Control-Allow-Origin' 'customui.example.com';
  add_header 'Access-Control-Allow-Credentials' 'true';
  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
  add_header 'Access-Control-Allow-Headers' 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';

  proxy_pass http://manager.example.com;
}

{%endhighlight%}

The example above references 2 origins. The first is `customui.example.com` which is the domain you serve your UI from.
The second, `manager.example.com` is cloudify's manager host that you have set up earlier.

You need to replace these 2 values with the ones that suite you best.

We begin with `location /restpi` which means this rule will only affect routes that begin with `/restapi`.
you need to change this value according to your client's configuration.
Our example suites the following use case:

`var client = new CloudifyClient({'endpoint' : 'http://customui.example.com/restapi'});`

We then start to add headers to add cross origin requests which will resolve the problem.

The configuration ends with the line `proxy_pass http://manager.example.com;`. This line is responsible for the calls actually reaching the cloudify manager.

{%tip title=Using a wild card%}

You can also replace `customui.example.com` with `*`

This means that every website can write javascript that has access to your cloudify manager.

This might be the right use case for you, it is also easier to use to see first results,
however using it when it is not your use-case opens a security breach and is not recommended so make sure not to leave it open
 on your production environment

{%endtip%}


# How to write your own UI

In this section we will start to write a very basic UI project just to get you going.

When we are done, the UI will enable you to :

 - See all blueprints
 - Create a deployment from a blueprint
 - See specific deployment
 - Execution a workflow on that deployment
 - See events and logs


The project will use Angularjs to run.

The sources for this project are available at <a href="https://github.com/guy-mograbi-at-gigaspaces/cloudify-write-your-own-ui-demo" target="_blank">our github repository</a>

## Setup

This step is very framework oriented. I add it here just for the sake of clarity of how things actually work.

If you are interesting in actual usage please skip to next step

### Add the client code in index.html

![Include the script]({{ site.baseurl }}/guide/images3.2/guide/customui/include_script.png)

This is a simple import of the Cloudify Client script into the html file.

### For those who don't know angular

For those of you who do not know angular yet here are the things you need to know to follow the samples (the rest is pretty intuitive)

 - Angular uses routes to link between a url to controller (js code) and view (html files).
 - Angular uses bindings between controller and view. which means view rendering is automatic and there's no rendering specific code
 - Angular uses a templating mechanism - which means you will not see the entire HTML code on each view, but only the code relevant for this page. The rest of the code is at `index.html`
 - Angular uses a sort of injection mechanism - so we can define the CloudifyClient once and inject it to different places.

 We will show the controller's code alongside the view for each page.
 We will show the code as snapshots as it is available on github otherwise.

### Define the angular app

![Define angular app]({{ site.baseurl }}/guide/images3.2/guide/customui/define_dependency.png)

As you can see, we define a new angular app with dependency to `cloudifyjs` - the name of the module we gave to our client in angular.

Now that we have defined the dependency on it, angular will inject it where we ask.

### The routes

The routes configuration is a technical step in angular. It declares on the pages we have, their controller, and their view.

![Routes Definition]({{ site.baseurl }}/guide/images3.2/guide/customui/routes.png)

### Instantiating the Client

Using angular's injection mechanism, we define the client once and later it will be injected to whever we use it.

![Instantiate the client]({{ site.baseurl }}/guide/images3.2/guide/customui/instantiate.png)


## Blueprints Page

The first page should list all blueprints. That's relatively easy in angular.

The controller brings the data using the CloudifyClient and the view lists their name with links to dedicate page on each one

![Blueprints Page]({{ site.baseurl }}/guide/images3.2/guide/customui/blueprints_page.png)


Important things to note is that when we ask for all the blueprints, we specify to get only the field `id` and `created_at`.

This will improve performance.

### The result

This is how the page will look like

![Blueprints Page Result]({{ site.baseurl }}/guide/images3.2/guide/customui/blueprints_page_result.png)

## Single Blueprint Page

While the index page lists all the blueprints with only their name, we need a page focusing on a single blueprint.

Another thing we want the page to do is to allow us to deploy this blueprint.

### the controller

![Blueprint Controller]({{ site.baseurl }}/guide/images3.2/guide/customui/blueprint_controller.png)

 - when the controller loads we do the following
    - We take the blueprint ID from route params (line 12)
    - We `get` the blueprint using the client (lines 13-27 with callback)
    - We put the fetched blueprint on scope and we construct the model for `deploy` action form (lines 14 - 25)
    - We define the `deploy` action (lines 30-45)
 - On deploy we
    - call to `create` action using the client (line 35)
    - register the results on scope to give the user some feedback (lines 36 - 40)


### The view

In the view we want to display some more specific details on the blueprint, we want to show a form to deploy the blueprint and we want the ability to see the entire blueprint.

![Blueprint View]({{ site.baseurl }}/guide/images3.2/guide/customui/blueprint_view.png)

The view is divided to 3 sections
 - some important info about the blueprint
 - deploy blueprint form
 - raw information about the blueprint - display all info about the blueprint

The interesting things to look at are in the form
 - We wire the `submit` action to the scope function we defined in the controller
 - We wire each input to the model we define on the scope

### The result

![Blueprint Page Result]({{ site.baseurl }}/guide/images3.2/guide/customui/blueprint_page_result.png)

So now that we can list all the blueprints and deploy them, we need to be able to view the deployments and execute workflows on them.

## Deployments

The deployments page will display all deployments and expose link to a single deployment.

It is cool to see on this page if a workflow is currently running on each deployment. This complicates stuff a bit, but it is worth the while

### The controller

![Deployments Controller]({{ site.baseurl }}/guide/images3.2/guide/customui/deployments_controller.png)

In the controller we
 - Fetch all deployments. We specifically request fields `id` and `blueprint_id`
 - Once we have the deployments, we get all executions. again - only relevant fields
 - Once we have both deployments and executions we correlate the two using the `deployment_id` field.


### The view

![Deployments View]({{ site.baseurl }}/guide/images3.2/guide/customui/deployments_view.png)

In the view we
 - List all the deployments.
 - Each item on the list shows the correlating blueprint and execution to that deployment
 - The deployment is a link to a dedicated page.
 - The blueprint is also a link to the page we wrote in the previous step


### The result

![Deployments Page Result]({{ site.baseurl }}/guide/images3.2/guide/customui/deployments_page_result.png)

Now lets move on to a single deployment, and allow to run an execution on that deployment


## Deployment page

This page is similar to the blueprint page. It should:

 - show more details about the deployment
 - it should show if there's a workflow currently running, and link to the relevant events
 - it should allow to execute another workflow
 - it should dump all details about the deployment

### The controller

The code is pretty long. It repeats the blueprint controller. So we will focus only 2 things in the controller

You can always see the [full version](https://github.com/guy-mograbi-at-gigaspaces/cloudify-write-your-own-ui-demo/blob/master/app/scripts/controllers/deployment.js)

![Deployment Controller]({{ site.baseurl }}/guide/images3.2/guide/customui/deployment_controller.png)

The two things to not in the controller

 - We reconstruct the `parameters` field for the execute form according to which workflow was selected. `$watch` fires whenever the value changes.
 - When workflow executes successfully, we save the execution details on scope to display it.


### The view

![Deployment View]({{ site.baseurl }}/guide/images3.2/guide/customui/deployment_view.png)

The view is very similar to blueprint page.
If there is an execution currently running - we expose a link to the events page

### The result

![Deployment Page Result]({{ site.baseurl }}/guide/images3.2/guide/customui/deployment_page_result.png)


## Events Page

Lets assume I only want to see events for specific execution each time

![Events Page]({{ site.baseurl }}/guide/images3.2/guide/customui/events_page.png)

We kept the events page pretty simple. We take the execution ID from the url, and we request all events and logs from client.

Then we put everything on scope and display it like a console output

### The result


![Events Page Result]({{ site.baseurl }}/guide/images3.2/guide/customui/events_page_result.png)


