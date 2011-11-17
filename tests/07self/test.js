#!/usr/bin/env node

var hot = require('../../hotswap');
var Module1 = hot.require(require('path').dirname(module.filename)+'/swap1');

Module1.init();
Module1.echo();

hot.on('load', function() {
	console.log("loaded hotswap module", arguments);
});

hot.on('change', function() {
	console.log("detected module change", arguments);
});

hot.on('swap', function() {
	console.log("swapping module", arguments);
	Module1.echo();
});

