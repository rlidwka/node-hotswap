#!/usr/bin/env node

var hot = require('../../hotswap');
var Module = hot.require(require('path').dirname(module.filename)+'/swap');
var Module2 = require(require('path').dirname(module.filename)+'/swap2');

console.log(Module);
console.log(Module2);

	Module.echo();
	Module2.echo();
setInterval(function() {
}, 10000);

hot.on('swap', function() {
	console.log("swapping module", arguments);
	Module.echo();
	Module2.echo();
});

