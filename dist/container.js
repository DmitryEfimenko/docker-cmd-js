"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var base_1 = require('./base');
var docker_cmd_js_1 = require('./docker-cmd-js');
var machine_1 = require('./machine');
var commonMethods_1 = require('./commonMethods');
var tcpPortUsed = require('tcp-port-used');
var Container = (function (_super) {
    __extends(Container, _super);
    function Container() {
        _super.apply(this, arguments);
    }
    Container.prototype.waitForPort = function (opts) {
        return this.waitForPort(opts);
    };
    Container.waitForPort = function (opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            if (!opts.retryIntervalMs)
                opts.retryIntervalMs = 100;
            if (!opts.timeoutMs)
                opts.timeoutMs = 5000;
            if (!opts.host) {
                machine_1.Machine.ipAddress().then(function (ipAddress) {
                    opts.host = ipAddress;
                    _this.runWaitForPort(opts).then(resolve, reject);
                }, function (err) { reject(err); });
            }
            else {
                _this.runWaitForPort(opts).then(resolve, reject);
            }
        });
    };
    Container.runWaitForPort = function (opts) {
        return tcpPortUsed.waitUntilFreeOnHost(opts.port, opts.host, opts.retryIntervalMs, opts.timeoutMs);
    };
    Container.prototype.start = function (imageName, opts, command) {
        return this.start(imageName, opts, command);
    };
    Container.start = function (imageName, opts, command) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var progress = base_1.Log.infoProgress('Checking if container needs to be started');
            var containerName = (opts && opts.name) ? opts.name : imageName;
            _this.runWithoutDebugOnce(_this.status(containerName)).then(function (status) {
                if (!status) {
                    progress = base_1.Log.terminateProgress(progress).infoProgress("Creating and starting container " + containerName + "...");
                    var c = "docker run -d";
                    if (!opts)
                        opts = {};
                    c = base_1.addOpts(c, opts);
                    // set sinsible defaults
                    if (!opts.name)
                        c = base_1.addOpt(c, '--name', containerName);
                    c += " " + imageName;
                    if (command)
                        c += " " + command;
                    base_1.run(c, docker_cmd_js_1.Opts.debug).then(function () {
                        base_1.Log.terminateProgress(progress).info("Container " + containerName + " started.");
                        resolve(true);
                    }, function (err) {
                        base_1.Log.terminateProgress(progress);
                        reject(err);
                    });
                }
                else if (status.indexOf('Up') == 1) {
                    base_1.Log.terminateProgress(progress).info("Container " + containerName + " already started.");
                    resolve(false);
                }
                else if (status.indexOf('Exited') == 1) {
                    base_1.Log.terminateProgress(progress).info("Container " + containerName + " exists but is not started. Starting now.");
                    base_1.runWithoutDebug("docker start " + containerName).then(function () { resolve(true); }, reject);
                }
                else {
                    base_1.Log.terminateProgress(progress);
                    reject("Could not start container " + containerName() + ". Status was " + status + " Should never hit this.");
                }
            }, function (err) {
                base_1.Log.terminateProgress(progress);
                reject(err);
            });
        });
    };
    Container.prototype.status = function (containerName) {
        return this.status(containerName);
    };
    Container.status = function (containerName) {
        return base_1.run("docker ps -a --filter name=" + containerName + " --format \"{{.Status}}\"", docker_cmd_js_1.Opts.debug);
    };
    return Container;
}(commonMethods_1.CommonMethods));
exports.Container = Container;
