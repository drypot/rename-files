var fs = require('fs');
var pathl = require('path');

function traverse(path, next) {
	fs.stat(path, function (err, stat) {
		if (err) return next(err);
		if(stat.isFile()) {
			return func(path, next);
		}
		if(stat.isDirectory()) {
			fs.readdir(path, function (err, fnames) {
				if (err) return next(err);
				var i = 0;
				function loop() {
					if (i == fnames.length) {
						return next();
					}
					var fname = fnames[i++];
					traverse(path + '/' + fname, function (err) {
						if (err) return next(err);
						setImmediate(loop);
					});
				}
				loop();
			});
		}
	});
};

function func(path, next) {
	//console.log('org: ' + path);
	var dir = pathl.dirname(path);
	var base = pathl.basename(path);
	var nbase = base.toLowerCase().replace(/ /g, '-').replace(/\.txt$/, '.md');
	if (base != nbase) {
		var npath = dir + '/' + nbase;
		fs.renameSync(path, npath);
		console.log(npath);
	}
	next();
}

process.on('uncaughtException', function (err) {
	console.error('UNCAUGHT EXCEPTION');
	if (err.stack) {
		console.error(err.stack);
	} else {
		console.log(require('util').inspect(err));
	}
});

if (process.argv[2]) {
	traverse(process.argv[2], function (err) {
		if (err) throw err;
	});
} else {
	console.log('no argument');
}