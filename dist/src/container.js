"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var base_1 = require('./base');
var machine_1 = require('./machine');
var commonMethods_1 = require('./commonMethods');
var tcpPortUsed = require('tcp-port-used');
var ContainerStatic = (function (_super) {
    __extends(ContainerStatic, _super);
    function ContainerStatic() {
        _super.apply(this, arguments);
    }
    ContainerStatic.prototype.waitForPort = function (opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            if (!opts.retryIntervalMs) {
                opts.retryIntervalMs = 100;
            }
            if (!opts.timeoutMs) {
                opts.timeoutMs = 5000;
            }
            var progress = base_1.Log.infoProgress('waiting for port', opts.port.toString());
            if (!opts.host) {
                machine_1.machine.ipAddress().then(function (ipAddress) {
                    opts.host = ipAddress;
                    _this.runWaitForPort(opts, progress).then(resolve, reject);
                }, function (err) { reject(err); });
            }
            else {
                _this.runWaitForPort(opts, progress).then(resolve, reject);
            }
        });
    };
    ContainerStatic.prototype.runWaitForPort = function (opts, progress) {
        return tcpPortUsed.waitUntilUsedOnHost(opts.port, opts.host, opts.retryIntervalMs, opts.timeoutMs).finally(function () { base_1.Log.terminateProgress(progress); });
    };
    ContainerStatic.prototype.start = function (imageName, opts, command) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var containerName = (opts && opts.name) ? opts.name : imageName;
            var progress = base_1.Log.infoProgress("Checking if container \"" + containerName + "\" needs to be started");
            _this.runWithoutDebugOnce(_this.status(containerName)).then(function (status) {
                if (!status) {
                    progress = base_1.Log.terminateProgress(progress).infoProgress("Creating and starting container \"" + containerName + "\"");
                    var c = "docker run -d";
                    if (!opts) {
                        opts = {};
                    }
                    c = base_1.addOpts(c, opts);
                    if (!opts.name) {
                        c = base_1.addOpt(c, '--name', containerName);
                    }
                    c += " " + imageName;
                    if (command) {
                        c += " " + command;
                    }
                    base_1.run(c, base_1.Opts.debug).then(function () {
                        base_1.Log.terminateProgress(progress).info("Container \"" + containerName + "\"\" started.");
                        resolve(true);
                    }, function (err) {
                        base_1.Log.terminateProgress(progress);
                        reject(err);
                    });
                }
                else if (status.indexOf('Up') === 0) {
                    base_1.Log.terminateProgress(progress).info("Container \"" + containerName + "\"\" already started.");
                    resolve(false);
                }
                else if (status.indexOf('Exited') === 0) {
                    base_1.Log.terminateProgress(progress).info("Container \"" + containerName + "\"\" exists but is not started. Starting now.");
                    base_1.runWithoutDebug("docker start " + containerName).then(function () { resolve(true); }, reject);
                }
                else {
                    base_1.Log.terminateProgress(progress);
                    reject("Could not start container " + containerName + ". Status was " + status + " Should never hit this.");
                }
            }, function (err) {
                base_1.Log.terminateProgress(progress);
                reject(err);
            });
        });
    };
    ContainerStatic.prototype.status = function (containerName) {
        return Q.Promise(function (resolve, reject) {
            var c = "docker ps -a --filter name=" + containerName + " --format \"table {{.Names}}\t{{.Status}}\"";
            base_1.run(c, base_1.Opts.debug).then(function (res) {
                var json = base_1.resToJSON(res);
                var status;
                for (var i = 0, l = json.length; i < l; i++) {
                    if (json[i]['NAMES'] === containerName) {
                        status = json[i]['STATUS'];
                        break;
                    }
                }
                resolve(status);
            }, function (err) { reject(err); });
        });
    };
    return ContainerStatic;
}(commonMethods_1.CommonMethods));
exports.ContainerStatic = ContainerStatic;
exports.container = new ContainerStatic();
