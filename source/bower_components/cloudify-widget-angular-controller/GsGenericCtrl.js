/**
 * Created by sefi on 11/12/14.
 */

'use strict';

try {
    angular.module('cloudifyWidgetAngularController');
} catch (e) {
    angular.module('cloudifyWidgetAngularController', []);
}


/**
 *
 *  A controller that handles postMessage and recieveMessage for you.
 *
 *  it communicates with your controller by watching a property on the scope called 'genericWidgetModel'
 *  that has the following structure
 *
 *   {
 *       loaded: false until the widget has loaded,
 *       element: the dom element to post message to
 *       widgetStatus: the widget status object,
 *       recipeProperties: recipe properties object
 *   }
 *
 *   This is a compatible only with the new widget. For the old widget, please see index.js
 *
 */
angular.module('cloudifyWidgetAngularController')
    .controller('GsGenericCtrl', function ($scope, $log) {
        $scope.genericWidgetModel = {
            loaded: false,
            element: null, // the dom element to post message to
            widgetStatus: {},
            recipeProperties: {},
            advancedData: {},
            leadDetails: {}
        }; // initialized;

        var postRecipeProperties = function () {
            $log.info('posting recipe properties');
            postMessage({name: 'widget_recipe_properties', data: $scope.genericWidgetModel.recipeProperties});
        };
        $scope.$watch(function () {
            return $scope.genericWidgetModel.recipeProperties;
        }, postRecipeProperties, true);

        $scope.playWidget = function () {

            var data = {};
            //try {
            //    data = {
            //        'executionDetails': {
            //            EC2: {
            //                params: {
            //                    apiKey: $scope.genericWidgetModel.advancedData.params.key,
            //                    secretKey: $scope.genericWidgetModel.advancedData.params.secretKey
            //                }
            //            }
            //        }
            //    };
            //} catch (e) {
            //    $log.error('error placing advancedData on play request', e);
            //}


            postMessage({name: 'widget_play', widget: data});
        };

        $scope.stopWidget = function () {
            postMessage({name: 'widget_stop'});
        };

        $scope.isWidgetInstallationFinished = function () {
            try {
                return !!$scope.genericWidgetModel.widgetStatus.exitStatus;
            } catch (e) {
            }
            return false;
        };

        $scope.isWidgetPlaying = function () {
            try {
                return $scope.genericWidgetModel.widgetStatus.nodeModel.state === 'RUNNING';
            } catch (e) {

            }
            return false;
        };


        function postMessage(data) {
            var element = $scope.genericWidgetModel.element;
            $log.debug('GSGenericCtrl will post message', data, typeof(element));


            if (typeof(element) === 'function') {
                element = element();
            }

            if (!element) {
                $log.error('element not defined on GsMessagesHubService postMessage. Do not know who to post data to');
            }

            $log.debug('element is', element);

            try {
                element.contentWindow.postMessage(data, '*');
            } catch (e) {
                $log.error('unable to post message', e);
            }
        }

        function receiveMessage(e) {
            var messageData = angular.fromJson(e.data);
            $log.info(['cloudify widget GsGenericCtrl got a message ', messageData]);

            if (!messageData) {
                $log.error('unable to handle received message, no data was found');
                return;
            }

            if (messageData.name === 'widget_loaded') {
                $scope.genericWidgetModel.loaded = true;
                postRecipeProperties();
            }

            if (messageData.name === 'widget_status') {
                if (messageData.data.hasOwnProperty('status')) {
                    $scope.genericWidgetModel.widgetStatus = messageData.data.status;
                } else {
                    $scope.genericWidgetModel.widgetStatus = messageData.data;
                }

            }

            $scope.$apply();
        }

        window.addEventListener('message', receiveMessage, false);

        $log.info('generic controller loaded');
    });
