var _ = require('underscore');

var Promise = require('bluebird');
var util = require('../utils.js');
var db = require('./connect.js');
var q = require('./queryHelper.js');


var queryAsync = function(queryString, queryParams) {
  return new Promise(function(resolve, reject) {
    db.query(queryString, queryParams, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    })
  })
}

module.exports.insertHandler = function(concerts) {

  var concertPromises = [];

  concerts.event.forEach(function(concert) {
    var venue = concert.venue;
    var metroarea = venue.metroArea;
    var performerPromises = [];

    var headline_id;
    var artist;

    concert.performance.forEach(function(performance) {
      artist = performance.artist;

      if (artist.billing === 'headline') {
        headline_id = artist.id;
      }
      var performerParams = [artist.id, artist.displayName, artist.uri];
      performerPromises.push(
        queryAsync(q.performer, performerParams)
      );
    });

    return Promise.all(performerPromises)
      .then(function() {
        var metroParams = [metroarea.id, metroarea.displayName];
        return queryAsync(q.metroarea, metroParams);
      })
      .then(function() {
        var venueParams = [venue.id, venue.displayName, venue.uri];
        return queryAsync(q.venue, venueParams);
      })
      .then(function() {
        var concertParams = [concert.id, concert.displayName, concert.type, concert.uri, concert.start.date, concert.popularity, venue.id, headline_id, metroarea.id];
        return queryAsync(q.concert, concertParams);
      })
      .then(function() {
        var joinPromises = [];
        var artist;
        var joinParams;

        concert.performance.forEach(function(performance) {
          artist = performance.artist;
          joinParams = [concert.id, artist.id];
          joinPromises.push(
            queryAsync(q.join, joinParams)
          );
        });
        return Promise.all(joinPromises);
      });
  });
};

module.exports.addUserToDatabase = function(access_token, refresh_token, userID) {
  var selectParams = [userID];
  return queryAsync(q.userSelect, selectParams)
    .then(function(potentialUser) {
      if (!potentialUser.length) {
        var insertParams = [access_token, refresh_token, userID];
        return queryAsync(q.userInsert, insertParams);
      } else {
        return;
      }
    });
};

module.exports.findUserInDatabase = function(userID) {
  var params = [userID];
  return queryAsync(q.userFetch, params);
};

module.exports.checkForMetroID = function(metroID) {
  var params = [metroID];
  return queryAsync(q.metroFetch, params);
};

module.exports.fetchShows = function(artists, metroID) {
  var concertPromises = []
  for (artist in artists) {
    var params = [metroID, artist];
    concertPromises.push(queryAsync(q.concertFetch, params))
  }
  return Promise.all(concertPromises).then(function(concerts) {
    var toSend = _.flatten(concerts);
    return util.assembleResponse(artists, toSend);
  });

};
