var http = require('http');
var url = require('url');
var fs = require('fs');
var formidable = require('formidable');
var events = require('events');
var nodemailer = require('nodemailer');
var mysql = require('mysql');
var myMod = require('./mymodule');
var mongoClient = require('mongodb').MongoClient;

var server = http.createServer(function(req,res) {
	res.writeHead(200, {'content-type':'text/html'});
	// res.write('<h2>welcome to nodejs server...</h2>');
	res.write('<h3>current date and time:</h3>' + myMod.myDateTime() + '<br>');
	//res.write(req.url + '<br>');
	var q = url.parse(req.url, true);
	var eventEmitter = new events.EventEmitter();
	//mongo db connection establishment
	/* var mongoClient = mongo.mongoClient;*/
	var dburl = "mongodb://localhost:27017/mymongodb";
	mongoClient.connect(dburl, function(err, db) {
		if(err) throw err;
		console.log('mymongodb Database created');
		db.listCollections({name: 'myCol'}).next(function(err, colInfo){
			if(err) throw err;
			if(colInfo) {
				db.dropCollection('myCol', function(err, delOk){
					if(err) throw err;
					if(delOk) console.log('myCol Collection is dropped.');
				});
			}
		});
		db.createCollection("myCol", function(err, res) {
			if(err) throw err;
			console.log("myCol - Collection created");
			db.collection('myCol').ensureIndex({code:1},{unique:1, dropDups:1},function(err, res){
				if(err) throw err;
				console.log('Code field Indexed and made Unique');
			});
			var myDoc = [
				{code:"ABC", name:"ABC Company", address:"Hyderabad"},
				{code:"DEF", name:"DEF Company", address:"Vijayawada"},
				{code:"XYZ", name:"XYZ Company", address:"Vizag"},
			]
			db.collection('myCol').insertMany(myDoc, function(err, res) {
				if(err) throw err;
				console.log("Number of Documents Inserted: " + res.insertedCount);
			});
			var myqry = { code: "DEF"}
			var newvals = {$set: {code: "JKL", name: "JKL Company"}}
			db.collection('myCol').updateOne(myqry, newvals, function(err, res){
				if(err) throw err;
				console.log(JSON.stringify(res));
				console.log('document updated');
			});
			var delQry = { code: "DEF"};
			db.collection('myCol').deleteOne(delQry, function(err, obj) {
				if(err) throw err;
				console.log(delQry + 'Deleted...');
			});
			var sort = { code: -1};
			db.collection('myCol').find().sort(sort).limit(2).skip(1).toArray(function(err, result) {
				if(err) throw err;
				console.log(result);
			});

		});
	});

	//mysql connection establishment
	/* var con = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '677688'
	});
	con.connect(function(err) {
		if(err) throw err;
		//res.write('<br>Mysql Connection Established <br>');
		console.log('MySQL connection established...');
		con.query("create database if not exists nodedb", function(err, result) {
			if(err) throw err;
			console.log('Database Created');	
		});
		
		con.query("use nodedb");
		con.query("create table if not exists products (id int not null auto_increment primary key, prod_id varchar(20), prod_name varchar(50), prod_specs varchar(150))auto_increment=10000");
		for(var i=101; i<=105; i++) {
			con.query("insert into products (prod_id, prod_name, prod_specs) values (?,'Berger','abc, xyz') ",[i]);	
		}
		var insertSQL = "insert into products (prod_id, prod_name, prod_specs) values ?";
		var values = [
			['501','Pizza','jdasndkjsaf'],
			['502','Sandwich','ajnfdgsaf'],
			['503','Chicken Roll','nsfkjwnedfaf'],
			['504','Samosa','jdassfnksjnf'],
			['505','Spring Roll','jdafkckwjnf'],
		];
		con.query(insertSQL, [values], function(err, result) {
			if(err) throw err;
			console.log("No of Record Inserted: " + result.affectedRows);
			// console.log("Result Object: " + JSON.stringify(result));
		});
		con.query("Delete from products order by id limit 4 ");
		con.query("select * from products order by id ", function(err) {
			// console.log(arguments);
			if(err) throw err;
			// console.log(result);
			// console.log(fields);
		});
	}); */
	if(req.url== '/fileupload' ) {
		var form = formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			if(err) throw err;
			var tmpFile = files.filetoup.path;
			var up_dir = './uploadfiles';
			if(!fs.existsSync(up_dir)) fs.mkdirSync(up_dir);
			var newFile = up_dir + '/' + files.filetoup.name;
			fs.rename(tmpFile, newFile, function(err) {
				if(err) throw err;
				res.write('<br> File uploaded and moved...');
				eventEmitter.emit('readEvent',newFile);
				//res.end();
			});
		});
	} else {
		res.write('<form action=fileupload method=post enctype=multipart/form-data> ');
		res.write('<input type=file name=filetoup> <br>');
		res.write('<input type=submit>');
		res.end('</form>');
	}
	/*fs.writeFile(filename, "<br><br>append random string " + myMod.myRandNum(1001,9999), function(err) {
		if(err) throw err;
		console.log('file updated');
	});*/
	
	/*var rs = fs.createReadStream(filename);
	rs.on('open',function(){
		console.log('File '+ filename + ' is opened.' );
	});*/
	
	/*var myEventHandler = function(filename) {
		fs.readFile(filename, function(err, data) {
			if(err) throw err;
			res.write(data);
			res.end();
		});
	};*/
	eventEmitter.on('readEvent', function(filename) {
		fs.readFile(filename, function(err, data) {
			if(err) throw err;
			//eventEmitter.emit('sendMail', data);
			res.write('<pre>' + data + '</pre>');
			res.end();
		});
	});

	eventEmitter.on('sendMail',function(text) {
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'prasadz86@gmail.com',
				pass: 's@677688'	
			}
		});
		var mailOptions = {
			from: 'prasad.s@gmail.com',
			to: 'prasad_surapaneni@yahoo.com',
			subject: 'test mail from nodejs',
			text: text
		};
		transporter.sendMail(mailOptions, function (err, info){
			if(err) throw err;
			res.write('Mail sent: ' + info.response);
			res.end();	
		});
	});
	//eventEmitter.on('readEvent', myEventHandler(filename));
	
	//res.end();
});

server.listen(3001,"0.0.0.0");
// server.listen(3001,"127.0.0.1");
// server.listen(3001,"192.168.1.148");
console.log("Server running at http://192.168.1.74:3001/");
