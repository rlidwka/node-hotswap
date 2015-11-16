## installation

    npm install hotmop

## usage

```javascript
var swapEmitter = require('hotmop')('/home/elsehow/myproj/myModule.js')
var myCoolModule = require('./myModule.js')

swapEmitter.on('swap', function () {
  console.log('myModule.js just got hot-swapped!')
})

swapEmitter.on('error', function (err) {
  console.log('error on require!', err)
})

```

If you change that myModule.js file and save your changes, the modulek, it will be automatically reloaded!

As an added bonus, the file with [automatically be checked for syntax errors](https://www.npmjs.com/package/syntax-error), which will bubble up through the emitter's 'error' event.

**NOTE: this has NOT been tested to work with multiple files!! try that at your own risk. and do a PR if you fix it!**

## api

### hotmop(absolutePath)

this function overrides require

The value that require('hotmop') returns will be an event emitter.

## Events

`require('hotmop')(pathToFile)` returns an EventEmitter that emits the following events:

- `change` - when the watched module has changed
- `swap` - after successfully replacing an old module with a new version
- `error` - if there was a filesystem error or something like that

## Configuration

You can configure `hotmop` using `configure` function. 

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
