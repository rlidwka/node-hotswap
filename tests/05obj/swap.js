
var hot = require('../../hotswap');
var version = 1;

o = new Object();
o.prop = 'exists';
o.hasOwnProperty('prop');             // returns true
o.hasOwnProperty('toString');         // returns false
o.hasOwnProperty('hasOwnProperty');   // returns false

module.exports = o;
o.echo = function() {
	console.log(o);
	console.log(o.toString);
	console.log(o.prototype);
	console.log(o.hasOwnProperty);
	console.log('hi22222 11' );
}

