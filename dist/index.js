"use strict";
var child_process = require('child_process');
var colors = require('colors');
var spawnSync = child_process.spawnSync;
var spawn = child_process.spawn;
var Docker = (function () {
    function Docker(machineName) {
        this.machineName = machineName;
        if (!this.machineName)
            this.machineName = 'default';
    }
    Docker.prototype.debug = function () {
        this._debug = true;
        return this;
    };
    Docker.prototype.run = function (command, cb) {
        var _this = this;
        if (this._debug)
            console.log(colors.america('Running: ' + command));
        this.spawn(command, this.getEnvironmentObject(), function (result) {
            if (_this._debug) {
                if (result.stdErr) {
                    process.stdout.write(colors.red('command finnished with errors. Checking if docker machine got into error state...'));
                }
                else
                    process.stdout.write(result.stdOut);
            }
            cb(result.stdErr, result.stdOut);
        });
    };
    Docker.prototype.spawn = function (command, env, cb) {
        var items = command.split(' ');
        //var items = command.match(/[\w-=:]+|"(?:\\"|[^"])+"/g); // in case we need to have quoted args
        //console.dir(items);
        var r = spawn(items[0], items.slice(1), { env: env });
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
    };
    Docker.prototype.spawnSync = function (command, env) {
        var items = command.split(' ');
        //var items = command.match(/[\w-=:]+|"(?:\\"|[^"])+"/g); // in case we need to have quoted args
        //console.dir(items);
        var r = spawnSync(items[0], items.slice(1), { env: env });
        return {
            stdOut: r.stdout.toString(),
            stdErr: r.stderr.toString()
        };
    };
    Docker.prototype.getEnvironmentObject = function () {
        if (Docker.envObj)
            return Docker.envObj;
        var env = process.env;
        var envTxt = this.spawnSync("docker-machine env " + this.machineName + " --shell cmd", env).stdOut;
        var lines = envTxt.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (!this.isEnvironmentVariableLine(lines[i]))
                continue;
            this.addEnvironmentKeyValueToObject(lines[i], env);
        }
        Docker.envObj = env;
        return env;
    };
    Docker.prototype.isEnvironmentVariableLine = function (line) {
        return line.indexOf('SET') === 0;
    };
    Docker.prototype.addEnvironmentKeyValueToObject = function (line, obj) {
        line = line.substr(4);
        var kvp = line.split('=');
        obj[kvp[0]] = kvp[1];
    };
    Docker.prototype.log = function (text) {
        console.log("\u001B[36m" + text + "\u001B[0m");
    };
    return Docker;
}());
exports.Docker = Docker;
