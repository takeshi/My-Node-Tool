var cli = require("cli");
var fs = require("fs");

var base =  "./public/javascripts/";
var depswriter = process.cwd()+"/node_modules/nclosure/third_party/closure-library/closure/bin/build/depswriter.py ";

var relative_path = "../../javascripts";

var goog_dir = "/goog";

cli.main(function(args, options) {
	var js = [];
	var queue = [ relative_path ];
	while (queue.length > 0) {
		var dir = queue.shift();
		try {
			var ls = fs.readdirSync(base + goog_dir + "/" + dir);
	//		goog.array.forEach(ls, function(file) {
			for(var i = 0;i<ls.length;i++){
				var file = ls[i];
				if (file.match(/.*\.js$/i)) {
					js.push(dir + "/" + file);
				} else {
					queue.push(dir + "/" + file);
				}
			}
	//		});
		} catch (e) {
			console.log("load error " + e);
		}
	}

	console.log("target js :" + js);

	require('child_process').exec(depswriter + " " + js.join(" "), {
		cwd : base + goog_dir,
		maxBuffer : 1024 * 1024
	}, function(err, stdout, stderr) {
		if (err) {
			throw err;
		}
		if (stdout) {
			console.log("create " + base + "deps.js");
			fs.writeFileSync(base + "/deps.js", stdout);
		}
		if (stderr) {
			console.err(stderr);
		}
	});
});
