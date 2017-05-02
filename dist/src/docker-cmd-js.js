"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const machine_1 = require("./machine");
const image_1 = require("./image");
const container_1 = require("./container");
const volume_1 = require("./volume");
class Cmd {
    constructor(machineName) {
        this.machineName = machineName !== undefined ? machineName : 'default';
        this.container = new container_1.Container(this.machineName);
        this.machine = new machine_1.Machine(this.machineName);
        this.image = new image_1.Image(this.machineName);
        this.volume = new volume_1.Volume(this.machineName);
    }
    debug(debugging) {
        this.isDebug = (debugging === undefined || debugging === true) ? true : false;
        this.container.debug(this.isDebug);
        return this;
    }
    run(command, noNewLines) {
        return base_1.run(command, this.machineName, this.isDebug, noNewLines);
    }
    runSync(command) {
        return base_1.runSync(command, this.machineName, this.isDebug);
    }
    resToJSON(s) {
        return base_1.resToJSON(s);
    }
}
exports.Cmd = Cmd;
