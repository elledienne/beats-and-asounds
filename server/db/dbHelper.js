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
  var selectQueryString = "SELECT * FROM user WHERE userID=?";
  return queryAsync(selectQueryString, selectParams)
    .then(function(potentialUser) {
      if (!potentialUser.length) {
        var insertParams = [access_token, refresh_token, userID];
        var insertQueryString = "INSERT INTO user (access_token, refresh_token, userID) VALUES (?,?,?)";
        return queryAsync(insertQueryString, insertParams);
      } else {
        return;
      }
    });
};

module.exports.findUserInDatabase = function(userID) {
  var params = [userID];
  var queryString = "SELECT *  FROM user WHERE userID=?";
  return queryAsync(queryString, params);
};

module.exports.checkForMetroID = function(metroID) {
  console.log(metroID);
  var params = [metroID];
  var queryString = "SELECT * FROM metroarea WHERE sk_id = ?"
  return queryAsync(queryString, params);
};

module.exports.fetchShows = function(artists, metroID) {
  console.log("here");
  var concertPromises = []
  for (artist in artists) {
    console.log(artist, "artist");
    var params = [metroID, artist];
    var queryString = "SELECT c.concert_id, c.concert_name, c.type, c.concert_uri, c.datetime, c.concert_popularity, c.metroarea_id, p.performer_name, p.performer_uri, m.area, v.venue_name, v.venue_uri FROM concert c INNER JOIN concert_performer cp ON(c.concert_id = cp.concert_id) INNER JOIN performer p ON(cp.performer_id = p.performer_id) INNER JOIN metroarea m ON(c.metroarea_id = m.sk_id) INNER JOIN venue v ON(c.venue_id = v.sk_id) WHERE m.sk_id = ? AND p.performer_name = ?";
    concertPromises.push(queryAsync(queryString, params))
  }
  return Promise.all(concertPromises).then(function(concerts) {
    var toSend = _.flatten(concerts);
    console.log(toSend);
    console.log(concerts);

    util.assembleResponse(artists, toSend);
  });

}
