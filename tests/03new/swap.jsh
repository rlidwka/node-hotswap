
var hot = require('../../hotswap');
var version = 1;

function Class(msg)
{
	this.msg = msg;
}

Class.prototype.echo = function()
{
	console.log(this.msg);
}

module.exports = new Class("Hi!updated automatically.");

