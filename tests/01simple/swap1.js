
var version = 2;

function echo() {
	console.log("Hi! I'm version "+version+" of swap1.jsh. Change this code and It'll be updated automatically.");
}

module.exports = {
	version: version,
	echo: echo
}

