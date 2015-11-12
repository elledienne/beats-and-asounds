angular.module('beatssounds.concerts', ['ui.bootstrap'])
  .controller('concertsController', function ($scope, auth, time, space) {

    $scope.parseMonth = function(date) {
      return time.parseMonth(date);
    };
    $scope.parseDay = function(date) {
      return time.parseDay(date);
    };

    $scope.findBilling = function(name, acts) {
      for (var i = 0; i < acts.length; i++) {
        if (acts[i].displayName === name) {
          return acts[i].billing;
        }
      }
    };

    $scope.isFavorite = function(event) {
      return event.myCount > 5 ? 'favorite' : '';
    }

    /// GET BASED ON PLAYLISTS ===============================
    $scope.getPlaylists = function() {
      this.isLoading = true;
      auth.getPlaylists().then(function(resp) {
        $scope.isLoading = false;
        $scope.data = resp;
        $scope.paginate();
      })
    };

    /// GET BASED ON FOLLOWING ===============================
    $scope.getPlaylists = function() {
      this.isLoading = true;
      auth.getFollowing().then(function(resp) {
        $scope.isLoading = false;
        $scope.data = resp;
        $scope.paginate();
      })
    };

    /// FIND SIMILAR BASED ON ARTIST ========================
    $scope.getSimilar = function (artist) {
      this.isLoading = true;
      auth.getSimilar(artist).then (function (resp) {
        $scope.isLoading = false;
        $scope.data = resp;
        $scope.paginate();
      })
    };

    /// LOCATION DETECTION ==================================
    if (!localStorage.getItem('location')) {
      space.findLocation(function() {
        $scope.getPlaylists();
      });
    } else {
      $scope.getPlaylists();
    }

    /// PAGINATION ==========================================
    $scope.itemsPerPage = 4
    $scope.currentPage = 1;


    $scope.paginate = function () {
      $scope.totalItems = $scope.data.length;
      $scope.$watch('currentPage + itemsPerPage', function() {
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        $scope.filteredEvents = $scope.data.slice(begin, end);
      
        var counter = $scope.data.length / $scope.itemsPerPage;
        if ($scope.currentPage <= counter) {
          $scope.showing = $scope.itemsPerPage;
        } else {
          $scope.showing = $scope.data.length;
        }
      });
    };
  });
