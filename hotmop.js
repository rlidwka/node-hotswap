var EventEmitter = require('events').EventEmitter
  , Gaze = require('gaze')
  , check = require('syntax-error')

function idempotentRequire (moduleName) {
  delete require.cache[moduleName]
  return require(moduleName)
}

function setup (path) {
  var emitter = new EventEmitter
  var gaze = new Gaze(path, (err, watcher) => {
    if (err)
      emitter.emit('error', err)
    gaze.on('changed', () => {
      var err = check(path)
      if (err)
        emitter.emit('error', err)
      else {
        var m = idempotentRequire(path)
        emitter.emit('swap', m)
      }
    })
  })
  return emitter
}

module.exports = setup
