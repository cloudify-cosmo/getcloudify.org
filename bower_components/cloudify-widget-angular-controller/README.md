# Installation

to install run

`bower install cloudify-widget-angular-controller --save`

make sure you include the JS file in your index.html

```html
<script src="bower_components/cloudify-widget-angular-controller/index.js"></script>
```

then add the module in your angular app dependencies

```javascript
angular.module('my module name', [ 'cloudifyWidgetAngularController' ] );
```


then use it from within a controller

```javascript
angular('my module name').controller('MyCtrl', function( $scope, $controller ) {
   $controller('GsGenericWidgetCtrl', {$scope:$scope} );
   $scope.genericWidgetModel.element = $('iframe')[0];

} )
```


this will put a property and some functions for you on the scope and will handle all post message and receive message to and from the widget's iframe.

# properties and methods added to the scope

### the property `genericWidgetModel`

```javascript
$scope.genericWidgetModel = {
            loaded : false,
            element : null, // the dom element to post message to
            widgetStatus : {},
            advancedData : {},
            leadDetails : {},
            recipeProperties : []
        }; // initialized;
```        

<dl>

<dt>loaded</dt>
<dd>will change once the iframe is loaded to true</dd>


<dt>element</dt>
<dd>is a field you fill with a pointer to the DOM element</dd>

<dt>widgetStatus</dt>
<dd>will be filled once the widget runs</dd>

<dt>advancedData</dt>
<dd>has one of the following structures</dd>

</dl>


```javascript

{ 'type' : 'aws_ec2' , 'params' : { 'key' : null, 'secretKey' : null } };
{ 'type' : 'softlayer' , 'params' : { 'username' : null, 'apiKey' : null } };

```
<dl>
<dd>
depends on your cloud of choice
</dd>

<dt>leadDetails</dt>
<dd>can contain whatever you want.</dd>

<dt>recipeProperties</dt>
<dd>has the following structure

</dl>

```javascript

[ { 'key' : 'my key' , 'value' : 'my value' } , { 'key' : 'another key' , 'value' : 'another value' } , ... ]

```


### the method `playWidget`

this method will invoke a play on the widget

### the method `stopWidget`

this method will invoke stop on the widget

