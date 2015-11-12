angular.module('beatssounds', [
  'beatssounds.services',
  'beatssounds.playlists',
  'beatssounds.following',
  'ngRoute'
])
.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'playlists/playlists.html',
      controller: 'playlistsController'
    })
    .when('/loginpage', {
      templateUrl: 'loginView.html'
    })
    .when('/playlists', {
      templateUrl: 'playlists/playlists.html',
      controller: 'playlistsController'
    })
    .when('/following', {
      templateUrl: 'following/following.html',
      controller: 'followingController'
    })
    .otherwise({
      redirectTo: '/'
    })
});
