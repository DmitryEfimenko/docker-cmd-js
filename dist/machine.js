"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var base_1 = require('./base');
var commonMethods_1 = require('./commonMethods');
var Machine = (function (_super) {
    __extends(Machine, _super);
    function Machine() {
        _super.apply(this, arguments);
    }
    Machine.prototype.status = function () {
        return this.status();
    };
    Machine.status = function () {
        return base_1.run('docker-machine status', base_1.Opts.debug, true);
    };
    Machine.prototype.ipAddress = function () {
        return this.ipAddress();
    };
    Machine.ipAddress = function () {
        return base_1.run("docker-machine ip " + base_1.Opts.machineName, base_1.Opts.debug, true);
    };
    Machine.prototype.start = function (opts) {
        return this.start(opts);
    };
    Machine.start = function (opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            _this.runWithoutDebugOnce(_this.status()).then(function (res) {
                if (res != 'Running') {
                    _this.runStartMachine(opts).then(resolve, reject);
                }
                else {
                    base_1.Log.info('docker-machine status:', res);
                    resolve(res);
                }
            }, function (err) {
                _this.runStartMachine(opts).then(resolve, reject);
            });
        });
    };
    Machine.runStartMachine = function (opts) {
        return Q.Promise(function (resolve, reject) {
            var c = "docker-machine create";
            if (!opts)
                opts = {};
            c = base_1.addOpts(c, opts);
            // set sinsible defaults
            if (!opts.driver)
                c = base_1.addOpt(c, '--driver', 'virtualbox');
            if (!opts.virtualboxMemory)
                c = base_1.addOpt(c, '--virtualbox-memory', '6144');
            if (!opts.virtualboxNoVtxCheck)
                c = base_1.addOpt(c, '--virtualbox-no-vtx-check');
            c += " " + base_1.Opts.machineName;
            base_1.run(c, base_1.Opts.debug).then(function (resp) { resolve(resp); }, function (err) { reject(err); });
        });
    };
    return Machine;
}(commonMethods_1.CommonMethods));
exports.Machine = Machine;
