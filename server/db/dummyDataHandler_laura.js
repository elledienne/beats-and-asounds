var db = require('./dummyData_laura.js');
var Promise = require('bluebird');

// var queryAsync = function(queryString, queryParams) {
//   return new Promise(function(resolve, reject) {
//     db.query(queryString, queryParams, function(err, rows, fields) {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(rows);
//       }
//     });
//   });
// }

// module.exports.addUserToDatabase = function(access_token, refresh_token, userID) {
//   var selectParams = [userID];
//   var selectQueryString = "SELECT * FROM user WHERE userID=?";
//   return queryAsync(selectQueryString, selectParams)
//     .then(function(potentialUser) {
//       if (!potentialUser.length) {
//         var insertParams = [access_token, refresh_token, userID];
//         var insertQueryString = "INSERT INTO user (access_token, refresh_token, userID) VALUES (?,?,?) END";
//         return queryAsync(insertQueryString, insertParams);
//       } else {
//         return;
//       }
//     });
// };

// module.exports.findUserInDatabase = function(userID) {
//   var params = [userID];
//   var queryString = "SELECT *  FROM user WHERE userID=?";
//   return queryAsync(queryString, params);
// };
