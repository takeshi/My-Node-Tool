var cli = require("cli");
var fs = require("fs");

//require("../patch.js");
//require("nclosure").nclosure();
//goog.require("goog.array");

var target_dir =  "./views/soy";
var output_dir = "./public/javascripts/soy/";

var cli = require("cli");
cli.parse({
    target: ['t', 'watch target directory', 'string', target_dir],
    output: ['o', 'output directory', 'string', output_dir],
});

cli.main(function (args, options) {
	var target_dir = options.target;
	var output_dir = options.output;
	var invokeCreateTemplate = function(target,callback){
		var outputPathFormat = output_dir + target +".js ";
		
		var script ="";
		script += "java ";
		script += "-jar " +__dirname+ "/SoyToJsSrcCompiler.jar ";
		script += "--outputPathFormat " + outputPathFormat;
		script += "--shouldProvideRequireSoyNamespaces ";
		script += " "+ target_dir + "/" +target ;
		
		var p = require('child_process').exec(script,{
			cwd : "./",
			maxBuffer : 1024 * 1024
		 }, function(err, stdout, stderr) {
			if (err) {
				console.log(err);
			}else{
				console.log("create template sccuess " + outputPathFormat);
			}
			
			if(callback){
				callback();
			}
		});
		
		p.stdout.on("data",function(data){
			console.log(data);	
		});
		
		p.stderr.on("data",function(data){
			console.log("[ERR] " + data);	
		});
	};
	
	
	var watchFiles = function(target_dir){
		var ls = fs.readdirSync(target_dir);
		var files = [];
	//	goog.array.forEach(ls, function(file) {
		for(var i = 0;i<ls.length;i++){
			var file = ls[i];
			var full_path = target_dir +"/"+file;
			console.log("watching " + full_path);
			files.push(full_path);
			
			fs.watchFile(full_path,function(c,p){
				if(c.mtime.toString() != p.mtime.toString()){
					console.log("file update " + full_path +' time is ' + c.mtime);
					invokeCreateTemplate(file);
				}
			});
//		});
		};
		return files;
	}
	
	var unwatchFiles = function(files){
//		goog.array.forEach(files,function(file){
		for(var i = 0;i<files.length;i++){
			var file = files[i];
			fs.unwatchFile(file);
		}
	//	});
	}
	
	var watchedFiles = watchFiles(target_dir);
	
	fs.watch(target_dir,function(){
		console.log("target dir update " + target_dir );
		unwatchFiles(watchedFiles);
		watchedFiles = watchFiles(target_dir);
	});

});



