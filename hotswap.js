var async = require('async');
var fs = require('fs');
var path = require('path');
var Events = require('events');

// module.exports for all loaded modules is here
var loaded = {};

// module itself for all loaded
var loaded_mods = {};

// function storage
var loaded_funcs = {};

// last mtime's for filenames
var hotswap = {};

// it's for autoloading
var watchfiles = true;
var watchfilenames = {};
var autoreload = true;

// asynchronously loaded file contents
var fscache = {};

// it's for extension handling
var current_extensions = {};
var original_handlers = {};

// in case of error we are retrying with this timeouts
var timeouts = [100, 300, 1000];

// it's for events generation
var emitter = new Events.EventEmitter();

// register new extension for hotswapping
function register_extension(ext, type)
{
	if (current_extensions[ext]) return;

	// preserving original catchers
	if (!original_handlers[ext]) {
		original_handlers[ext] = require.extensions[ext];
	}

	require.extensions[ext] = extension_js.bind(this, type);
	current_extensions[ext] = type;
}

// restore original handler for extension
function restore_extension(ext)
{
	if (!current_extensions[ext]) return;

	if (original_handlers[ext]) {
		require.extensions[ext] = original_handlers[ext];
	} else {
		delete require.extensions[ext];
	}
	delete current_extensions[ext];
	delete original_handlers[ext];
}

function read_file_failsafe(filename, cb)
{
	if (watchfilenames[filename]) {
		watchfilenames[filename].close();
		delete watchfilenames[filename];
	}
	try_read_file(filename, function(err, data) {
		watch_file(filename);
		if (err) {
			emitter.emit('error', err);
		} else {
			cb(data);
		}
	});
}

// fail-safe readFile
function try_read_file(filename, cb, ntry)
{
	ntry = ntry || 0;
	fs.readFile(filename, 'utf8', function(err, data) {
		if (err) {
			// allow up to 3 tries to open file
			if (ntry < timeouts.length) {
				setTimeout(function() {
					try_read_file(filename, cb, ntry+1);
				}, timeouts[ntry]);
			} else {
				cb(err, data);
			}
		} else {
			// wow! no error here
			cb(err, data);
		}
	});
}

