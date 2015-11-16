var db = require('../db/connect.js');
var Promise = require('bluebird');
var update = require('../songKickInt.js');

var frequency = '7 SECOND';
var q = {
  deleteOlderThanToday: "DELETE FROM concert WHERE datetime < NOW() AND datetime != ''",
  deleteOldJoin: "DELETE cp FROM concert_performer AS cp INNER JOIN concert AS c ON c.concert_id = cp.concert_id WHERE c.datetime < NOW() AND c.datetime != ''",
  findAreasToUpdate: "SELECT sk_id FROM metroarea WHERE last_update + INTERVAL " + frequency + " < NOW()",
  updateAreasDate: "UPDATE metroarea SET last_update = NOW() WHERE last_update + INTERVAL " + frequency + " < NOW()"
};

var deleteExpiredEvents = function(){
  // FOR DEVELOPMENT ONLY
  // var deleteOlderThanToday = "SELECT concert_id FROM concert WHERE datetime < NOW() AND datetime != ''";
  // var deleteOldJoin = "SELECT cp.concert_id FROM concert_performer AS cp INNER JOIN concert AS c ON c.concert_id = cp.concert_id WHERE c.datetime < NOW() AND c.datetime != ''";
  // FOR PRODUCTION
  // var deleteOlderThanToday = "DELETE FROM concert WHERE datetime < NOW() AND datetime != ''";
  // var deleteOldJoin = "DELETE cp FROM concert_performer AS cp INNER JOIN concert AS c ON c.concert_id = cp.concert_id WHERE c.datetime < NOW() AND c.datetime != ''";

  db.query(q.deleteOldJoin, [], function(err, rows, fields) {
    if (err) throw err;
    //console.log(rows.length);
    db.query(q.deleteOlderThanToday, [], function(err, rows, fields) {
      if(err) throw err;
      console.log(rows);
    });
  });
};

var updateOldByAreas = function(){
  // In order for this to work i've to create a new column in the area table where to store 
  // the last update date.
  // FOR DEVELOPMENT ONLY
  // var findAreasToUpdate = "SELECT sk_id FROM metroarea WHERE last_update + INTERVAL 7 SECOND < NOW()";
  // FOR PRODUCTION
  // var findAreasToUpdate = "SELECT sk_id FROM metroarea WHERE last_update + INTERVAL 7 DAY < NOW()";
  db.query(q.findAreasToUpdate, [], function(err, rows, fields) {
    if (err) throw err;
    var concertsPromises = [];
    rows.forEach(function(area) {
      //console.log('area id: ', area.sk_id);
      concertsPromises.push(update.findConcerts(area.sk_id));
    });

    return Promise.all(concertsPromises)
      .then(function() {
        console.log('UPDATE DONE!');
        // var updateAreasDate = "UPDATE metroarea SET last_update = NOW() WHERE last_update + INTERVAL 7 SECOND < NOW()";
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
