"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var base_1 = require('./base');
var commonMethods_1 = require('./commonMethods');
var environment_1 = require('./environment');
var Machine = (function (_super) {
    __extends(Machine, _super);
    function Machine(machineName) {
        _super.call(this, machineName);
    }
    Machine.prototype.status = function () {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            return base_1.run("docker-machine status " + _this.machineName, _this.machineName, _this.isDebug, true).then(function (status) { resolve(status); }, function (err) {
                var validErr = "Host does not exist: \"" + _this.machineName + "\"";
                if (err === validErr + "\n") {
                    resolve(validErr);
                }
                else {
                    reject(err);
                }
            });
        });
    };
    Machine.prototype.ipAddress = function () {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            base_1.run("docker-machine ip " + _this.machineName, _this.machineName, _this.isDebug, true).then(function (ip) {
                _this._ipAddress = ip;
                resolve(ip);
            }, function (err) { reject(err); });
        });
    };
    Machine.prototype.start = function (opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            _this.runWithoutDebugOnce(_this.status()).then(function (res) {
                if (res !== 'Running') {
                    _this.runStartMachine(opts).then(resolve, reject);
                }
                else {
                    base_1.Log.info("docker-machine [" + _this.machineName + "] status:", res);
                    resolve(res);
                }
            }, function (err) {
                _this.runStartMachine(opts).then(resolve, reject);
            });
        });
    };
    Machine.prototype.runStartMachine = function (opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var c = "docker-machine create";
            if (!opts) {
                opts = {};
            }
            c = base_1.addOpts(c, opts);
            if (!opts.driver) {
                c = base_1.addOpt(c, '--driver', 'virtualbox');
            }
            if (!opts.virtualboxMemory) {
                c = base_1.addOpt(c, '--virtualbox-memory', '6144');
            }
            if (!opts.virtualboxNoVtxCheck) {
                c = base_1.addOpt(c, '--virtualbox-no-vtx-check');
            }
            c += " " + _this.machineName;
            var progress = base_1.Log.infoProgress(_this.isDebug, "Starting VM \"" + _this.machineName + "\"");
            base_1.run(c, _this.machineName, _this.isDebug).then(function (resp) {
                environment_1.setEnvironment(_this.machineName);
                base_1.Log.terminateProgress(progress);
                resolve(resp);
            }, function (err) {
                base_1.Log.terminateProgress(progress);
                reject(err);
            });
        });
    };
    Machine.prototype.remove = function () {
        return base_1.run("docker-machine rm -f " + this.machineName, this.machineName, this.isDebug);
    };
    return Machine;
}(commonMethods_1.CommonMethods));
exports.Machine = Machine;
