var mysql = require('mysql');

var dbConncetion = mysql.createConnection({
  user: "root",
  password: "lor",
  database: "chubbySongDB"
});

// Connecting to db, see connect.js for details
dbConncetion.connect();

module.exports = dbConncetion;