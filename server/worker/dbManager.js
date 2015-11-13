importScripts(__dirname + '/db/connect.js')

var deleteExpiredEvents = function(){

}

this.onmessage = function(event) {
  //postMessage('Hi ' + event.data);
  console.log(event.data);
  postMessage('sent back')
  self.close(); // TERMINATE THE WORKER !!!
}