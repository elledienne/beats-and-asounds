var Promise = require('bluebird');

var db = require('./connect.js');

var querySync = Promise.promisify(db.query);

module.exports.insertHandler = function(concerts){
  var concertPromises = [];
  concerts.forEach(function(concert) {
    var performerPromises = [];
    concert.performers.forEach(function(performer) {
      var performerQueryString = "INSERT INTO performer (performer_id, name, uri) VALUES (artist.id, artist.displayName, artist.uri)";
      performerPromises.push(querySync(performerQueryString)
        .then(function() {
          var joinTableQueryString = "INSERT INTO concert_performer (concert_id, performer_id) VALUES (concert_id, artist.id)"
        }));
    })
    Promise.all(performerPromises)
    .then(function() {
      var metroAreaQueryString = "INSERT INTO metroarea (sk_id, area) VALUES (metroArea.id, metroArea.displayName)";
      return querySync(metroAreaQueryString);
    })
    .then(function() {
      var venueQueryString = "INSERT INTO venue (sk_id, name, uri) VALUES (venue.id, venue.displayName, venue.uri)";
      return querySync(venueQueryString);
    })
    .then(function() {
      var concertQueryString = "INSERT INTO concert (concert_id, name, type, uri, datetime, popularity, venue_id, headline_id, metroarea_id) VALUES (id, displayName, type, uri, start.datetime, popularity, venue.id, HEADLINE_ID, metroarea_id)";
      return querySync(concertQueryString);
    })
  })
  console.log(JSON.stringify(concerts.event[0]));
  

  

};




