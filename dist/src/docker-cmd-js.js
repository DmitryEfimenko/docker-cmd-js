"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var machine_1 = require("./machine");
var image_1 = require("./image");
var container_1 = require("./container");
var volume_1 = require("./volume");
var Cmd = (function () {
    function Cmd(machineName) {
        this.machineName = machineName !== undefined ? machineName : 'default';
        this.container = new container_1.Container(this.machineName);
        this.machine = new machine_1.Machine(this.machineName);
        this.image = new image_1.Image(this.machineName);
        this.volume = new volume_1.Volume(this.machineName);
    }
    Cmd.prototype.debug = function (debugging) {
        this.isDebug = (debugging === undefined || debugging === true) ? true : false;
        this.container.debug(this.isDebug);
        return this;
    };
    Cmd.prototype.run = function (command, noNewLines) {
        return base_1.run(command, this.machineName, this.isDebug, noNewLines);
    };
    Cmd.prototype.runSync = function (command) {
        return base_1.runSync(command, this.machineName, this.isDebug);
    };
    Cmd.prototype.resToJSON = function (s) {
        return base_1.resToJSON(s);
    };
    return Cmd;
}());
exports.Cmd = Cmd;
