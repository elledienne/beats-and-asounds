angular.module('beatssounds.concerts', [])
  .controller('concertController', function($scope, auth, time) {

    $scope.parseMonth = function(date) {
      return time.parseMonth(date);
    };
    $scope.parseDay = function(date) {
      return time.parseDay(date);
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

    $scope.isFavorite = function(event) {
      console.log(event)
      return event.myCount > 5 ? 'favorite' : '';
    }

    $scope.getConcerts = function() {
      this.isLoading = true;
      auth.getConcerts().then(function(resp) {
        console.log(resp);
        $scope.isLoading = false;
        $scope.data = resp;
      })
    };

    $scope.getConcerts()

  });
