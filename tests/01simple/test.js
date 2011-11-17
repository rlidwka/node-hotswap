#!/usr/bin/env node

var hot = require('../../hotswap');
hot.configure({
	extensions: ['.jsh'],
});
var Module1 = hot.require('./swap1');
var Module2 = require('./swap2');

Module1.echo();
Module2.echo();

setInterval(function() {
	hot.swap(function() {
		console.log('hard swap', arguments);
	});
}, 10000);

hot.on('load', function() {
	console.log("loaded hotswap module", arguments);
});

hot.on('change', function() {
	console.log("detected module change", arguments);
});

hot.on('swap', function() {
	console.log("swapping module", arguments);
	Module1.echo();
	Module2.echo();
});

console.log(hot.configure({
	autoreload: false
}));