function require_force(name)
{
	if (name.match(/^\.\.?\//)) {
		throw new Error("We have a problem with relative paths here. Please, use absolute path instead.");
	}
	return require_file(require.resolve(name));
}

function try_require_file(filename)
{
	try {
		require(filename);
	} catch(err) {
		emitter.emit('error', err);
	}
}

// require specified file with our handler
function require_file(filename)
{
	var ext = path.extname(filename) || '.js';
	var type = ext == '.coffee' ? 'coffee' : 'js';
	var reg_required = !current_extensions[ext];
	var result;
	if (reg_required) register_extension(ext, type);
	try {
		result = require(filename);
	} finally {
		if (reg_required) restore_extension(ext);
	}
	return result;
}

function copy_object(dest, src)
{
	for (var k in src) {
		var getter = src.__lookupGetter__(k);
		var setter = src.__lookupSetter__(k);
	
		if (getter || setter) {
			if (getter)
				dest.__defineGetter__(k, getter);
			if (setter)
				dest.__defineSetter__(k, setter);
		} else {
			dest[k] = src[k];
		}
	}
	if (src.prototype != undefined) {
		dest.prototype = src.prototype;
	} else {
		delete dest.prototype;
	}
}

function new_code(filename, newmodule)
{
	var newexp = newmodule.exports;
	if (typeof(newexp) == 'object') {
		loaded[filename] = {};
	} else if (typeof(newexp) == 'function') {
		loaded_funcs[filename] = newexp;
		loaded[filename] = function() {
			return loaded_funcs[filename].apply(this, arguments);
		}
	}

	var actual = loaded[filename];
	copy_object(actual, newexp);
	
	require.cache[filename].exports = actual;
}

function change_code(filename, oldmodule, newmodule)
{
	var actual = loaded[filename];
	var newexp = newmodule.exports;

	if (typeof(newexp) != typeof(actual)) {
		emitter.emit('error', new Error("exports type has changed, you must restart program to make change"));
		return;
	}

	if (typeof(newexp) == 'function') {
		loaded_funcs[filename] = newexp;
	}

	// wipe old module first
	for (var key in actual) {
		delete actual[key];
	}

	copy_object(actual, newexp);
	if (typeof(newmodule.change_code) == 'function') {
		newmodule.change_code(oldmodule, newmodule, actual);
	}

	// exporting an old hash actually
	require.cache[filename].exports = actual;
}

// it is require.extension[...] handler
function extension_js(type, module, filename)
{
	var is_hotswap_file = false;
	var content = get_file_contents(filename);
	delete fscache[filename];
	var iscompiled = false;
	
	fs.stat(filename, function(err, stats) {
		hotswap[filename] = stats.mtime;
	});

	if (type == 'coffee') {
		var compiled = require('coffee-script').compile(content, {
			filename: filename
		});
		module._compile(compiled, filename);
	} else {
		module._compile(content, filename);
	}

	var oldmodule = loaded_mods[filename];
	var newmodule = require.cache[filename];
	// require('repl').start() resets require.cache?
	if (typeof(newmodule) !== 'object') return;

	is_hotswap_file = !!newmodule.change_code;
	if (!is_hotswap_file) return;

	if (typeof(newmodule.exports) != 'object' && typeof(newmodule.exports) != 'function') {
		emitter.emit('error', new Error("hotswap cannot work with module "+filename));
	} else {
		if (oldmodule === undefined) {
			new_code(filename, newmodule);
		} else {
			change_code(filename, oldmodule, newmodule);
			emitter.emit('swap', filename);
		}
	}
	loaded_mods[filename] = newmodule;

	if (is_hotswap_file && watchfiles && !watchfilenames[filename]) {
		watch_file(filename);
	}
}

// from node.js source code
function stripBOM(content)
{
	// Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	// because the buffer-to-string conversion in `fs.readFileSync()`
	// translates it to FEFF, the UTF-16 BOM.
	if (content.charCodeAt(0) === 0xFEFF) {
		content = content.slice(1);
	}
	return content;
}

// this is synchronous function but it can load data that have been asynchronously loaded earlier
function get_file_contents(filename)
{
	var content = fscache[filename] || fs.readFileSync(filename, 'utf8');
	return stripBOM(content);
}

// reload one file
function reload_file_force(filename, ntry)
{
	ntry = ntry || 0;
	read_file_failsafe(filename, function (data) {
		fscache[filename] = data;
		delete require.cache[filename];
		try_require_file(filename);
	});
}

// reload all modules
function reload(cb)
{
	async.filter(Object.keys(loaded), function(filename, cb) {
		fs.stat(filename, function(err, stats) {
			if (hotswap[filename] < stats.mtime) {
				read_file_failsafe(filename, function (data) {
					fscache[filename] = data;
					cb(true);
				});
			} else {
				cb(false);
			}
		});
	}, function(results) {
		results.forEach(function(file) {
			delete require.cache[file];
			try_require_file(file);
		});
		if (cb) cb(results);
	});
}

// change extension list and return new list
function extensions(list)
{
	if (list === undefined) {
		var res = {};
		for (var i in current_extensions) res[i] = current_extensions[i];
		return res;
	}

	if (typeof(list) == "string") {
		var hash = {};
		hash[list] = 'js';
		return extensions.call(this, hash);
	}

	if (typeof(list) != "object") throw new Error('type error');
	if (list instanceof Array) {
		var hash = {};
		list.forEach(function(x) {
			hash[x] = 'js';
		});
		return extensions.call(this, hash);
	}
	
	var _extensions_copy = {};
	for (var arg in current_extensions) {
		_extensions_copy[arg] = current_extensions[arg];
	}

	for (var arg in list) {
		if (_extensions_copy[arg] != list[arg]) {
			restore_extension(arg);
			delete _extensions_copy[arg];
		}
		if (!_extensions_copy[arg]) {
			register_extension(arg, list[arg]);
		}
		delete _extensions_copy[arg];
	}
	
	for (var arg in _extensions_copy) {
		if (_extensions_copy[arg]) {
			restore_extension(arg);
		}
	}

	var res = {};
	for (var i in current_extensions) res[i] = current_extensions[i];
	return res;
}

// here should be function to trigger code changing
function watch_file(filename)
{
	var w = fs.watch(filename, {persistent: false}, function() {
		emitter.emit('change', filename);
		if (autoreload) {
			reload_file_force(filename);
		}
	});
	watchfilenames[filename] = w;
}

// unwatch all loaded modules
function unwatch_all()
{
	for (var mod in watchfilenames) {
		watchfilenames[mod].close();
	}
	watchfilenames = {};
	watchfiles = false;
}

// watch on all loaded modules
function watch_all()
{
	for (var mod in loaded) {
		watch_file(mod);
	}
	watchfiles = true;
}

// change watching (watch or unwatch all if necessary)
function setwatch(newvalue)
{
	if (newvalue === undefined) return watchfiles;
	if (watchfiles != newvalue) {
		if (newvalue) {
			watch_all();
		} else {
			unwatch_all();
		}
	}
	return watchfiles;
}

// change configuration
// return value is the whole new config
function configure(hash)
{
	var result = {};
	if (hash.autoreload !== undefined) autoreload = hash.autoreload;
	result.extensions = extensions(hash.extensions);
	result.watch = setwatch(hash.watch);
	result.autoreload = autoreload;
	return result;
}

// this is configuration by default
configure({
	extensions: {'.js': 'js', '.coffee': 'coffee'},
	watch: true,
	autoreload: true,
});
	
module.exports = emitter;
emitter.swap = reload;
emitter.configure = configure;
emitter.require = require_force;

