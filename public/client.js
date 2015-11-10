angular.module('beatssounds', ['ngRoute'])

.config(function($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'concertView.html',
      controller: 'concertController'
    })
    .when('/loginpage', {
      templateUrl: 'loginView.html',
      controller: 'authController'
    })
    .otherwise({
      redirectTo: '/'
    })
})

.factory('auth', function($http, $location, $window) {
  var getConcerts = function() {
    return $http({
        method: 'GET',
        url: '/myconcerts',
      })
      .then(function(resp) {
        return resp.data;
      });
  };

  var convertMonth = function(num) {
    var names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return names[num - 1];
  }
  return {
    getConcerts: getConcerts,
    convertMonth: convertMonth
  };
})


.controller('concertController', function($scope, $location, auth) {
  $scope.data = [];

  $scope.parseDate = function(date) {
    return date.split('-');
  }
  $scope.parseMonth = function(date) {
    var month = $scope.parseDate(date)[1];
    return auth.convertMonth(month);
  };
  $scope.parseDay = function(date) {
    return $scope.parseDate(date)[2];
  };

  $scope.focusIn = function() {
    this.focus = 'selected';
  };

  $scope.focusOut = function() {
    this.focus = '';
  };

  $scope.findBilling = function(name, acts) {
    for (var i = 0; i < acts.length; i++) {
      if (acts[i].displayName === name) {
        return acts[i].billing;
      }
    }
  };


  $scope.getConcerts = function() {
    return auth.getConcerts().then(function(resp) {
      console.log(resp);
      if (resp === "go to login") {
        $location.path('/loginpage');
      } else {
        $scope.data = resp;
      }
    })
  };

  $scope.getConcerts()



})



.controller('authController', function($scope) {

})
