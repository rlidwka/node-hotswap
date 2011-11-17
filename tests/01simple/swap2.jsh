
var version = 1;

function echo() {
	console.log("Hi! I'm version "+version+" of swap2.jsh. Change this code and It'll be updated automatically.");
}

module.exports = {
	version: version,
	echo: echo
}

