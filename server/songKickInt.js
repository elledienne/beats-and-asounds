var request = require('request');

var supersecret = require('./config.js');
var util = require('./utils');

var api_key = supersecret.api_key;

module.exports.findConcerts = function(metroID, callback) {
  var songKickOptions = {
    url: 'http://api.songkick.com/api/3.0/metro_areas/' + metroID + '/calendar.json?apikey=' + api_key + '&per_page=all',
    json: true
  };

  return util.buildPromise(songKickOptions).then(function(body) {
    return body.resultsPage.results;
  });
};

module.exports.findMyMetroArea = function(location, callback) {
  var locationOptions = {
    url: 'http://api.songkick.com/api/3.0/search/locations.json?location=geo:' + location[0] + ',' + location[1] + '&apikey=' + api_key,
    json: true
  };
  return util.buildPromise(locationOptions).then(function(body) {
    return body.resultsPage.results.location[0].metroArea.id;
  });
};
