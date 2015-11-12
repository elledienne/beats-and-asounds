angular.module('beatssounds', ['beatssounds.services', 'beatssounds.concerts', 'ngRoute'])

.config(function($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'concertView.html',
      controller: 'concertController'
    })
    .when('/loginpage', {
      templateUrl: 'loginView.html'
    })
  // .otherwise({
  //   redirectTo: '/'
  // })
});
