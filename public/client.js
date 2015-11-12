angular.module('beatssounds', [
  'beatssounds.services',
  'beatssounds.playlists',
  'beatssounds.following',
  'ngRoute'
])
.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
<<<<<<< HEAD
      templateUrl: 'concerts/concerts.html',
      controller: 'concertsController'
=======
      templateUrl: 'playlists/playlists.html',
      controller: 'playlistsController'
>>>>>>> 6154dd2b1088c0dbe88f4614a945615b148394aa
    })
    .when('/loginpage', {
      templateUrl: 'loginView.html'
    })
    .when('/playlists', {
<<<<<<< HEAD
      templateUrl: 'concerts/concerts.html',
      controller: 'concertsController'
    })
    .when('/following', {
      templateUrl: 'concerts/concerts.html',
      controller: 'concertsController'
=======
      templateUrl: 'playlists/playlists.html',
      controller: 'playlistsController'
    })
    .when('/following', {
      templateUrl: 'following/following.html',
      controller: 'followingController'
>>>>>>> 6154dd2b1088c0dbe88f4614a945615b148394aa
    })
    .otherwise({
      redirectTo: '/'
    })
});
