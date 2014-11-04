var widgetModule = angular.module('widgetApp', [ 'cloudifyWidgetAngularController' ] );

widgetModule.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

widgetModule.controller('widgetController', function( $scope, $controller ,$log, $http) {
    $controller('GsGenericWidgetCtrl', {$scope:$scope} );
    $scope.genericWidgetModel.element = $('iframe')[0];

    $scope.widgetController = {
        widgetLoaded: false,
        loadingMachine: false,
        machineStarted: false,
        name: null,
        email: null,
        buttonText: 'loading...',
        stopButtonText: 'I\'m done, thanks',
        alreadyRegistered: false
    };

    var postTryWidgetData = function() {
        if(mixpanel.cookie.props.__alias==undefined){
            mixpanel.identify($scope.widgetController.email);
            mixpanel.alias($scope.widgetController.name, $scope.widgetController.email);
            mixpanel.name_tag($scope.widgetController.name) ;
            mixpanel.register();
        }

        mixpanel.people.set({
            $email: $scope.widgetController.email,
            $first_name: $scope.widgetController.name,
            $created: new Date(),
            $last_seen:new Date()
        });

        mixpanel.track('Start Widget (Try now) Clicked');
        mixpanel.people.increment({
            "Number Of Widget Started": 1
        });
    }

    $scope.stopTrial = function() {
        mixpanel.track('stop Widget (end trial) Clicked');

        $scope.stopWidget();

        $scope.widgetController.stopButtonText = "Ending Trial...";
        $scope.widgetController.machineStarted = false;
    }

    $scope.tryItNowBtn = function() {
        if ($scope.widgetController.widgetLoaded) {
            if ($scope.widgetController.alreadyRegistered) {
                // Start the machine
                $scope.playWidget();

                $scope.widgetController.loadingMachine = true;
                $scope.widgetController.buttonText = "Loading your machine...";

            } else if ($scope.tryNowForm.$valid) {
                $log.info("name: "+$scope.widgetController.name+" email: "+$scope.widgetController.email);

                // Post data to wufoo
                postTryWidgetData();

                // Start the machine
                $scope.playWidget();

                $scope.widgetController.loadingMachine = true;
                $scope.widgetController.buttonText = "Loading your machine...";
            }
        }

    }

    var checkIfLoaded = function() {
        if ($scope.genericWidgetModel.loaded) {
            $log.info('widget frame was loaded');
            $scope.widgetController.widgetLoaded = true;
            $scope.widgetController.buttonText = "Try it now!";
        }
    }

    var checkStatus = function() {
        $log.info("got status: ",$scope.genericWidgetModel.widgetStatus);

        var status = $scope.genericWidgetModel.widgetStatus;
        if (status.nodeModel) {
            // Check if its the first time (and you didnt refresh your page - loadingMachine is set to false unless you click the button)
            if (!$scope.widgetController.widgetStarted && $scope.widgetController.loadingMachine) {
                window.open("http://"+status.nodeModel.publicIp, '_blank');
                mixpanel.track('Widget Machine Started');
            }
            $scope.widgetController.widgetStarted = true;
            $scope.widgetController.machineStarted = true;
            $scope.widgetController.machineIp = status.nodeModel.publicIp;
            $scope.widgetController.expires = new Date(status.nodeModel.expires);
            $scope.widgetController.timeLeft = new Date(status.nodeModel.expires -  new Date().getTime()) ;

            // Setting env for next time...
            $scope.widgetController.buttonText = "Try it now!";

        } else {
            // Got some error
            if (status.output) {
                var output = status.output[0];
                mixpanel.track('Widget Machine Start Error',{message: output});

                $log.warn("Got error state. Message :  "+ output);
                $scope.widgetController.widgetOutput = output;

                $scope.widgetController.loadingMachine = false;
                $scope.widgetController.buttonText = "Try it now!";

            }

            // TODO fix widget to stop if status is not ok
            $scope.stopWidget();
        }
    }

    $scope.$watch( 'genericWidgetModel.loaded', checkIfLoaded);
    $scope.$watch( 'genericWidgetModel.widgetStatus' , checkStatus);

    if (mixpanel.cookie && mixpanel.cookie.props.distinct_id) {
        $scope.widgetController.alreadyRegistered = true;
    }
} )