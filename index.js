var path = require('path');
var express = require('express');
var app = express();
var exec = require('child_process').exec;

// Globals
global.containerId = 1;
global.containerHashes = [];
global.imageId = 'simonfan/campus-3';
global.host = 'http://54.86.89.162';


// ports
var portsByCid = {};

app.use('/', express.static(path.join(__dirname, 'public', 'html')));

// create new container
app.post('/new', function(req, res) {
	var cmd = 'docker run -dP --name campus' + global.containerId + ' ' + global.imageId + ' --cid ' + global.containerId + ' --host ' + global.host;

	exec(cmd, function(err, containerHash, stderr) {
		if (err) throw err;

		global.containerHashes.push(containerHash);
		console.log(containerHash);


		// get ports
		getDockerPorts(containerHash, function (ports) {
			console.log(ports);


			// save ports
			portsByCid['' + global.containerId] = ports;

			// increment container id
			global.containerId++;

			res.json({
				containerHash: containerHash,
				ports: ports,
			});
		});
	});	
});

// configurations
app.get('/config', function (req, res) {

	// cors
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


	console.log(portsByCid);

	console.log(req.query.cid);
	console.log(portsByCid[req.query.cid]);

	var config = {
		cid: req.query.cid,
		socketPort: portsByCid[req.query.cid]['3102']
	};

	console.log('DOCKER_CONFIG');
	console.log(config);

	// response
	res.json(config);

	res.end();
});

app.listen(8000, function() {
	console.log('App running on 8000');
});

// Stop and remove all containers so there's no conflict
var dockerCmd = 'docker stop $(docker ps -aq); docker rm $(docker ps -aq)';
exec(dockerCmd, function(err, stdout, stderr) {
	if (!err) console.log(stdout);
});




function getDockerPorts(containerHash, cb) {

	console.log('get ports for ' + containerHash)

	exec('docker port ' + containerHash, function(err, portsSring, stderr) {
		if (err) throw err;

		var ports = {};

		var split = portsSring.split(/\n/);

		split.forEach(function (line) {
			var lineSplit = line.split(/(\/tcp.*?\:)/);

			ports[lineSplit[0]] = lineSplit[lineSplit.length - 1];

		});

		// callbakc
		cb(ports);
	})
}