var db = require('../db/connect.js');
var Promise = require('bluebird');
var update = require('../songKickInt.js');

var frequency = '7 SECOND';
var q = {
  // FOR DEVELOPMENT ONLY
  // deleteOlderThanToday: "SELECT concert_id FROM concert WHERE datetime < NOW() AND datetime != ''",
  // deleteOldJoin: "SELECT cp.concert_id FROM concert_performer AS cp INNER JOIN concert AS c ON c.concert_id = cp.concert_id WHERE c.datetime < NOW() AND c.datetime != ''",
  // In order for this to work i've to create a new column in the area table where to store 
  // the last update date.
  // var findAreasToUpdate = "SELECT sk_id FROM metroarea WHERE last_update + INTERVAL " + frequency + " < NOW()",
  deleteOlderThanToday: "DELETE FROM concert WHERE datetime < NOW() AND datetime != ''",
  deleteOldJoin: "DELETE cp FROM concert_performer AS cp INNER JOIN concert AS c ON c.concert_id = cp.concert_id WHERE c.datetime < NOW() AND c.datetime != ''",
  findAreasToUpdate: "SELECT sk_id FROM metroarea WHERE last_update + INTERVAL " + frequency + " < NOW()",
  updateAreasDate: "UPDATE metroarea SET last_update = NOW() WHERE last_update + INTERVAL " + frequency + " < NOW()"
};

var deleteExpiredEvents = function(){
  db.query(q.deleteOldJoin, [], function(err, rows, fields) {
    if (err) throw err;
    db.query(q.deleteOlderThanToday, [], function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
    });
  });
};

var updateOldByAreas = function(){
  db.query(q.findAreasToUpdate, [], function(err, rows, fields) {
    if (err) throw err;
    var concertsPromises = [];
    rows.forEach(function(area) {
      concertsPromises.push(update.findConcerts(area.sk_id));
    });

    return Promise.all(concertsPromises)
      .then(function() {
        console.log('UPDATE DONE!');
        db.query(q.updateAreasDate, [], function(err, rows, fields) {
          if(err) throw err;
          //console.log(rows);
        });
      })
      .catch(function (err) {
        console.log('ERR', err);
      });
  });
};

module.exports = {
  deleteExpiredEvents: deleteExpiredEvents,
  updateOldByAreas: updateOldByAreas
};
