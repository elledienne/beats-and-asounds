// HANDLES USER AUTHENTICATION ============================
angular.module('beatssounds.services', [])
  .factory('auth', function($http, $location) {

    var locationData = JSON.parse(localStorage.getItem("location"));
    var getPlaylists = function() {
      return $http({
          method: 'GET',
          url: '/myconcerts', // change to /myplaylists
          params: {
            location: locationData
          }
        })
        .then(function (resp) {
          if (resp.data === "go to login") {
            $location.path('/loginpage');
          } else {
            return resp.data;
          }
        });
    };
    var getFollowing = function() {
      return $http({
          method: 'GET',
          url: '/myconcerts', // change to /myfollowing
          params: {
            location: locationData
          }
        })
        .then(function (resp) {
          if (resp.data === "go to login") {
            $location.path('/loginpage');
          } else {
            return resp.data;
          }
        });
    };
    var getSimilar = function (artist) {
      return $http({
        method: 'GET',
        url: '/myconcerts', // change to /similar
        params: {
          artist: artist
        }
      })
      .then(function (resp) {
        if (resp.data === "go to login") {
          $location.path('/loginpage');
        } else {
          return resp.data;
        }
      });
    };
    return {
      getPlaylists: getPlaylists,
      getFollowing: getFollowing,
      getSimilar: getSimilar
      // logout: logout
    };
  })

// HANDLES TIME CALCULATION ==============================
.factory('time', function() {
  var convertMonth = function(num) {
    var names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return names[num - 1];
  };
  var parseDate = function(date) {
    return date.split('-');
  }
  var parseMonth = function(date) {
    var month = this.parseDate(date)[1];
    return this.convertMonth(month);
  };
  var parseDay = function(date) {
    return this.parseDate(date)[2];
  };
  return {
    convertMonth: convertMonth,
    parseDate: parseDate,
    parseMonth: parseMonth,
    parseDay: parseDay
  };
})

// HANDLES USER GEOLOCATION ==============================
.factory('space', function() {
  var findLocation = function(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        localStorage.setItem("location", JSON.stringify([position.coords.latitude, position.coords.longitude]));
        callback();
      });
    } else {
      localStorage.setItem("location", "");
      callback();
    }
  };

  return {
    findLocation: findLocation
  }
});
