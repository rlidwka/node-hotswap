# Basic usage

Just write this in REPL or in your main file:
```javascript
require('hotswap');
```

And then add this line to modules you want to be reloaded:
```javascript
module.change_code = 1;
```

Now if you change your modules, they will be reloaded automatically.

