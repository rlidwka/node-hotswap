
var hot = require('../../hotswap');
var version = 12w11;

function echo() {
	console.log("Hi! I'm version "+version+" of swap1.jsh. Change this code and It'll be updated automatically.");
}

module.exports = echo;

function echo1() {
	console.log("Hi! I'm version "+version+" of swap1.jsh. Change this code and It'll be updated automatically.");
}

