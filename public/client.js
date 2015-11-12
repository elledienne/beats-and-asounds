angular.module('beatssounds', [
  'beatssounds.services',
  'beatssounds.concerts',
  'ngRoute'
])
.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'concertView.html',
      controller: 'concertController'
    })
    .when('/loginpage', {
      templateUrl: 'loginView.html'
    })
    .when('/playlists', {
      templateUrl: 'concertView.html',
      controller: 'concertController'
    })
    .otherwise({
      redirectTo: '/'
    })
});
