"use strict";
var Q = require('q');
var base_1 = require('./base');
var Machine = (function () {
    function Machine(machineName, _debug) {
        this.machineName = machineName;
        this._debug = _debug;
    }
    Machine.prototype.status = function () {
        return base_1.run('docker-machine status', this._debug, true);
    };
    Machine.prototype.ipAddress = function () {
        return base_1.run("docker-machine ip " + this.machineName, this._debug, true);
    };
    Machine.prototype.start = function (opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            base_1.runWithoutDebug("docker-machine status " + _this.machineName, true).then(function (res) {
                if (res != 'Running') {
                    _this.runStartMachine(opts).then(resolve, reject);
                }
                else {
                    base_1.info('docker-machine status:', res);
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
            if (!opts)
                opts = {};
            base_1.addOpts(c, opts);
            // set sinsible defaults
            if (!opts.driver)
                base_1.addOpt(c, '--driver', 'virtualbox');
            if (!opts.virtualboxMemory)
                base_1.addOpt(c, '--virtualbox-memory', '6144');
            if (!opts.virtualboxNoVtxCheck)
                base_1.addOpt(c, '--virtualbox-no-vtx-check');
            c += " " + _this.machineName;
            base_1.run(c, _this._debug).then(function (resp) { resolve(resp); }, function (err) { reject(err); });
        });
    };
    return Machine;
}());
exports.Machine = Machine;
