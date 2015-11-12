var mysql = require('mysql');

var dbConncetion = mysql.createConnection({
  user: "root",
  password: "lor",
  database: "chubbySongDB"
});

module.exports = dbConncetion;