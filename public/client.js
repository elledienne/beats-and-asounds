angular.module('beatssounds', [
  'beatssounds.services',
  'beatssounds.concerts',
  'ngRoute'
])
.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'playlists/concerts.html',
      controller: 'concertsController'
    })
    .when('/loginpage', {
      templateUrl: 'loginView.html'
    })
    .when('/concerts', {
      templateUrl: 'playlists/concerts.html',
      controller: 'concertsController'
    })
    .when('/similar', {
      templateUrl: 'playlists/concerts.html',
      controller: 'concertsController'
    })
    .otherwise({
      redirectTo: '/'
    })
});
