# Blueprints Catalog

AngularJS directive that displays the list of repositories containing blueprints that are ready to deploy.

## Installation

You can install the plugin using bower:

```shell
bower install git@github.com:adubovsky/blueprints-catalog.git#master --save
```

Or just [download](https://github.com/adubovsky/blueprints-catalog/archive/master.zip) the plugin archive.

## Configuring

If you are already use AngularJS on your page then you just need to include the following widget assets to yor page:
```html
<link rel="stylesheet" href="dist/blueprinting_catalog_base.min.css">

<script src="dist/blueprinting_catalog_widget.min.js"></script>
```
And add a `blueprintingCatalogWidget` to your app dependencies.

If you would like to use the widget on the page without AngularJS, you would need to add angular script and additional widget asset before the assets, added on previous step:
```html
<script src="angular/angular.min.js"></script>
<script src="dist/blueprinting_catalog_app.min.js"></script>
```

## Add Widget to the Page

Add the following markup to the your page to initialize widget (add the `ng-app="blueprintingCatalogApp"` attribute to any parent element if you had not used AngularJS on the page):
```html
<section blueprinting-catalog
         data-catalog-list-title="Cloudify Examples"
         data-catalog-list-description='These are example blueprint archives that are ready to deploy. Click on "Upload to Manager" to publish to an existing manager and create a deployment now, or you can download and customize to your needs. Click on the "Source" to see the source at GitHub. Click on the name of the blueprint for more information about what it does.'
         data-catalog-back-text="back"
         data-catalog-how-use-link="http://example.com/faq"
         data-catalog-how-contribute-link="http://example.com/contribute"
         data-catalog-github-query="/search/repositories?q=repo:*-example+user:cloudify-examples"
         data-catalog-default-manager="http://example.com"
         data-catalog-cors-proxy="https://example.com/proxy"
         data-catalog-default-version="master">
</section>
```
The following options are supported:

`data-catalog-list-title` - Defines the title of the repositories list (_Default:_ `none`)

`data-catalog-list-description` - Defines the description under the title (_Default:_ `none`)

`data-catalog-how-use-link` - Defines the link to the "How to Use" instruction (_Default:_ `none`)

`data-catalog-how-contribute-link` - Defines the link to the "How to Contribute" instruction (_Default:_ `none`)

`data-catalog-back-text` - Defines the title of the back link on the details view (_Default:_ `none`)

`data-catalog-github-query` - Defines the github search query to be used to retrieve the repositories list (_Default:_ `'/search/repositories?q=repo:*-example+user:cloudify-cosmo'`)

`data-catalog-default-manager` - Defines the default value for "Manager Endpoint" field (_Default:_ `none`)

`data-catalog-cors-proxy` - Define proxy which should be used to upload blueprint to user-provided manager endpoint. (_Default:_ `none`)
__Note:__ the proxy is used to allow user to upload blueprints to the manager endpoints which do not support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS).
The proxy server should accept POST requests with the following json body:

```json
{
    "method": "PUT",
    "url": "http://cloudify-manager-api/blueprints/new"
}
```

It should sent the request to the provided url and respond with any success status (e.g. 200) in case of success or any error status (e.g. 400) and error message in the body in case of failure.

`data-catalog-default-version` - Defines the default selected branch / tag (_Default:_ `repository's default branch`)

## Styling

The widget contains only the basic set of css rules so you can easily change the widget look & feel using css.
