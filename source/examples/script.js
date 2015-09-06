// Code goes here

// angular.module('myApp',[]);

angular.module('cosmo-dipper',[], function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

angular.module('cosmo-dipper').controller('cosmo-dipper-ctrl', function($scope, MyService){
  
  function getTags(repo){
     MyService.getTags(repo.name).then(function success( result ){
        repo.tags = result.data;
      }, function error(result){
        
      });
  }
  
  MyService.getRepositories().then(function success(result){
    
    $scope.repositories = result.data;
    
    _.each($scope.repositories.items, getTags);
    
  }, function error( result ){
    
  })
  
});

angular.module('cosmo-dipper').service('MyService', function($http ){
  
  this.getRepositories = function(){
    return $http({ 'method' : 'GET', 'url' : 'https://api.github.com/search/repositories?q=*-example+user:cloudify-cosmo' });
  }
  
  this.getTags = function(repository){
    return $http({ 'method' : 'GET', 'url' : 'https://api.github.com/repos/cloudify-cosmo/' + repository  + '/tags' });
  }
  
});
