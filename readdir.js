
var fs=require('fs');

//读目录下的文件
var files =fs.readdirSync('html');
files.forEach(function(item){
	console.log(item)
	var content = fs.readFileSync('html/'+item, "utf-8");
	// console.log(content)
});