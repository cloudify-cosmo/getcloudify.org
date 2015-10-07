'use strict';

(function () {
    var catalog = angular.module('blueprintingCatalogWidget', []);

    var LOG_TAG = 'BLUEPRINTING CATALOG WIDGET';
    var defaultError = 'unexpected error occurred';

    var blueprintRegex = /blueprint.yaml$/i;

    var githubQuery = '/search/repositories?q=*-example+user:cloudify-examples';
    var defaultVersion = '';
    var blueprintsEndpoint = '';

    var __scope;

    catalog.directive('blueprintingCatalog', ['Github', 'CloudifyManager', 'CatalogHelper', '$q', '$log',
        function (Github, CloudifyManager, CatalogHelper, $q, $log) {

            return {
                restrict: 'A',
                scope: {
                    githubQuery: '@catalogGithubQuery',
                    listTitle: '@catalogListTitle',
                    listDescription: '@catalogListDescription',
                    backText: '@catalogBackText',
                    blueprintsEndpoint: '@catalogDefaultManager',
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
                    if ($scope.blueprintsEndpoint) {
                        blueprintsEndpoint = $scope.blueprintsEndpoint;
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

                        $scope.managerEndpoint = blueprintsEndpoint;
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
    "<section class=\"bl-catalog\"> <!--List of repositories--> <div ng-show=\"!currentRepo\"> <div> <h1>{{::listTitle}}</h1> <p>{{::listDescription}}</p> </div> <div> <div class=\"alert alert-danger\" ng-show=\"githubLimit\"> GitHub API rate limit exceeded. Please wait some time and refresh the page. </div> <table> <colgroup> <col class=\"col-name\"> <col class=\"col-descr\"> <col class=\"col-source\"> <col class=\"col-action\"> </colgroup> <thead> <tr> <th>Name</th> <th>Description</th> <th>Source</th> <th>Action</th> </tr> </thead> <tr ng-show=\"!loading && !repos.length\"> <td colspan=\"4\">No Data Found</td> </tr> <tr ng-show=\"loading\"> <td colspan=\"4\">Loading...</td> </tr> <tr ng-repeat=\"repo in repos\"> <td> <a href ng-click=\"showDetails(repo);\">{{::repo.name}}</a> </td> <td> {{::repo.description}} </td> <td> <a href=\"{{::repo.html_url}}\" target=\"_tab_{{::repo.id}}\">Source</a> </td> <td ng-switch=\"!!githubLimit\"> <a href ng-switch-when=\"false\" ng-click=\"showUpload(repo);\">Upload to Manager</a> <span ng-switch-when=\"true\" title=\"GitHub API rate limit exceeded. Please wait some time and refresh the page.\">Upload to Manager</span> </td> </tr> </table> </div> </div> <!--Repository's details--> <div ng-show=\"currentRepo\"> <div> <h1> <a href ng-click=\"showList();\" class=\"to-list\">{{backText}}</a> {{currentRepo.name}} </h1> <ul class=\"action-links\" ng-hide=\"githubLimit\"> <li><a href=\"{{currentRepo.html_url}}/tree/{{currentRepo.currentVersion.name}}\" target=\"_tab_{{currentRepo.id}}\">Source</a></li> <li><a href=\"{{currentRepo.html_url}}/archive/{{currentRepo.currentVersion.name}}.zip\">Download</a></li> <li><a href ng-click=\"showUpload(currentRepo);\">Upload to Manager</a></li> </ul> <div class=\"versions-list\" ng-hide=\"githubLimit\"> <label>Branches & Tags:</label> <ul> <li ng-repeat=\"v in currentRepo.versionsList\" ng-switch=\"v.name === currentRepo.currentVersion.name\"> <span ng-switch-when=\"true\" class=\"label version-selected\">{{v.name}}</span> <a ng-click=\"switchVersion(v);\" href ng-switch-when=\"false\" class=\"label version\">{{v.name}}</a> </li> </ul> </div> </div> <section> <hr> <div ng-bind-html=\"currentRepo.readmeContents[currentRepo.currentVersion.name]\" ng-hide=\"githubLimit\"></div> <div class=\"alert alert-danger\" ng-show=\"githubLimit\"> GitHub API rate limit exceeded. Please wait some time and refresh the page. </div> </section> </div> <!--Upload popup--> <div ng-show=\"uploadRepo && !githubLimit\" class=\"modal-backdrop\"></div> <div class=\"modal\" ng-show=\"uploadRepo && !githubLimit\"> <div class=\"modal-dialog\"> <div class=\"modal-content no-header\"> <div class=\"modal-body\"> <form novalidate name=\"blueprintForm\"> <label> Blueprint Name<br> <input type=\"text\" ng-model=\"blueprint.id\" placeholder=\"enter blueprint name\" required> </label> <label> Manager Endpoint URL<br> <input type=\"url\" ng-model=\"managerEndpoint\" placeholder=\"enter manager url\" required> </label> <label> Blueprint File Name<br> <select ng-model=\"blueprint.path\" ng-options=\"b for b in uploadRepo.blueprintFiles[uploadRepo.currentVersion.name]\" required> </select> </label> <label> Source<br> <select ng-model=\"uploadRepo.currentVersion\" ng-change=\"selectNewVersion(uploadRepo.currentVersion);\" ng-options=\"v as v.name for v in uploadRepo.versionsList\" required> </select> </label> <div class=\"alert alert-danger\" ng-show=\"error\">{{error}}</div> </form> <div class=\"modal-buttons\"> <button class=\"btn btn-default\" ng-disabled=\"processing\" ng-click=\"closeUpload();\">Cancel</button> <button class=\"btn btn-primary\" ng-disabled=\"processing || blueprintForm.$invalid\" ng-click=\"uploadBlueprint();\"> <span ng-show=\"processing\">Uploading...</span> <span ng-hide=\"processing\">Upload</span> </button> </div> </div> </div> </div> </div> </section>"
  );

}]);
