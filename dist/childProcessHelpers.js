"use strict";
var child_process = require('child_process');
var colors = require('colors');
function spawn(command, env, cb) {
    var items = command.split(' ');
    //var items = command.match(/[\w-=:]+|"(?:\\"|[^"])+"/g); // in case we need to have quoted args
    //console.dir(items);
    var r = child_process.spawn(items[0], items.slice(1), { env: env });
    var result = { stdOut: '', stdErr: '' };
    r.stdout.on('data', function (data) {
        result.stdOut = result.stdOut + data.toString();
        process.stdout.write(data.toString());
    });
    r.stderr.on('data', function (data) {
        result.stdErr = result.stdErr + data.toString();
        process.stdout.write(colors.red("stderr: " + data.toString()));
    });
    r.on('error', function (err) {
        process.stdout.write('Failed to start command');
    });
    r.on('close', function (code) {
        //console.log(`command exited with code ${code}`);
        cb(result);
    });
}
exports.spawn = spawn;
function spawnSync(command, env) {
    var items = command.split(' ');
    //var items = command.match(/[\w-=:]+|"(?:\\"|[^"])+"/g); // in case we need to have quoted args
    //console.dir(items);
    var r = child_process.spawnSync(items[0], items.slice(1), { env: env });
    return {
        stdOut: r.stdout.toString(),
        stdErr: r.stderr.toString()
    };
}
exports.spawnSync = spawnSync;
