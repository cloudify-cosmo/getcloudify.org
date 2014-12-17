'use strict';

angular.module('cloudifyWidgetAngularController',[]);

/**
 *
 *  A controller that handles postMessage and recieveMessage for you.
 *
 *  it communicates with your controller by watching a property on the scope called 'genericWidgetModel'
 *  that has the following structure
 *
 *
 * dependencies:
 *  - JQuery  - We assume there is jquery in the project.
 *
 *
 */
angular.module('cloudifyWidgetAngularController')
    .controller('GsGenericWidgetCtrl', function ($scope, $log) {

        $scope.genericWidgetModel = {
            loaded : false,
            element : null, // the dom element to post message to
            widgetStatus : {},
            advancedData : {},
            leadDetails : {},
            loginDetails: {},
            recipeProperties : []
        }; // initialized;


        function _postMessage ( name, data ){
            var element = $scope.genericWidgetModel.element;
            if ( typeof(element) === 'function' ){
                element = element();
            }
            if ( !element ){
                $log.error('element not defined on $scope.genericWidgetModel. Do not know who to post data to');
            }
            try {
                element.contentWindow.postMessage({ 'name': name, 'data': data }, '*');
            }catch(e){}
        }

        $scope.playWidget = function(){
            _postMessage('widget_play');
        };

        $scope.stopWidget = function(){
            _postMessage('widget_stop');
        };

        var postLoginDetails = function() {
            $log.info('posting login details');
            _postMessage('widget_login_details', $scope.genericWidgetModel.loginDetails );
        };
        $scope.$watch( function(){ return $scope.genericWidgetModel.loginDetails; }, postLoginDetails, true);

        var postProperties = function () {
            $log.info('posting properties');
            _postMessage('widget_recipe_properties', $scope.genericWidgetModel.recipeProperties);
        };
        $scope.$watch( function(){ return $scope.genericWidgetModel.recipeProperties; }, postProperties, true);


        var postAdvancedData = function () {
            $log.info('posting advancedData');
            _postMessage('widget_advanced_data', $scope.genericWidgetModel.advancedData);
        };
        $scope.$watch( function() { return $scope.genericWidgetModel.advancedData; }, postAdvancedData, true);


        var postLeadDetails = function () {
            _postMessage('widget_lead_details', $scope.genericWidgetModel.leadDetails);
        };
        $scope.$watch( function(){ return $scope.genericWidgetModel.leadDetails; }, postLeadDetails,true);

        var ellipsis = '.....';
        var ellipsisLength = 0;

        function receiveMessage( e ){
            var messageData = angular.fromJson(e.data);
            $log.info(['ibmpage got a message ', messageData] );
            if ( messageData.name === 'widget_loaded'){
                $scope.genericWidgetModel.loaded = true;
                postLeadDetails();
                postAdvancedData();
                postProperties();
            }

            if ( messageData.name === 'widget_status' ){

                ellipsisLength = Math.max(1,( ellipsisLength + 1 ) % ellipsis.length);
                if ( messageData.data.hasOwnProperty('status')){
                    $scope.genericWidgetModel.widgetStatus = messageData.data.status;
                }else{
                    $scope.genericWidgetModel.widgetStatus = messageData.data;
                }

                try {
                    if ( !!$scope.genericWidgetModel.widgetStatus && !!$scope.genericWidgetModel.widgetStatus.rawOutput) {
                        $scope.genericWidgetModel.widgetStatus.ellipsis = ellipsis.substring(ellipsis.length - ellipsisLength);
                    }
                }catch(e){}

            }

            $scope.$apply();
        }

        window.addEventListener('message', receiveMessage, false);

        $log.info('generic controller loaded');
    });
