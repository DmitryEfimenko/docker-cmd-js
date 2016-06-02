"use strict";
var spawnSync = require('child_process').spawnSync;
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
    Docker.prototype.run = function (command) {
        if (this._debug)
            this.log('Running: ' + command);
        var result = this.spawn(command, this.getEnvironmentObject());
        if (this._debug)
            console.dir(result);
        return result;
    };
    Docker.prototype.spawn = function (command, env) {
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
        var envTxt = this.spawn("docker-machine env --shell cmd " + this.machineName, env).stdOut;
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
