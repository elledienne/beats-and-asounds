var request = require('request');

var supersecret = require('./config.js');

var api_key = supersecret.api_key;

var cache;
module.exports.findConcerts = function(callback) {
  if (cache) {
    callback(cache);
  } else {
    var songKickOptions = {
      url: 'http://api.songkick.com/api/3.0/metro_areas/26330/calendar.json?apikey=' + api_key + '&per_page=50',
      json: true
    }
    request.get(songKickOptions, function(error, response, body) {
      cache = body.resultsPage.results;
      callback(body.resultsPage.results);
    });
  }
};
