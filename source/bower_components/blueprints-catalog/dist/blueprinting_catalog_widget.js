'use strict';

(function () {
    var catalog = angular.module('blueprintingCatalogWidget', []);

    var LOG_TAG = 'BLUEPRINTING CATALOG WIDGET';
    var defaultError = 'unexpected error occurred';

    var blueprintRegex = /blueprint.yaml$/i;

    var groups = {
        blueprints: {
            order: 1,
            name: 'blueprints',
            githubQuery: '-example+in:name+fork:true+user:cloudify-examples',
            canUpload: true
        },
        plugins: {
            order: 2,
            name: 'plugins',
            githubQuery: '-plugin+in:name+fork:true+user:cloudify-examples'
        },
        integrations: {
            order: 3,
            name: 'integrations',
            githubQuery: '-integration+in:name+fork:true+user:cloudify-examples'
        }
    };

    var defaultVersion = '';
    var defaultVersionFallback = '';
    var catalogDefaultManager = '';
    var catalogCorsProxy = '';

    var __scope;

    catalog.directive('blueprintingCatalog', ['Github', 'CloudifyManager', 'CatalogHelper', '$location', '$q', '$log',
        function (Github, CloudifyManager, CatalogHelper, $location, $q, $log) {

            return {
                restrict: 'A',
                scope: {
                    blueprintsGithubQuery: '@catalogBlueprintsGithubQuery',
                    pluginsGithubQuery: '@catalogPluginsGithubQuery',
                    integrationsGithubQuery: '@catalogIntegrationsGithubQuery',
                    listTitle: '@catalogListTitle',
                    listDescription: '@catalogListDescription',
                    howUseLink: '@catalogHowUseLink',
                    howContributeLink: '@catalogHowContributeLink',
                    backText: '@catalogBackText',
                    catalogDefaultManager: '@catalogDefaultManager',
                    catalogCorsProxy: '@catalogCorsProxy',
                    defaultVersion: '@catalogDefaultVersion',
                    defaultVersionFallback: '@catalogDefaultVersionFallback'
                },
                templateUrl: 'blueprinting_catalog_widget_tpl.html',
                link: function ($scope) {
                    __scope = $scope;

                    if ($scope.blueprintsGithubQuery) {
                        groups.blueprints.githubQuery = $scope.blueprintsGithubQuery;
                    }
                    if ($scope.pluginsGithubQuery) {
                        groups.plugins.githubQuery = $scope.pluginsGithubQuery;
                    }
                    if ($scope.integrationsGithubQuery) {
                        groups.integrations.githubQuery = $scope.integrationsGithubQuery;
                    }
                    if ($scope.defaultVersion) {
                        defaultVersion = $scope.defaultVersion;
                    }
                    if ($scope.defaultVersionFallback) {
                        defaultVersionFallback = $scope.defaultVersionFallback;
                    }
                    if ($scope.catalogDefaultManager) {
                        catalogDefaultManager = $scope.catalogDefaultManager;
                    }
                    if ($scope.catalogCorsProxy) {
                        catalogCorsProxy = $scope.catalogCorsProxy;
                    }

                    $scope.groups = groups;

                    var reposDefers = [];
                    angular.forEach(groups, function (model, type) {
                        model.loading = true;
                        reposDefers.push(Github.getRepositories(model.githubQuery).then(function (response) {
                            $log.debug(LOG_TAG, 'fetched repos ', type, response);

                            var repos = response.data && response.data.items || [];
                            for (var i = 0, len = repos.length; i < len; i++) {
                                repos[i].canUpload = !!model.canUpload;
                            }
                            model.repos = repos;
                        }, CatalogHelper.handleGithubLimit).finally(function () {
                            model.loading = false;
                        }));
                    });

                    $scope.$watch(function () {
                        return $location.search().repo;
                    }, function (repoId) {
                        if (repoId) {
                            $q.all(reposDefers).then(function () {
                                var repos;
                                for (var type in groups) {
                                    if (groups.hasOwnProperty(type)) {
                                        repos = groups[type].repos;
                                        for (var i = 0, len = repos.length, repo; i < len; i++) {
                                            repo = repos[i];
                                            if (repo.id === +repoId) {
                                                $scope.showDetails(repo);
                                                return;
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            $scope.showList();
                        }
                    });

                    $scope.navigateToDetails = function (repo) {
                        $location.search('repo', repo.id);
                    };

                    $scope.navigateToList = function () {
                        $location.replace();
                        $location.search('repo', ''); //do not use NULL in order to avoid full page reload
                    };

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

                        $scope.blueprint.url = repo.html_url + '/archive/' + version.name + '.zip';

                        $q.when(CatalogHelper.changeVersion(repo, version), function () {
                            if ($scope.blueprint) {
                                $scope.blueprint.path = repo.blueprintFiles[version.name][0];
                            }
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

    catalog.directive('reposList', [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                repos: '=',
                type: '=',
                loading: '=',
                canUpload: '=',
                showDetails: '&',
                showUpload: '&'
            },
            templateUrl: 'repos_list_tpl.html'
        };
    }]);

    catalog.directive('copyToClipboard', ['$window', '$log', function ($window, $log) {
        return {
            restrict: 'A',
            scope: {
                text: '='
            },
            link: function (scope, element) {

                var _document = $window.document;

                element.on('click', function () {
                    copy(scope.text);
                });

                function copy(text) {
                    var el = createHiddenTexarea(text);
                    _document.body.appendChild(el);
                    try {
                        copyText(el);

                        $log.debug(LOG_TAG, 'copied: ' + text);
                    } catch (err) {
                        $log.warn(LOG_TAG, 'command not supported by your browser', err);
                        $log.warn(LOG_TAG, 'using fallback impl.');

                        $window.prompt("Copy to clipboard & hit enter", text);
                    }
                    _document.body.removeChild(el);
                }

                function createHiddenTexarea(text) {
                    var el = _document.createElement('textarea');
                    el.style.position = 'absolute';
                    el.style.left = '-5000px';
                    el.textContent = text;
                    return el;
                }

                function copyText(el) {
                    el.select();

                    if (!_document.execCommand('copy')) {
                        throw('failed to  copy');
                    }
                }
            }
        };
    }]);

    catalog.filter("toArray", function () {
        return function (obj) {
            var result = [];
            angular.forEach(obj, function (val) {
                result.push(val);
            });
            return result;
        };
    });

    catalog.factory('CatalogHelper', ['Github', '$q', '$sce', '$log', function (Github, $q, $sce, $log) {

        return {
            changeVersion: function (repo, version) {
                $log.debug(LOG_TAG, 'change version to', version);

                repo.currentVersion = version;

                return $q.all([
                    this.fillReadme(repo, version),
                    this.fillBlueprints(repo, version)
                ]);
            },

            fillVersions: function (repo) {
                if (!repo.versionsList) {
                    $log.debug(LOG_TAG, 'filling branches & tags for repo', repo);

                    var versionsList = [];
                    var tagsPromise = Github.getTags(repo.url);
                    var branchesPromise = Github.getBranches(repo.url);

                    return $q.all([branchesPromise, tagsPromise]).then(function (response) {
                        versionsList = versionsList.concat(response[0].data || []).concat(response[1].data || []);
                        var repoDefaultVersionName = defaultVersion || defaultVersionFallback;
                        var repoDefaultBranchName = repo.default_branch;
                        var repoDefaultVersion, repoDefaultBranch;
                        for (var i = 0, len = versionsList.length, v; i < len; i++) {
                            v = versionsList[i];
                            if (v.name === repoDefaultVersionName) {
                                repoDefaultVersion = v;
                            }
                            if (v.name === repoDefaultBranchName) {
                                repoDefaultBranch = v;
                            }
                        }
                        repo.currentVersion = repoDefaultVersion || repoDefaultBranch;

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
            getRepositories: function (query) {
                return $http({
                    method: 'GET',
                    url: endpoint + '/search/repositories?q=' + query
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
angular.module('blueprintingCatalogWidget').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('blueprinting_catalog_widget_tpl.html',
    "<section class=\"bl-catalog\"> <!--List of repositories--> <div ng-show=\"!currentRepo\"> <div> <h1>{{::listTitle}}</h1> <p class=\"catalog-description\"> {{::listDescription}} <a ng-href=\"{{howUseLink}}\" target=\"_how_use\" ng-if=\"howUseLink\"><br>How to Use</a> <a ng-href=\"{{howContributeLink}}\" target=\"_how_contribute\" ng-if=\"howContributeLink\"><br>How to Contribute</a> </p> </div> <div> <div class=\"alert alert-danger\" ng-show=\"githubLimit\"> GitHub API rate limit exceeded. Please wait some time and refresh the page. </div> <div ng-repeat=\"model in groups | toArray | orderBy:'order'\"> <repos-list data-repos=\"model.repos\" data-type=\"model.name\" data-loading=\"model.loading\" data-can-upload=\"!githubLimit && model.canUpload\" data-show-details=\"navigateToDetails(repo)\" data-show-upload=\"showUpload(repo)\"> </repos-list> </div> </div> </div> <!--Repository's details--> <div ng-show=\"currentRepo\"> <ng-include src=\"'repo_details_tpl.html'\"></ng-include> </div> <!--Upload popup--> <div ng-show=\"uploadRepo && !githubLimit\"> <ng-include src=\"'upload_tpl.html'\"></ng-include> </div> </section>"
  );


  $templateCache.put('repo_details_tpl.html',
    "<div> <h1> <a href ng-click=\"navigateToList();\" class=\"to-list\">{{backText}}</a> {{currentRepo.name}} </h1> <ul class=\"action-links\" ng-hide=\"githubLimit\"> <li><a ng-href=\"{{currentRepo.html_url}}/tree/{{currentRepo.currentVersion.name}}\" target=\"_tab_{{currentRepo.id}}\">Source</a></li> <li><a ng-href=\"{{currentRepo.html_url}}/archive/{{currentRepo.currentVersion.name}}.zip\">Download</a></li> <li ng-show=\"currentRepo.canUpload\"><a href ng-click=\"showUpload(currentRepo);\">Upload to Manager</a></li> </ul> <div class=\"versions-list\" ng-hide=\"githubLimit\"> <label> Branches & Tags: <select ng-model=\"currentRepo.currentVersion\" ng-change=\"switchVersion(currentRepo.currentVersion);\" ng-options=\"v as v.name for v in currentRepo.versionsList\" required> </select> </label> </div> <hr> <div ng-bind-html=\"currentRepo.readmeContents[currentRepo.currentVersion.name]\" ng-hide=\"githubLimit\"></div> <div class=\"alert alert-danger\" ng-show=\"githubLimit\"> GitHub API rate limit exceeded. Please wait some time and refresh the page. </div> </div>"
  );


  $templateCache.put('repos_list_tpl.html',
    "<div class=\"repos-list\"> <div class=\"search-repos\"> <h4>{{type}}:</h4> <input type=\"text\" ng-model=\"search.name\" placeholder=\"search {{type}} by name\"> </div> <table> <colgroup> <col class=\"col-name\"> <col class=\"col-descr\"> <col class=\"col-source\"> <col ng-if=\"canUpload\" class=\"col-action\"> </colgroup> <thead> <tr> <th>Name</th> <th>Description</th> <th>Source</th> <th ng-if=\"canUpload\">Action</th> </tr> </thead> <tr ng-repeat=\"repo in filtered = (repos | filter:search)\"> <td> <a href ng-click=\"showDetails({repo: repo});\">{{::repo.name}}</a> </td> <td> {{::repo.description}} </td> <td> <a ng-href=\"{{::repo.html_url}}\" target=\"_tab_{{::repo.id}}\">Source</a> </td> <td ng-if=\"canUpload\"> <a href ng-click=\"showUpload({repo: repo});\">Upload to Manager</a> </td> </tr> <tr ng-show=\"!loading && !filtered.length\"> <td colspan=\"{{canUpload ? 4 : 3}}\">No Data Found</td> </tr> <tr ng-show=\"loading\"> <td colspan=\"{{canUpload ? 4 : 3}}\">Loading...</td> </tr> </table> </div>"
  );


  $templateCache.put('upload_tpl.html',
    "<div class=\"modal-backdrop\"></div> <div class=\"modal\"> <div class=\"modal-dialog\"> <div class=\"modal-content no-header\"> <div class=\"modal-body\"> <form novalidate name=\"$parent.blueprintForm\"> <label> Blueprint ID<br> <input type=\"text\" ng-model=\"blueprint.id\" placeholder=\"enter blueprint name\" required> </label> <label> Manager Endpoint URL<br> <input type=\"url\" ng-model=\"$parent.managerEndpoint\" placeholder=\"enter manager url\" required> </label> <label> Blueprint File Name<br> <select ng-model=\"blueprint.path\" ng-options=\"b for b in uploadRepo.blueprintFiles[uploadRepo.currentVersion.name]\" required> </select> </label> <label class=\"archive-url\"> Source<br> <select ng-model=\"uploadRepo.currentVersion\" ng-change=\"selectNewVersion(uploadRepo.currentVersion);\" ng-options=\"v as v.name for v in uploadRepo.versionsList\" required> </select> <a href class=\"clipboard\" copy-to-clipboard data-text=\"blueprint.url\" style=\"float: right\">Copy to Clipboard</a> </label> <div class=\"alert alert-danger\" ng-show=\"error\">{{error}}</div> </form> <div class=\"modal-buttons\"> <button class=\"btn btn-default\" ng-disabled=\"processing\" ng-click=\"closeUpload();\">Cancel</button> <button class=\"btn btn-primary\" ng-disabled=\"processing || blueprintForm.$invalid\" ng-click=\"uploadBlueprint();\"> <span ng-show=\"processing\">Uploading...</span> <span ng-hide=\"processing\">Upload</span> </button> </div> </div> </div> </div> </div>"
  );

}]);
