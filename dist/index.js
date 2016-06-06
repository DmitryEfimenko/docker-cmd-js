"use strict";
var colors = require('colors');
var inquirer = require('inquirer');
var Q = require('q');
var childProcessHelpers_1 = require('./childProcessHelpers');
var environment_1 = require('./environment');
var Docker = (function () {
    function Docker(machineName) {
        this.machineName = machineName;
        if (!this.machineName)
            this.machineName = 'default';
        environment_1.setEnvironment(this.machineName);
    }
    Docker.prototype.debug = function () {
        this._debug = true;
        return this;
    };
    Docker.prototype.runWithoutDebug = function (command, noNewLines) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var _debug = _this._debug;
            _this._debug = false;
            _this.run(command, noNewLines)
                .then(resolve, reject)
                .finally(function () { _this._debug = _debug; });
        });
    };
    Docker.prototype.run = function (command, noNewLines) {
        var _this = this;
        if (this._debug) {
            this.info('Running:', command);
        }
        var deferred = Q.defer();
        childProcessHelpers_1.spawn(command, process.env, function (result) {
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
                    deferred.resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
            }
            else {
                if (result.stdErr)
                    deferred.reject(result.stdErr);
                else
                    deferred.resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
            }
        });
        return deferred.promise;
    };
    Docker.prototype.checkForDanglingImages = function (cb) {
        var _this = this;
        this.runWithoutDebug('docker images --filter dangling=true').then(function (result) {
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
                            var p = _this.removeImage(images[i]['IMAGE ID']);
                            promises.push(p);
                        }
                        Q.all(promises).then(function () {
                            console.log(colors.green('Cleaned up dangling images. Try running your command again.'));
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
    Docker.prototype.machineStatus = function (cb) {
        this.run('docker-machine status').then(function (result) {
            console.log(result);
            if (result != 'Running') {
                console.log('TODO');
            }
            cb();
        }, function (err) { console.log(colors.red('could not get docket-machine status:'), err); });
    };
    Docker.prototype.startMachine = function (memory) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            _this.runWithoutDebug("docker-machine status " + _this.machineName).then(function (res) {
                if (res != 'Running') {
                    _this.runStartMachine(memory).then(resolve, reject);
                }
                else {
                    _this.info('docker-machine status:', res);
                    resolve(res);
                }
            }, function (err) {
                _this.runStartMachine(memory).then(resolve, reject);
            });
        });
    };
    Docker.prototype.runStartMachine = function (memory) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            _this.info("Starting virtual machine " + _this.machineName + " (memory: " + memory + ")");
            _this.runWithoutDebug("docker-machine create --driver virtualbox --virtualbox-no-vtx-check " + (memory ? '--virtualbox-memory ' + memory : '') + " " + _this.machineName).then(function (resp) { resolve(resp); }, function (err) { reject(err); });
        });
    };
    Docker.prototype.buildImage = function (imageName, opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            _this.runWithoutDebug("docker images --format {{.Repository}} " + imageName, true).then(function (img) {
                if (img == imageName) {
                    if (opts && opts.buildAndReplace) {
                        _this.removeImage(imageName).then(function () { _this.runBuildImage(imageName, opts.dockerFile).then(resolve, reject); }, reject);
                    }
                    else {
                        var promptOpts = {
                            type: 'list',
                            name: 'opts',
                            message: 'Image already exists. What would you like to do?',
                            choices: ['Build and replace old', 'Build and leave old one as dangling', 'Don not build']
                        };
                        inquirer.prompt(promptOpts).then(function (answers) {
                            if (answers.opts == 'Build and replace old') {
                                _this.removeImage(imageName).then(function () { _this.runBuildImage(imageName, opts.dockerFile).then(resolve, reject); }, reject);
                            }
                            if (answers.opts == 'Build and leave old one as dangling') {
                                _this.runBuildImage(imageName, opts.dockerFile).then(resolve, reject);
                            }
                            if (answers.opts == 'Don not build') {
                                resolve(undefined);
                            }
                        });
                    }
                }
                else {
                    _this.runBuildImage(imageName, opts.dockerFile).then(resolve, reject);
                }
            });
        });
    };
    Docker.prototype.runBuildImage = function (imageName, dockerFile) {
        this.info("Building image " + imageName + " via dockerFile: " + dockerFile + "...");
        return this.runWithoutDebug("docker build -t " + imageName + " " + (dockerFile || ''));
    };
    Docker.prototype.removeImage = function (imageName) {
        return this.runWithoutDebug("docker rmi -f " + imageName);
    };
    Docker.prototype.startContainer = function (imageName, opts, command) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var containerName = (opts && opts.name) ? opts.name : imageName;
            _this.runWithoutDebug("docker ps -a --filter name=" + containerName + " --format \"{{.Status}}\"").then(function (status) {
                if (!status) {
                    _this.info("Creating and starting container " + containerName + "...");
                    var c = "docker run -d --name " + containerName;
                    if (opts) {
                        if (opts.port)
                            c += " -p " + opts.port;
                        if (opts.volume)
                            c += " --volume " + opts.volume;
                        if (opts.volumesFrom)
                            c += " --volumes-from " + opts.volumesFrom;
                        if (opts.link)
                            c += " --link " + opts.link;
                        if (opts.env) {
                            for (var i = 0, l = opts.env.length; i < l; i++) {
                                c += " -e " + opts.env[i];
                            }
                        }
                    }
                    c += " " + imageName;
                    if (command)
                        c += " " + command;
                    _this.runWithoutDebug(c).then(function () { resolve(true); }, reject);
                }
                else if (status.indexOf('Up') == 1) {
                    _this.info("Container " + containerName + " already started.");
                    resolve(false);
                }
                else if (status.indexOf('Exited') == 1) {
                    _this.info("Container " + containerName + " exists but is not started. Starting now.");
                    _this.runWithoutDebug("docker start " + containerName).then(function () { resolve(true); }, reject);
                }
                else {
                    reject("Could not start container " + containerName() + ". Status was " + status + " Should never hit this.");
                }
            }, reject);
        });
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
