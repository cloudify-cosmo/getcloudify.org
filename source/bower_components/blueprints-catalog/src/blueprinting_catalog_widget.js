'use strict';

(function () {
    var catalog = angular.module('blueprintingCatalogWidget', []);

    var LOG_TAG = 'BLUEPRINTING CATALOG WIDGET';
    var defaultError = 'unexpected error occurred';

    var blueprintRegex = /blueprint.yaml$/i;

    var githubQuery = '/search/repositories?q=repo:*-example+user:cloudify-examples';
    var defaultVersion = '';
    var catalogDefaultManager = '';
    var catalogCorsProxy = '';

    var __scope;

    catalog.directive('blueprintingCatalog', ['Github', 'CloudifyManager', 'CatalogHelper', '$q', '$log',
        function (Github, CloudifyManager, CatalogHelper, $q, $log) {

            return {
                restrict: 'A',
                scope: {
                    githubQuery: '@catalogGithubQuery',
                    listTitle: '@catalogListTitle',
                    listDescription: '@catalogListDescription',
                    howUseLink: '@catalogHowUseLink',
                    howContributeLink: '@catalogHowContributeLink',
                    backText: '@catalogBackText',
                    catalogDefaultManager: '@catalogDefaultManager',
                    catalogCorsProxy: '@catalogCorsProxy',
                    defaultVersion: '@catalogDefaultVersion'
                },
                templateUrl: 'blueprinting_catalog_widget_tpl.html',
                link: function ($scope) {
                    __scope = $scope;

                    if ($scope.githubQuery) {
                        githubQuery = $scope.githubQuery;

                        $log.debug(LOG_TAG, 'default search query was overridden with', githubQuery);
                    }
                    if ($scope.defaultVersion) {
                        defaultVersion = $scope.defaultVersion;
                    }
                    if ($scope.catalogDefaultManager) {
                        catalogDefaultManager = $scope.catalogDefaultManager;
                    }
                    if ($scope.catalogCorsProxy) {
                        catalogCorsProxy = $scope.catalogCorsProxy;
                    }

                    $scope.loading = true;
                    Github.getRepositories().then(function (response) {
                        $log.debug(LOG_TAG, 'fetched repos', response);

                        $scope.repos = response.data && response.data.items || [];
                    }).finally(function () {
                        $scope.loading = false;
                    });

                    $scope.showDetails = function (repo) {
                        $q.when(CatalogHelper.fillVersions(repo), function () {
                            if (repo.currentVersion) {
                                CatalogHelper.fillReadme(repo, repo.currentVersion);
                            }
                        });

                        $scope.currentRepo = repo;
                    };

                    $scope.switchVersion = function (version) {
                        CatalogHelper.changeVersion($scope.currentRepo, version);
                    };

                    $scope.showList = function () {
                        $scope.currentRepo = undefined;
                    };

                    $scope.showUpload = function (repo) {
                        $log.debug(LOG_TAG, 'show upload', repo);

                        $q.when(CatalogHelper.fillVersions(repo), function () {
                            if (repo.currentVersion) {
                                $scope.blueprint.url = repo.html_url + '/archive/' + repo.currentVersion.name + '.zip';
                                $q.when(CatalogHelper.fillBlueprints(repo, repo.currentVersion), function () {
                                    var files = repo.blueprintFiles[repo.currentVersion.name];
                                    $scope.blueprint.path = files && files[0] || '';
                                });
                            }
                        });

                        $scope.managerEndpoint = catalogDefaultManager;
                        $scope.blueprint = {
                            id: repo.name
                        };

                        $scope.uploadRepo = repo;
                    };

                    $scope.selectNewVersion = function (version) {
                        var repo = $scope.uploadRepo;

                        $q.when(CatalogHelper.changeVersion(repo, version), function () {
                            $scope.blueprint.url = repo.html_url + '/archive/' + version.name + '.zip';
                            $scope.blueprint.path = repo.blueprintFiles[version.name][0];
                        });
                    };

                    $scope.closeUpload = function () {
                        $scope.error = undefined;
                        $scope.uploadRepo = undefined;
                        $scope.blueprint = undefined;
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
                                    $log.debug(LOG_TAG, 'upload failed', response);

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

    catalog.factory('CatalogHelper', ['Github', '$q', '$sce', '$log', function (Github, $q, $sce, $log) {

        return {
            changeVersion: function (repo, version) {
                $log.debug(LOG_TAG, 'change version to', version);

                repo.currentVersion = version;

                return $q.all([this.fillReadme(repo, version), this.fillBlueprints(repo, version)]);
            },

            fillVersions: function (repo) {
                if (!repo.versionsList) {
                    $log.debug(LOG_TAG, 'filling branches & tags for repo', repo);

                    var versionsList = [];
                    var tagsPromise = Github.getTags(repo.url);
                    var branchesPromise = Github.getBranches(repo.url);

                    return $q.all([branchesPromise, tagsPromise]).then(function (response) {
                        versionsList = versionsList.concat(response[0].data || []).concat(response[1].data || []);
                        var repoDefaultVersion = defaultVersion || repo.default_branch;
                        for (var i = 0, len = versionsList.length, v; i < len; i++) {
                            v = versionsList[i];
                            if (v.name === repoDefaultVersion) {
                                repoDefaultVersion = v;
                                break;
                            }
                        }
                        repo.currentVersion = repoDefaultVersion;

                        repo.versionsList = versionsList;
                    }, this.handleGithubLimit);
                }
            },

            fillBlueprints: function (repo, version) {
                repo.blueprintFiles = repo.blueprintFiles || {};
                if (!repo.blueprintFiles[version.name]) {
                    $log.debug(LOG_TAG, 'filling blueprints for repo', repo);

                    return Github.getTree(repo.url, version.commit.sha).then(function (response) {
                        var blueprints = [];
                        var files = response.data && response.data.tree || [];
                        for (var i = 0, len = files.length, f; i < len; i++) {
                            f = files[i];
                            if (f.type === 'blob' && blueprintRegex.test(f.path)) {
                                blueprints.push(f.path);
                            }
                        }
                        repo.blueprintFiles[version.name] = blueprints;
                    }, this.handleGithubLimit);
                }
            },

            fillReadme: function (repo, version) {
                repo.readmeContents = repo.readmeContents || {};
                if (!repo.readmeContents[version.name]) {
                    $log.debug(LOG_TAG, 'filling readme for repo', repo);

                    return Github.getReadme(repo.url, version.name).then(function (response) {
                        repo.readmeContents[version.name] = $sce.trustAsHtml(response.data || 'No Readme File');
                    }, this.handleGithubLimit);
                }
            },

            handleGithubLimit: function (response) {
                if (response.status === 403 && response.headers('X-RateLimit-Remaining') === '0') {
                    __scope.githubLimit = true;
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
        var endpoint = 'https://api.github.com';

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
            getReadme: function (repo_url, version) {
                return $http({
                    method: 'GET',
                    url: repo_url + '/readme' + (version ? '?ref=' + encodeURIComponent(version) : ''),
                    headers: {
                        'Accept': 'application/vnd.github.html+json'
                    }
                });
            },
            getTree: function (repo_url, sha) {
                return $http({
                    method: 'GET',
                    url: repo_url + '/git/trees/' + sha
                });
            }
        };
    }]);

    catalog.factory('CloudifyManager', ['$http', function ($http) {

        return {
            upload: function doUpload(endpoint, blueprint) {
                var queryParams = [], query, url;
                if (blueprint.path) {
                    queryParams.push('application_file_name=' + encodeURIComponent(blueprint.path));
                }
                if (blueprint.url) {
                    queryParams.push('blueprint_archive_url=' + encodeURIComponent(blueprint.url));
                }
                query = queryParams.length ? ('?' + queryParams.join('&')) : '';
                url = endpoint + '/blueprints/' + encodeURIComponent(blueprint.id) + query;

                if (catalogCorsProxy) {
                    return $http({
                        method: 'POST',
                        url: catalogCorsProxy,
                        data: {
                            method: 'PUT',
                            url: url
                        }
                    });
                } else {
                    return $http({
                        method: 'PUT',
                        url: url
                    });
                }
            }
        };
    }]);
})();
