## Basic usage

Just write this in your main file (or in the repl):

```javascript
require('hotswap');
```

And then add this line to modules you want to be reloaded (it tells *node-hotswap* to watch this file):

```javascript
module.change_code = 1;
```

Now if you change your modules, they will be reloaded automatically.

Demo (you have to wait more than 1 second between writings - it's file system limitations):
```javascript

var fs = require('fs');
var hotswap = require('hotswap');

// writing the initial version of test.js
fs.writeFileSync("hotswap-test.js", "module.exports.version = 0; module.change_code = true;");

// requiring it
var test = require('./hotswap-test')
console.log(test);

hotswap.on('swap', function() {
        // we are going to console.log(test) whenever it's changed
        console.log(test);
});

setTimeout(function() {
        fs.writeFile("hotswap-test.js", "module.exports.version = 1; module.change_code = true;")
}, 1000);

setTimeout(function() {
        fs.writeFile("hotswap-test.js", "module.exports.hi_there = function(){}; module.change_code = true;")
}, 2000);

setTimeout(function() {
        fs.writeFile("hotswap-test.js", "module.exports = {wow: 'thats working'}; module.change_code = true;")
}, 3000);

/* outputs:
 * { version: 0 }
 * { version: 1 }
 * { hi_there: [Function] }
 * { wow: 'thats working' }
 */
```

## What does it do?

This module overrides default functions in require.extension and do some magic there. It remembers all references to `exports` objects of modules with function `module.change_code` defined. When module is changed, contents of it's old exports object is replaced with contents of the new one.

```javascript
// So, this will work fine, m will be changed:
var m = require('hot-swapping-module');

// but "hotswap" have to way to replace m.func with new value
// so dont do this unless you really want to use old code, 
var m.func = require('hot-swapping-module').func;
```

## Events

`require('hotswap')` returns an EventEmitter that emits the following events:

- `change` - when one of the watched modules has changed
- `swap` - after successful replacing an old module with a new version
- `error` - if there was a filesystem error or something like that

## Local variables

When old module is replaced by the new one, local variables of the old module will be lost. 
If you want to save them, you can use `module.change_code`.

If `module.change_code` is defined as a function it will be called before module is reloaded. So you can write up something like that:

```javascript
module.cache = {} // it's important data you want to save

module.change_code = function(oldmod, newmod, exports_object) {
  newmod.cache = oldmod.cache;
}
```

## Configuration

You can configure `node-hotswap` using `configure` function. 

```javascript
require('hotswap').configure({
	// a list of extensions registered by hotswap
	//
	// you can define your own extension for such files if you are afraid 
	// that this module would mess up with some other modules (shouldn't 
	// happen though)
    //
	// default: {'.js': 'js', '.coffee': 'coffee'}
	extensions: {'.js': ['js', 'jsx'], '.coffee': 'coffee'},

	// enable or disable fs.watch() on hotswapping files
	// default: true
	watch: true,

	// automatically reload files on change
	// default: true
	autoreload: true,
});
```

## Todo

I should really write up some good documentation and examples here -_-
