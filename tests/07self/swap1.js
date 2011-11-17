
var version = 5;

module.exports = {
	version: version,
	echo: echo,
	init: init
}
var thismod = require(module.filename);
console.log(thismod.echo());

function echo() {
	console.log("Hi! I'm version "+version+" of swap1.jsh. Change this code and It'll be updated automatically.");
}

function init() {
	setInterval(function() {
		thismod.echo()
	}, 1000);
}
module.init = init;

