var widgetModule = angular.module('widgetApp', [ 'cloudifyWidgetAngularController' ] );

widgetModule.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

widgetModule.controller('widgetController', function( $scope, $timeout, $controller ,$log, $http, $sce) {
    $controller('GsGenericWidgetCtrl', {$scope:$scope} );
    $scope.genericWidgetModel.element = $('#widgetFrame')[0];

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
            resource: "widget Trial"
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
        if (status.error) {
            var endTime = (new Date()).getTime();
            var duration = $scope.startTime ? (endTime - $scope.startTime) : 0;
            $scope.startTime = undefined; // Clear start time

            mixpanel.track('Widget Machine Start Error',{message: status.error, duration: duration});

            $log.warn("Got error state. Message :  "+ status.error);
            $scope.widgetController.widgetOutput = status.error;

            $scope.widgetController.loadingMachine = false;
            $scope.widgetController.buttonText = "Try it now!";

        } else if (status.nodeModel) {
            var state = status.nodeModel.state;

            if (state == 'RUNNING') {
                // Check if its the first time (and you didnt refresh your page - loadingMachine is set to false unless you click the button)
                if (!$scope.widgetController.widgetStarted && $scope.widgetController.loadingMachine) {
                    // window.open("http://"+status.nodeModel.publicIp, '_blank'); // DO NOT OPEN MANAGER AUTOMATICALLY.. 
                    mixpanel.track('Widget Machine Started');

                    $scope.startTime = (new Date()).getTime();
                }

                $scope.widgetController.widgetStarted = true;
                $scope.widgetController.machineStarted = true;
                $scope.widgetController.machineIp = status.nodeModel.publicIp;
                $scope.widgetController.butterflySource = $sce.trustAsResourceUrl('http://' + $scope.widgetController.machineIp + ':8011/');
                $scope.widgetController.expires = new Date(status.nodeModel.expires);
                $scope.widgetController.timeLeft = new Date(status.nodeModel.expires -  new Date().getTime()) ;

                $timeout(function(){ // focus on butterfly iframe. https://cloudifysource.atlassian.net/browse/CW-316
                    // this is ugly, but quick
                    $('.butterfly-iframe iframe').focus();
                },100);

                $scope.widgetController.widgetOutput = "";

                // Setting env for next time...
                $scope.widgetController.buttonText = "Try it now!";
            } else if (state == "STOPPED") {
                var endTime = (new Date()).getTime();
                var duration = $scope.startTime ? (endTime - $scope.startTime) : 0;
                $scope.startTime = undefined; // Clear start time

                mixpanel.track('Widget Machine stopped',{duration: duration});

                $scope.widgetController.loadingMachine = false;
                $scope.widgetController.machineStarted = false;
                $scope.widgetController.buttonText = "Try it now!";
            }
        } else {
            // Got some other error
            if (status.output) {
                var output = status.output[0];
                var endTime = (new Date()).getTime();
                var duration = $scope.startTime ? (endTime - $scope.startTime) : 0;
                $scope.startTime = undefined; // Clear start time


                mixpanel.track('Widget Machine Start Error',{message: output, duration: duration});


                $log.warn("Got error state. Message :  "+ output);
                $scope.widgetController.widgetOutput = output;

                $scope.widgetController.loadingMachine = false;
                $scope.widgetController.buttonText = "Try it now!";

            }
        }
    }

    $scope.getTimeLeft = function(){
        if ( !!$scope.widgetController && !!$scope.widgetController.timeLeft ) {
            return Math.round($scope.widgetController.timeLeft.getTime() / 60000);
        }
    };

    $('#widgetFrame').attr('src','http://thewidget.staging.gsdev.info/#/widgets/54523f3e777c57802e36c03c/blank?timestamp='+(new Date().getTime())+'&');
    $scope.$watch( 'genericWidgetModel.loaded', checkIfLoaded);
    $scope.$watch( 'genericWidgetModel.widgetStatus' , checkStatus);

    if (mixpanel.cookie && mixpanel.cookie.props.distinct_id) {
        $scope.widgetController.alreadyRegistered = true;
    }
} )
