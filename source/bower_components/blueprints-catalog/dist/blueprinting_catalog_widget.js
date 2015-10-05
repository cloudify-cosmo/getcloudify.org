'use strict';

(function () {
    var catalog = angular.module('blueprintingCatalogWidget', []);

    var LOG_TAG = 'BLUEPRINTING CATALOG WIDGET';
    var defaultError = 'unexpected error occurred';

    var endpoint = 'https://api.github.com';
    var githubQuery = '/search/repositories?q=*-example+user:cloudify-examples';
    var blueprintsEndpoint = '';

    catalog.directive('blueprintingCatalog', ['Github', 'CloudifyManager', 'CatalogHelper', '$log', function (Github, CloudifyManager, CatalogHelper, $log) {

        return {
            restrict: 'A',
            scope: {
                githubQuery: '@catalogGithubQuery',
                listTitle: '@catalogListTitle',
                listDescription: '@catalogListDescription',
                blueprintsEndpoint: '@catalogDefaultManager'
            },
            templateUrl: 'blueprinting_catalog_widget_tpl.html',
            link: function ($scope) {
                if ($scope.githubQuery) {
                    githubQuery = $scope.githubQuery;

                    $log.debug(LOG_TAG, 'default search query was overridden with', githubQuery);
                }
                if ($scope.blueprintsEndpoint) {
                    blueprintsEndpoint = $scope.blueprintsEndpoint;

                    $log.debug(LOG_TAG, 'default manager endpoint was overridden with', blueprintsEndpoint);
                }

                $scope.loading = true;
                Github.getRepositories().then(function (response) {
                    $log.debug(LOG_TAG, 'fetched repos', response);

                    $scope.repos = response.data && response.data.items || [];
                }).finally(function () {
                    $scope.loading = false;
                });

                $scope.showDetails = function (repo) {
                    $log.debug(LOG_TAG, 'show details', repo);

                    CatalogHelper.fillTags(repo);
                    CatalogHelper.fillReadme(repo);

                    $scope.currentRepo = repo;
                };

                $scope.showList = function () {
                    $scope.currentRepo = undefined;
                };

                $scope.showUpload = function (repo) {
                    $log.debug(LOG_TAG, 'show upload', repo);

                    CatalogHelper.fillTags(repo);
                    CatalogHelper.fillBranches(repo);

                    $scope.managerEndpoint = blueprintsEndpoint;
                    $scope.blueprint = {
                        path: 'blueprint.yaml',
                        id: repo.name,
                        url: repo.html_url + '/archive/' + repo.default_branch + '.zip'
                    };

                    $scope.uploadRepo = repo;
                };

                $scope.closeUpload = function () {
                    $scope.error = undefined;
                    $scope.uploadRepo = undefined;
                };

                $scope.uploadBlueprint = function () {
                    $log.debug(LOG_TAG, 'do upload');

                    if ($scope.blueprintForm.$valid) {

                        $scope.processing = true;
                        $scope.error = undefined;
                        CloudifyManager.upload($scope.managerEndpoint, $scope.blueprint)
                            .then(function () {
                                $scope.uploadRepo = undefined;
                            }, function (response) {
                                $scope.error = CatalogHelper.getErrorFromResponse(response);
                            })
                            .finally(function () {
                                $scope.processing = false;
                            });
                    }
                };
            }
        };

    }]);

    catalog.factory('CatalogHelper', ['Github', '$sce', function (Github, $sce) {

        return {
            fillTags: function (repo) {
                if (!repo.tagsList) {
                    Github.getTags(repo.url).then(function (response) {
                        repo.tagsList = response.data || [];
                    }, function () {
                        repo.tagsList = [];
                    });
                }
            },
            fillBranches: function (repo) {
                if (!repo.branchesList) {
                    Github.getBranches(repo.url).then(function (response) {
                        repo.branchesList = response.data || [];
                    }, function () {
                        repo.branchesList = [];
                    });
                }
            },
            fillReadme: function (repo) {
                if (!repo.readmeContent) {
                    Github.getReadme(repo.url).then(function (response) {
                        repo.readmeContent = $sce.trustAsHtml(response.data || 'No Readme File');
                    }, function () {
                        repo.readmeContent = $sce.trustAsHtml('No Readme File');
                    });
                }
            },

            getErrorFromResponse: function (response) {
                if (response && response.data) {
                    if (typeof response.data === 'string') {
                        return response.data;
                    } else {
                        return response.data.message || defaultError;
                    }
                } else {
                    return defaultError;
                }
            }
        };
    }]);

    catalog.factory('Github', ['$http', function ($http) {

        return {
            getRepositories: function () {
                return $http({
                    method: 'GET',
                    url: endpoint + githubQuery
                });
            },
            getTags: function (repo_url) {
                return $http({
                    method: 'GET',
                    url: repo_url + '/tags'
                });
            },
            getBranches: function (repo_url) {
                return $http({
                    method: 'GET',
                    url: repo_url + '/branches'
                });
            },
            getReadme: function (repo_url) {
                return $http({
                    method: 'GET',
                    url: repo_url + '/readme',
                    headers: {
                        'Accept': 'application/vnd.github.html+json'
                    }
                });
            }
        };
    }]);

    catalog.factory('CloudifyManager', ['$http', function ($http) {

        return {
            upload: function doUpload(endpoint, blueprint) {
                var queryParams = [], query;
                if (blueprint.path) {
                    queryParams.push('application_file_name=' + encodeURIComponent(blueprint.path));
                }
                if (blueprint.url) {
                    queryParams.push('blueprint_archive_url=' + encodeURIComponent(blueprint.url));
                }
                query = queryParams.length ? ('?' + queryParams.join('&')) : '';

                return $http({
                    method: 'PUT',
                    url: endpoint + '/blueprints/' + encodeURIComponent(blueprint.id) + query
                });
            }
        };
    }]);
})();
angular.module('blueprintingCatalogWidget').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('blueprinting_catalog_widget_tpl.html',
    "<section class=\"bl-catalog\"> <div ng-show=\"!currentRepo\"> <div> <h1>{{::listTitle}}</h1> <p>{{::listDescription}}</p> </div> <div> <table> <thead> <tr> <th>Name</th> <th>Description</th> <th>Source</th> <th>Action</th> </tr> </thead> <tr ng-show=\"!loading && !repos.length\"> <td colspan=\"4\">No Data Found</td> </tr> <tr ng-show=\"loading\"> <td colspan=\"4\">Loading...</td> </tr> <tr ng-repeat=\"repo in repos\"> <td> <a href ng-click=\"showDetails(repo);\">{{::repo.name}}</a> </td> <td> {{::repo.description}} </td> <td> <a href=\"{{::repo.html_url}}\" target=\"_tab_{{::repo.id}}\">Source</a> </td> <td> <a href ng-click=\"showUpload(repo);\">Upload to Manager</a> </td> </tr> </table> </div> </div> <div ng-show=\"currentRepo\"> <div> <a href ng-click=\"showList();\" class=\"to-list\">Back</a> <h1>{{currentRepo.name}}</h1> <ul class=\"action-links\"> <li><a href=\"{{currentRepo.html_url}}\" target=\"_tab_{{currentRepo.id}}\">Source</a></li> <li><a href=\"{{currentRepo.html_url}}/archive/{{currentRepo.default_branch}}.zip\">Download</a></li> <li><a href ng-click=\"showUpload(currentRepo);\">Upload to Manager</a></li> </ul> </div> <section> <div> README <hr> </div> <div ng-bind-html=\"currentRepo.readmeContent\"></div> </section> <section> <label>Available Tags:</label> <ul> <li ng-show=\"!currentRepo.tagsList.length\">(None)</li> <li ng-repeat=\"tag in currentRepo.tagsList\"> <span class=\"label\">{{tag.name}}</span> </li> </ul> </section> </div> <div ng-show=\"uploadRepo\" class=\"upload-backdrop\"></div> <div ng-show=\"uploadRepo\" class=\"upload-popup\"> <div class=\"upload-content\"> <div class=\"upload-header\"> <a href ng-click=\"closeUpload();\" class=\"close-popup\">&times;</a> </div> <div class=\"upload-content\"> <form novalidate name=\"blueprintForm\"> <label> Blueprint Name<br> <input type=\"text\" ng-model=\"blueprint.id\" placeholder=\"enter blueprint name\" required> </label> <label> Manager Endpoint URL<br> <input type=\"url\" ng-model=\"managerEndpoint\" placeholder=\"enter manager url\" required> </label> <label> Blueprint File Name<br> <input type=\"text\" ng-model=\"blueprint.path\" placeholder=\"enter blueprint file name\" required> </label> <label> Source<br> <select ng-model=\"blueprint.url\"> <optgroup label=\"Branches\"> <option ng-repeat=\"b in uploadRepo.branchesList\" value=\"{{uploadRepo.html_url}}/archive/{{b.name}}.zip\" ng-selected=\"b.name === uploadRepo.default_branch\"> {{b.name}} </option> </optgroup> <optgroup label=\"Tags\"> <option ng-repeat=\"tag in uploadRepo.tagsList\" value=\"{{uploadRepo.html_url}}/archive/{{tag.name}}.zip\"> {{tag.name}} </option> </optgroup> </select> </label> <div class=\"alert alert-error\">{{error}}</div> </form> </div> <div class=\"upload-buttons\"> <button class=\"btn btn-default\" ng-disabled=\"processing\" ng-click=\"closeUpload();\">Cancel</button> <button class=\"btn btn-primary\" ng-disabled=\"processing || blueprintForm.$invalid\" ng-click=\"uploadBlueprint();\"> <span ng-show=\"processing\">Uploading...</span> <span ng-hide=\"processing\">Upload</span> </button> </div> </div> </div> </section>"
  );

}]);
