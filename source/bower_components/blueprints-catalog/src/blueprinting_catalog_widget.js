'use strict';

(function () {
    var catalog = angular.module('blueprintingCatalogWidget', []);

    var LOG_TAG = 'BLUEPRINTING CATALOG WIDGET';
    var defaultError = 'unexpected error occurred';

    var endpoint = 'https://api.github.com';
    var githubQuery = '/search/repositories?q=*-example+user:cloudify-cosmo';
    var blueprintsEndpoint = 'https://getcloudify.org';

    catalog.directive('blueprintingCatalog', ['Github', 'CloudifyManager', 'CatalogHelper', '$log', function (Github, CloudifyManager, CatalogHelper, $log) {

        return {
            restrict: 'A',
            scope: {
                githubQuery: '@catalogGithubQuery',
                listTitle: '@catalogListTitle',
                listDescription: '@catalogListDescription'
            },
            templateUrl: 'blueprinting_catalog_widget_tpl.html',
            link: function ($scope) {
                if ($scope.githubQuery) {
                    githubQuery = $scope.githubQuery;

                    $log.debug(LOG_TAG, 'default search query was overridden with', githubQuery);
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
