var request = require('request');

var supersecret = require('./config.js');

var api_key = supersecret.api_key;

module.exports.findConcerts = function(callback) {
  var songKickOptions = {
    url: 'http://api.songkick.com/api/3.0/metro_areas/26330/calendar.json?apikey=' + api_key + '&per_page=50',
    json: true
  }
  request.get(songKickOptions, function(error, response, body) {
    callback(body.resultsPage.results);
  });
};
