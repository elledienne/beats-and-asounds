angular.module('beatssounds.services', [])
  .factory('auth', function($http, $location) {
    var getConcerts = function() {
      return $http({
          method: 'GET',
          url: '/myconcerts',
        })
        .then(function(resp) {
          if (resp.data === "go to login") {
            $location.path('/loginpage');
          } else {
            return resp.data;
          }
        });
    };
    return {
      getConcerts: getConcerts
    };
  })

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
});
