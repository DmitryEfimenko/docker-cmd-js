"use strict";
var base_1 = require('./base');
var environment_1 = require('./environment');
var Cmd = (function () {
    function Cmd(machineName) {
        this.machineName = machineName;
        if (!this.machineName)
            this.machineName = 'default';
        environment_1.setEnvironment(this.machineName);
    }
    Cmd.prototype.debug = function (debugging) {
        Opts.debug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    };
    Cmd.prototype.run = function (command, noNewLines) {
        return base_1.run(command, Opts.debug, noNewLines);
    };
    Cmd.prototype.runSync = function (command) {
        return base_1.runSync(command, Opts.debug);
    };
    Cmd.prototype.resToJSON = function (s) {
        return base_1.resToJSON(s);
    };
    return Cmd;
}());
exports.Cmd = Cmd;
var Opts = (function () {
    function Opts() {
    }
    return Opts;
}());
exports.Opts = Opts;
