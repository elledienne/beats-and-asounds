module.exports.insertHandler = function(concerts, callback){
  console.log(JSON.stringify(concerts.event[0]));
  // concerts.forEach(function(concert){

  // });
  

  callback(concerts);
};




