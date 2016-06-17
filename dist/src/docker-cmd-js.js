"use strict";
var base_1 = require('./base');
var environment_1 = require('./environment');
var machine_1 = require('./machine');
var image_1 = require('./image');
var container_1 = require('./container');
var volume_1 = require('./volume');
var Cmd = (function () {
    function Cmd(machineName) {
        base_1.Opts.machineName = machineName !== undefined ? machineName : 'default';
        environment_1.setEnvironment(base_1.Opts.machineName);
        this.container = container_1.container;
        this.machine = machine_1.machine;
        this.image = image_1.image;
        this.volume = volume_1.volume;
    }
    Cmd.prototype.debug = function (debugging) {
        base_1.Opts.debug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    };
    Cmd.prototype.run = function (command, noNewLines) {
        return base_1.run(command, base_1.Opts.debug, noNewLines);
    };
    Cmd.prototype.runSync = function (command) {
        return base_1.runSync(command, base_1.Opts.debug);
    };
    Cmd.prototype.resToJSON = function (s) {
        return base_1.resToJSON(s);
    };
    return Cmd;
}());
exports.Cmd = Cmd;
