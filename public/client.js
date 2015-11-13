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
      templateUrl: 'loginView.html',
      controller: 'concertsController'
    })
    .when('/playlists', {
      templateUrl: 'playlists/concerts.html',
      controller: 'concertsController'
    })
    .when('/following', {
      templateUrl: 'playlists/concerts.html',
      controller: 'concertsController'
    })
    .otherwise({
      redirectTo: '/'
    })
});
