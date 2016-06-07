"use strict";
var base_1 = require('./base');
var environment_1 = require('./environment');
var machine_1 = require('./machine');
var image_1 = require('./image');
var container_1 = require('./container');
var Cmd = (function () {
    function Cmd(machineName) {
        this.machineName = machineName;
        if (!this.machineName)
            this.machineName = 'default';
        environment_1.setEnvironment(this.machineName);
        this.machine = new machine_1.Machine(this.machineName, this._debug);
        this.image = new image_1.Image(this._debug);
        this.container = new container_1.Container(this._debug);
    }
    Cmd.prototype.debug = function () {
        this._debug = true;
        return this;
    };
    Cmd.prototype.run = function (command, noNewLines) {
        return base_1.run(command, this._debug, noNewLines);
    };
    Cmd.prototype.runSync = function (command) {
        return base_1.runSync(command, this._debug);
    };
    Cmd.prototype.resToJSON = function (s) {
        return base_1.resToJSON(s);
    };
    return Cmd;
}());
exports.Cmd = Cmd;
