var Promise = require('bluebird');

var db = require('./connect.js');

var querySync = Promise.promisify(db.query);

module.exports.insertHandler = function(concerts){
  var concertPromises = [];
  concerts.forEach(function(concert) {
    var venue = concerts.venue;
    var metroarea = venue.metroArea;
    var headline_id;

    var performerPromises = [];
    concert.performance.forEach(function(performance) {
      var artist = performance.artist;
      var performerQueryString = "INSERT INTO performer (performer_id, name, uri) \
                                  VALUES (?, ?, ?)";
      if(artist.billing === 'headline'){
        headline_id = artist.id;
      }
      var performerParams = [artist.id, artist.displayName, artist.uri]; // (artist.id, artist.displayName, artist.uri)
      performerPromises.push(
        querySync(performerQueryString, performerParams)
          .then(function() {
            var joinTableQueryString = "INSERT INTO concert_performer (concert_id, performer_id) VALUES (?, ?)";
            var joinParams = [concert.id, artist.id]; //(concert_id, artist.id)
            querySync(joinTableQueryString, joinParams);
          })
        );
    });

    Promise.all(performerPromises)
    .then(function() {
      var metroAreaQueryString = "INSERT INTO metroarea (sk_id, area) VALUES (?, ?)";
      var metroParams = [metroarea.id, metroarea.displayName]; //(metroArea.id, metroArea.displayName)
      return querySync(metroAreaQueryString, metroParams);
    })
    .then(function() {
      var venueQueryString = "INSERT INTO venue (sk_id, name, uri) VALUES (?, ?, ?)";
      var venueParams =  [venue.id, venue.displayName, venue.uri]; //(venue.id, venue.displayName, venue.uri)
      return querySync(venueQueryString, venueParams);
    })
    .then(function() {
      var concertQueryString = "INSERT INTO concert (concert_id, name, type, uri, datetime, popularity, venue_id, headline_id, metroarea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      var concertParams = [concert.id, concert.displayName, concert.type, concert.uri, concert.start.datetime, concert.popularity, venue.id, headline_id, metroarea_id]; //(id, displayName, type, uri, start.datetime, popularity, venue.id, HEADLINE_ID, metroarea_id)
      return querySync(concertQueryString, concertParams);

    })
  })
  console.log(JSON.stringify(concerts.event[0]));
  

  

};




