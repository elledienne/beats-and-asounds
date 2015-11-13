var Promise = require('bluebird');

var db = require('./connect.js');

// ER_DUP_ENTRY: Duplicate entry '213' for key 'PRIMARY'

var queryAsync = function(queryString, queryParams) {
  return new Promise(function(resolve, reject) {
    db.query(queryString, queryParams, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        //console.log(fields)
        resolve(rows);
      }
    })
  })
}

//db.query('INSERT INTO performer (performer_id, name, uri) VALUES (213, "lor", "lor")');

module.exports.insertHandler = function(concerts){
  queryAsync('select * from performer').then(function(rows) {
    console.log('Our rows:', rows);
  })
  .catch(function(err) {
    console.log(err);
  })

  var concertPromises = [];
  //console.log('CONCERTS:', concerts)
  concerts.event.forEach(function(concert) {
    var venue = concert.venue;
    var metroarea = venue.metroArea;
    var headline_id;

    var performerPromises = [];
    concert.performance.forEach(function(performance) {
      var artist = performance.artist;
      var performerQueryString = "INSERT IGNORE INTO performer (performer_id, name, uri) \
                                  VALUES (?, ?, ?)";
      if(artist.billing === 'headline'){
        headline_id = artist.id;
      }
      var performerParams = [artist.id, artist.displayName, artist.uri]; // (artist.id, artist.displayName, artist.uri)
      performerPromises.push(
        queryAsync(performerQueryString, performerParams)
      );
        //   .then(function() {
        //     console.log('concert_id', concert.id)
        //     console.log('performer_id', artist.id)
        //     var joinTableQueryString = "INSERT IGNORE INTO concert_performer (concert_id, performer_id) VALUES (?, ?)";
        //     var joinParams = [concert.id, artist.id]; //(concert_id, artist.id)
        //     return queryAsync(joinTableQueryString, joinParams);
        //   }).catch(function(err){
        //     console.log('ERROR:', err);
        //   })
        // );
    });

    return Promise.all(performerPromises)
      .then(function() {
        var metroAreaQueryString = "INSERT IGNORE INTO metroarea (sk_id, area) VALUES (?, ?)";
        var metroParams = [metroarea.id, metroarea.displayName]; //(metroArea.id, metroArea.displayName)
        return queryAsync(metroAreaQueryString, metroParams);
      })
      .then(function() {
        var venueQueryString = "INSERT IGNORE INTO venue (sk_id, name, uri) VALUES (?, ?, ?)";
        var venueParams =  [venue.id, venue.displayName, venue.uri]; //(venue.id, venue.displayName, venue.uri)
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
          var joinParams = [concert.id, artist.id]; //(concert_id, artist.id)
          joinPromises.push(
            queryAsync(joinTableQueryString, joinParams)
          );
        });
        return Promise.all(joinPromises);
      })
  })
  console.log("------------------",JSON.stringify(concerts.event[0]));
  

  

};




