## installation

    npm install hotmop

## usage

```javascript
var fileOne = '/home/elsehow/myproj/myModule.js'
var fileTwo = '/home/elsehow/myproj/myModule2.js'
var swapEmitter = require('hotmop')(fileOne, fileTwo)
var myCoolModule = require('./myModule.js')
var myOtherCoolModule = require('./myModule2.js')

swapEmitter.on(fileOne, function () {
  console.log('myModule.js just got hot-swapped!')
})

swapEmitter.on(fileTwo, function () {
  console.log('myModule2.js just got hot-swapped!')
})


swapEmitter.on('error', function (err) {
  console.log('error on require!', err)
})

```

If you change that myModule.js file and save your changes, the modulek, it will be automatically reloaded!

As an added bonus, the file with [automatically be checked for syntax errors](https://www.npmjs.com/package/syntax-error), which will bubble up through the emitter's 'error' event.

## api

### hotmop(absolutePath1, absolutePath2, ...)

this function overrides require

The value that require('hotmop') returns will be an event emitter.

## Events

`require('hotmop')(paths...)` returns an EventEmitter that emits the following events:

- `change` - when a watched module has changed
- `error` - if there was a filesystem error or syntax error
- path - after successfully replacing an old module with a new version, an event named by the path of the swapped file is emitted. see example

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
