"use strict";
var child_process = require('child_process');
var colors = require('colors');
var inquirer = require('inquirer');
var Q = require('q');
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
    Docker.prototype.run = function (command, noNewLines) {
        var _this = this;
        if (this._debug) {
            this.info('Running:', command);
        }
        var deferred = Q.defer();
        this.spawn(command, this.getEnvironmentObject(), function (result) {
            if (_this._debug) {
                if (result.stdErr) {
                    _this.err('command finnished with errors.');
                    if (result.stdErr.toLowerCase().indexOf('no space left on device') > -1) {
                        _this.checkForDanglingImages(function () {
                            if (result.stdErr)
                                deferred.reject(result.stdErr);
                            else
                                deferred.resolve(result.stdOut);
                        });
                    }
                    else {
                        deferred.reject(result.stdErr);
                    }
                }
                else
                    deferred.resolve(noNewLines ? result.stdOut.replace('\r\n', '') : result.stdOut);
            }
            else {
                if (result.stdErr)
                    deferred.reject(result.stdErr);
                else
                    deferred.resolve(noNewLines ? result.stdOut.replace('\r\n', '') : result.stdOut);
            }
        });
        return deferred.promise;
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
    Docker.prototype.checkForDanglingImages = function (cb) {
        var _this = this;
        var _debug = this._debug;
        this._debug = false;
        this.run('docker images --filter dangling=true').then(function (result) {
            var images = _this.resToJSON(result);
            if (images.length > 0) {
                var promptOpts = {
                    type: 'list',
                    name: 'remove',
                    message: 'Found dangling images. Would you like to remove them?',
                    choices: ['Yes', 'No']
                };
                inquirer.prompt(promptOpts).then(function (answers) {
                    if (answers.remove == 'Yes') {
                        var promises = [];
                        for (var i = 0, l = images.length; i < l; i++) {
                            var p = _this.run("docker rmi -f " + images[i]['IMAGE ID']);
                            promises.push(p);
                        }
                        Q.all(promises).then(function () {
                            console.log(colors.green('Cleaned up dangling images. Try running your command again.'));
                            _this._debug = _debug;
                            cb();
                        }, function (err) { _this.err('could not clean up dangling images:', err); });
                    }
                    else {
                        cb();
                    }
                });
            }
            else {
                cb();
            }
        }, function (err) { _this.err('could not check for dangling images:', err); });
    };
    Docker.prototype.checkDockerMachineStatus = function (cb) {
        this.run('docker-machine status').then(function (result) {
            console.log(result);
            if (result != 'Running') {
                console.log('TODO');
            }
            cb();
        }, function (err) { console.log(colors.red('could not get docket-machine status:'), err); });
    };
    Docker.prototype.resToJSON = function (s) {
        var lines = s.split('\n').filter(function (val) { return val != ''; });
        var headerLine = lines.shift();
        var arr = headerLine.split(' ');
        var cols = [];
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] !== '') {
                var col = { name: arr[i], length: arr[i].length };
                if (arr[i + 1] != undefined && arr[i + 1] != '') {
                    col.name = col.name + ' ' + arr[i + 1];
                    col.length = col.length + arr[i + 1].length + 1;
                    i = i + 1;
                }
                cols.push(col);
            }
            else {
                cols[cols.length - 1].length = cols[cols.length - 1].length + 1;
            }
        }
        var result = [];
        for (var i = 0, l = lines.length; i < l; i++) {
            var obj = {};
            for (var c = 0, cl = cols.length; c < cl; c++) {
                obj[cols[c].name] = lines[i].substring(0, cols[c].length + 1).trim();
                lines[i] = lines[i].substring(cols[c].length + 1, lines[i].length - 1);
            }
            result.push(obj);
        }
        return result;
    };
    Docker.prototype.startMachine = function (memory) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            _this.memory = memory;
            var _debug = _this._debug;
            _this._debug = false;
            _this.run("docker-machine status " + _this.machineName).then(function (res) {
                if (res != 'Running') {
                    _this.runStartCommand(memory).then(resolve, reject);
                }
                else {
                    _this.info('docker-machine status:', res);
                    resolve(res);
                }
            }, function (err) {
                _this.runStartCommand(memory).then(resolve, reject);
            }).finally(function () { _this._debug = _debug; });
        });
    };
    Docker.prototype.runStartCommand = function (memory) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var _debug = _this._debug;
            _this._debug = false;
            _this.info("Starting virtual machine " + _this.machineName + " (memory: " + memory + ")");
            _this.run("docker-machine create --driver virtualbox --virtualbox-no-vtx-check " + (memory ? '--virtualbox-memory ' + memory : '') + " " + _this.machineName).then(function (resp) { resolve(resp); }, function (err) { reject(err); }).finally(function () { _this._debug = _debug; });
        });
    };
    Docker.prototype.info = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        console.log(colors.cyan(message.join(' ')));
    };
    Docker.prototype.err = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        console.log(colors.red(message.join(' ')));
    };
    return Docker;
}());
exports.Docker = Docker;
