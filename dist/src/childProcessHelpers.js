"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process = require("child_process");
var colors = require("colors");
var base_1 = require("./base");
function spawn(command, env, debug, cb) {
    var items = command.match(/[^\s"']+|"[^"]*"|'[^']*/g);
    items.forEach(function (val, i, arr) {
        if (val[0] === '"' && val[val.length - 1] === '"') {
            arr[i] = val.substr(1, val.length - 2);
        }
    });
    var r = child_process.spawn(items[0], items.slice(1), { env: env });
    var result = { stdOut: '', stdErr: '' };
    r.stdout.on('data', function (data) {
        result.stdOut = result.stdOut + data.toString();
        if (debug) {
            process.stdout.write(data.toString());
        }
    });
    r.stderr.on('data', function (data) {
        var errorsToSkip = [
            'SECURITY WARNING:',
            'Unable to use system certificate pool: crypto/x509: system root pool is not available on Windows'
        ];
        if (errorsToSkip.every(function (e) { return data.toString().indexOf(e) === -1; })) {
            result.stdErr = result.stdErr + data.toString();
            if (debug) {
                base_1.Log.warn("stderr: " + data.toString());
            }
        }
    });
    r.on('error', function (err) {
        base_1.Log.err("Failed to start command: " + command + ". Error:");
        if (err && err.message) {
            console.log(err);
        }
        else {
            process.stdout.write(err);
        }
    });
    r.on('close', function (code) {
        if (debug) {
            base_1.Log.info("command exited with code " + code);
        }
        cb(result);
    });
}
exports.spawn = spawn;
function spawnSync(command, env, debug) {
    var items = command.match(/[^\s"']+|"[^"]*"|'[^']*/g);
    items.forEach(function (val, i, arr) {
        if (val[0] === '"' && val[val.length - 1] === '"') {
            arr[i] = val.substr(1, val.length - 2);
        }
    });
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
        stdErr: r.stderr ? r.stderr.toString() : '',
        stdOut: r.stdout ? r.stdout.toString() : ''
    };
}
exports.spawnSync = spawnSync;
