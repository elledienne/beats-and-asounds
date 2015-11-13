var db = require('./connect.js');

var deleteExpiredEvents = function(){
  var todayDate = new Date().toISOString()
  var selectOlderThanToday = "SELECT * from concert WHERE date_format < NOW()";
  
  db.query(selectOlderThanToday, queryParams, function(err, rows, fields) {
    if (err) {
      throw err;
    }



  });
}