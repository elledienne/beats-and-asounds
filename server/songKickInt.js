var request = require('request');

var supersecret = require('./config.js');

var api_key = supersecret.api_key;

module.exports.findConcerts = function(metroID, metroName, callback) {
  var songKickOptions = {
    url: 'http://api.songkick.com/api/3.0/metro_areas/' + metroID + '/calendar.json?apikey=' + api_key + '&per_page=all',
    json: true
  };
  request.get(songKickOptions, function(error, response, body) {
    cache = body.resultsPage.results;
    callback(body.resultsPage.results);
  });
};

module.exports.findMyMetroArea = function(location, callback) {
  var locationOptions = {
    url: 'http://api.songkick.com/api/3.0/search/locations.json?location=geo:' + location[0] + ',' + location[1] + '&apikey=' + api_key,
    json: true
  };
  request.get(locationOptions, function(error, response, body) {
    callback(body.resultsPage.results.location[0].metroArea.id, body.resultsPage.results.location[0].metroArea.displayName);
  })
};
