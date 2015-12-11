# hotmop

hot-reload your node modules

emits 'error' on syntax errors

## installation

    npm install hotmop

## usage

in myModule.js

```javascript
module.exports = {
  stuff: 'nice',
  moreStuff: 'nice',
}
```

in main.js

```javascript
var hotmop = require('hotmop')
var myCoolModule = require('./myModule1.js')

var f = __dirname + '/myModule.js'
var swapper = hotmop(f)

swapper.on('swap', function (newModule) {
  myCoolModule = newModule
  console.log('swapped module!', myCoolModule)
})

swapper.on('error', function (err) {
  console.log('error in first module!', err)
})

```
## api

### hotmop(absolutePath)

returns an event emitter.

## emitter events

- `swap` - when a watched module has changed
- `error` - if there was a filesystem error or syntax error

## license

BSD-2-Clause
