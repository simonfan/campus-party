var path = require('path');
var express = require('express');
var app = express();
var exec = require('child_process').exec;

// Globals
global.containerId = 1;
global.containerHashes = [];

app.use('/', express.static(path.join(__dirname, 'public', 'html')));

app.get('/new', function(req, res) {
	var cmd = 'docker run -dP --name campus' + global.containerId + ' renansdias/hello-mesos';
	global.containerId++;

	exec(cmd, function(err, stdout, stderr) {
		if (err) throw err;

		global.containerHashes.push(stdout);
		console.log(stdout);
	});	
});

app.listen(8000, function() {
	console.log('App running on 8000');
});

// Stop and remove all containers so there's no conflict
var dockerCmd = 'docker stop $(docker ps -aq); docker rm $(docker ps -aq)';
exec(dockerCmd, function(err, stdout, stderr) {
	if (!err) console.log(stdout);
});