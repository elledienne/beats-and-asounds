var Promise = require('bluebird');

var db = require('./connect.js');


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
    var headline_id;

    var performerPromises = [];
    concert.performance.forEach(function(performance) {
      var artist = performance.artist;
      var performerQueryString = "INSERT IGNORE INTO performer (performer_id, name, uri) \
                                  VALUES (?, ?, ?)";
      if (artist.billing === 'headline') {
        headline_id = artist.id;
      }
      var performerParams = [artist.id, artist.displayName, artist.uri];
      performerPromises.push(
        queryAsync(performerQueryString, performerParams)
      );
    });

    return Promise.all(performerPromises)
      .then(function() {
        var metroAreaQueryString = "INSERT IGNORE INTO metroarea (sk_id, area) VALUES (?, ?)";
        var metroParams = [metroarea.id, metroarea.displayName];
        return queryAsync(metroAreaQueryString, metroParams);
      })
      .then(function() {
        var venueQueryString = "INSERT IGNORE INTO venue (sk_id, name, uri) VALUES (?, ?, ?)";
        var venueParams = [venue.id, venue.displayName, venue.uri];
        return queryAsync(venueQueryString, venueParams);
      })
      .then(function() {
        var concertQueryString = "INSERT IGNORE INTO concert (concert_id, name, type, uri, datetime, popularity, venue_id, headline_id, metroarea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        var concertParams = [concert.id, concert.displayName, concert.type, concert.uri, concert.start.datetime, concert.popularity, venue.id, headline_id, metroarea.id]; //(id, displayName, type, uri, start.datetime, popularity, venue.id, HEADLINE_ID, metroarea_id)
        return queryAsync(concertQueryString, concertParams);
      })
      .then(function() {
        var joinPromises = [];
        concert.performance.forEach(function(performance) {
          var artist = performance.artist;
          var joinTableQueryString = "INSERT IGNORE INTO concert_performer (concert_id, performer_id) VALUES (?, ?)";
          var joinParams = [concert.id, artist.id];
          joinPromises.push(
            queryAsync(joinTableQueryString, joinParams)
          );
        });
        return Promise.all(joinPromises);
      })
  })
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
