## Basic usage

Just write this in REPL or in your main file:

```javascript
require('hotswap');
```

Andthen add this line to modules you want to be reloaded:

```javascript
module.change_code = 1;
```

Now if you change your modules, they will be reloaded automatically.

## What does it do?

This module overrides default functions in require.extension and do some magic there. It remembers all references 
to exports objects of modules with defined `module.change_code`. And when module is changed 
contents of it's old exports object is replaced with contents of the new one.

```javascript
// So, this will work fine, m will be changed:
var m = require('hot-swapping-module');

// but "hotswap" have to way to replace m.func with new value
// so dont do this unless you really want to use old code, 
var m.func = require('hot-swapping-module').func;
```

## Local variables

When old module is replaced by the new one, local variables of the old module will be lost. 
If you want to save them, you can use `module.change_code`.

If `module.change_code` is defined as a function it will be called before module is reloaded. So you can write up something like that:

```javascript
module.cache = {} // it's important data you want to save

module.change_code = function(oldmod, newmod) {
  newmod.cache = oldmod.cache;
}
```

## Todo

I should really write up some good documentation here -_-