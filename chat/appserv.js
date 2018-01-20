var http = require('http');
var fs = require('fs');
var port = '3001';
var app = http.createServer(function(req,res){
	res.writeHead(200,{'Content-Type':'text/html'});
	res.end(fs.readFileSync(__dirname+'/clientio.html'));
});

app.listen(port, function(){
	console.log('App Server is running on *.'+port);
});

var io = require('socket.io').listen(app),
	nicknames = {};

io.sockets.on('connection', function (socket) {
	socket.on('user message', function (msg) {
		socket.broadcast.emit('user message', socket.nickname, msg);
	});

	socket.on('user typing', function (user) {
		socket.broadcast.emit('user typing', socket.nickname);
	});

	socket.on('nickname', function (nick, fn) {
		if (nicknames[nick]) {
			fn(true);
		} else {
			fn(false);
			nicknames[nick] = socket.nickname = nick;
			socket.broadcast.emit('announcement', nick + ' connected');
			io.sockets.emit('nicknames', nicknames);
		}
	});

	socket.on('disconnect', function () {
		if (!socket.nickname) return;

		delete nicknames[socket.nickname];
		socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
		socket.broadcast.emit('nicknames', nicknames);
	});
});


