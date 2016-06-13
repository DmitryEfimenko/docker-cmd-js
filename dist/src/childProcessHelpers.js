"use strict";
var child_process = require('child_process');
var colors = require('colors');
var base_1 = require('./base');
function spawn(command, env, debug, cb) {
    var items = command.split(' ');
    var r = child_process.spawn(items[0], items.slice(1), { env: env });
    var result = { stdOut: '', stdErr: '' };
    r.stdout.on('data', function (data) {
        result.stdOut = result.stdOut + data.toString();
        if (debug) {
            process.stdout.write(data.toString());
        }
    });
    r.stderr.on('data', function (data) {
        if (data.indexOf('SECURITY WARNING:') === -1) {
            result.stdErr = result.stdErr + data.toString();
            process.stdout.write(colors.red("stderr: " + data.toString()));
        }
    });
    r.on('error', function (err) {
        process.stdout.write("Failed to start command: " + command);
    });
    r.on('close', function (code) {
        if (debug) {
            console.log("command exited with code " + code);
        }
        cb(result);
    });
}
exports.spawn = spawn;
function spawnSync(command, env, debug) {
    var items = command.split(' ');
    var r = child_process.spawnSync(items[0], items.slice(1), { env: env });
    if (debug) {
        if (r.stdout) {
            base_1.Log.info('stdout:');
            process.stdout.write(r.stdout.toString());
        }
        if (r.stderr) {
            base_1.Log.info('stderr:');
            process.stdout.write(colors.red(r.stderr.toString()));
        }
    }
    return {
        stdOut: r.stdout.toString(),
        stdErr: r.stderr.toString()
    };
}
exports.spawnSync = spawnSync;
