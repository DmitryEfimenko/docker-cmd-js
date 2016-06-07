"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var base_1 = require('./base');
var debuggable_1 = require('./debuggable');
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(_debug) {
        _super.call(this, _debug);
    }
    Container.prototype.start = function (imageName, opts, command) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var containerName = (opts && opts.name) ? opts.name : imageName;
            _this.runWithoutDebugOnce(_this.status(containerName)).then(function (status) {
                if (!status) {
                    base_1.info("Creating and starting container " + containerName + "...");
                    var c = "docker run -d";
                    if (!opts)
                        opts = {};
                    base_1.addOpts(c, opts);
                    // set sinsible defaults
                    if (!opts.name)
                        base_1.addOpt(c, '--name', containerName);
                    c += " " + imageName;
                    if (command)
                        c += " " + command;
                    base_1.run(c, _this._debug).then(function () { resolve(true); }, reject);
                }
                else if (status.indexOf('Up') == 1) {
                    base_1.info("Container " + containerName + " already started.");
                    resolve(false);
                }
                else if (status.indexOf('Exited') == 1) {
                    base_1.info("Container " + containerName + " exists but is not started. Starting now.");
                    base_1.runWithoutDebug("docker start " + containerName).then(function () { resolve(true); }, reject);
                }
                else {
                    reject("Could not start container " + containerName() + ". Status was " + status + " Should never hit this.");
                }
            }, reject);
        });
    };
    Container.prototype.status = function (containerName) {
        return base_1.run("docker ps -a --filter name=" + containerName + " --format \"{{.Status}}\"", this._debug);
    };
    return Container;
}(debuggable_1.Debuggable));
exports.Container = Container;
