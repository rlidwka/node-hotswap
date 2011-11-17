
var version = 2;

module.exports.echo = function(){console.log(module.exports)}

module.exports.__defineGetter__('hi', function() {console.log(123); return 1;});

