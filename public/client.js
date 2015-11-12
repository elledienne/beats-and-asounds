angular.module('beatssounds', [
  'beatssounds.services',
  'beatssounds.concerts',
  'ngRoute'
])
.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'concerts/concerts.html',
      controller: 'concertsController'
    })
    .when('/loginpage', {
      templateUrl: 'loginView.html'
    })
    .when('/playlists', {
      templateUrl: 'concerts/concerts.html',
      controller: 'concertsController'
    })
    .when('/following', {
      templateUrl: 'concerts/concerts.html',
      controller: 'concertsController'
    })
    .otherwise({
      redirectTo: '/'
    })
});
