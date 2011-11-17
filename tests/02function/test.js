#!/usr/bin/env node

var hot = require('../../hotswap');
hot.configure({
	extensions: ['.jsh'],
});
var Module = require('./swap');

Module();

setInterval(function() {
}, 10000);

hot.on('load', function() {
	console.log("loaded hotswap module", arguments);
});

hot.on('change', function() {
	console.log("detected module change", arguments);
});

hot.on('swap', function() {
	console.log("swapping module", arguments);
	Module();
});

hot.on('error', function() {
	console.log("error", arguments);
});

console.log(hot.configure({
}));
