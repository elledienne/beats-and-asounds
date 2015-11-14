var request = require('request');

var supersecret = require('./config.js');
var util = require('./utils');

var query = require('./db/dbHelper.js');
var api_key = supersecret.api_key;

var SF_METRO_ID = 26330;


//Request all concerts for a given metroarea
//https://www.songkick.com/developer/upcoming-events-for-metro-area
//NOTE that this call takes a *long* time (~15 seconds), which is why we're storing concerts in the database for subsequent lookups
module.exports.findConcerts = function(metroID) {
  var songKickOptions = {
    url: 'http://api.songkick.com/api/3.0/metro_areas/' + metroID + '/calendar.json?apikey=' + api_key + '&per_page=all',
    json: true
  };
  return util.buildPromise(songKickOptions).then(function(body) {
    console.log(body.resultsPage.results.event.length);
    query.insertHandler(body.resultsPage.results);
  });
};

//Find nearest metroarea for a given [latitude, longitude]
//https://www.songkick.com/developer/location-search
module.exports.findMyMetroArea = function(location) {
  //If no location is provided, default to SF.  The value is wrapped in a promise in order to not break the promise chain in the request handler (the first function in the chain must return a promise and not a regular value)
  if (!location) {
    return Promise.resolve(SF_METRO_ID);
  }
  var locationOptions = {
    url: 'http://api.songkick.com/api/3.0/search/locations.json?location=geo:' + location[0] + ',' + location[1] + '&apikey=' + api_key,
    json: true
  };
  return util.buildPromise(locationOptions).then(function(body) {
    return body.resultsPage.results.location[0].metroArea.id;
  });
};
