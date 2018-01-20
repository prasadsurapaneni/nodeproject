var fs = require('fs');
var http = require('http');

var server = http.createServer(function(req,res){
	res.writeHead(200,{'Content-type':'text/html'});
	res.end(fs.readFileSync(__dirname+'/index.html'));
	//res.sendFile(__dirname+'/index.html');
});

server.listen(3001,function(){
console.log('Listening on *:3001');
});

var socketio = require('socket.io').listen(server);
socketio.sockets.on('connection',function(socket){
	//console.log('A User Connected');
	socket.on('message',function(msg){
		//console.log('Message Received: ', msg);
		//socket.broadcast.emit('message', msg);
		socketio.sockets.emit('message', msg);
	});
});

/*
  5   <script>
  6         $(function(){
  7             var iosocket = io.connect();
  8             iosocket.on('connect', function () {
  9                 $('#incomingChatMessages').append($('<li>Connected</li>'));
 10                 iosocket.on('message', function(message) {
 11                     $('#incomingChatMessages').append($('<li></li>').text(message));
 12                 });
 13                 iosocket.on('disconnect', function() {
 14                     $('#incomingChatMessages').append('<li>Disconnected</li>');
 15                 });
 16             });
 17             $('#outgoingChatMessage').keypress(function(event) {
 18                 if(event.which == 13) {
 19                     event.preventDefault();
 20                     iosocket.send($('#outgoingChatMessage').val());
 21                     $('#incomingChatMessages').append($('<li></li>').text($('#outgoingChatMessage').val()));
 22                     $('#outgoingChatMessage').val('');
 23                 }
 24             });
 25         });
 26     </script>
*/


