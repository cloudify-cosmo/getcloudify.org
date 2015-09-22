'use strict';

angular.module('blueprintingCatalogApp', ['blueprintingCatalogWidget'])

    .config(['$compileProvider', '$logProvider', function ($compileProvider, $logProvider) {
        $compileProvider.debugInfoEnabled(false);
        $logProvider.debugEnabled(false);
    }]);
