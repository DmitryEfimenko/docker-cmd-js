"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var base_1 = require('./base');
var commonMethods_1 = require('./commonMethods');
var VolumeStatic = (function (_super) {
    __extends(VolumeStatic, _super);
    function VolumeStatic() {
        _super.apply(this, arguments);
    }
    VolumeStatic.prototype.create = function (opts, advOpts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            if (advOpts && advOpts.createOnlyIfMissing) {
                if (!opts || !opts.name) {
                    throw new Error('You must specify name when using "createOnlyIfMissing" option.');
                }
                _this.runWithoutDebugOnce(_this.inspect(opts.name)).then(function (res) {
                    if (res.length > 0) {
                        resolve(res[0].Name);
                    }
                    else {
                        _this.runCreate(opts).then(resolve, reject);
                    }
                }, function (err) { reject(err); });
            }
            else {
                _this.runCreate(opts).then(resolve, reject);
            }
        });
    };
    VolumeStatic.prototype.runCreate = function (opts) {
        var c = 'docker volume create';
        if (!opts) {
            opts = {};
        }
        c = base_1.addOpts(c, opts);
        return base_1.run(c, base_1.Opts.debug);
    };
    VolumeStatic.prototype.inspect = function (volumeName) {
        return Q.Promise(function (resolve, reject) {
            base_1.run("docker volume inspect " + volumeName, base_1.Opts.debug).then(function (res) {
                var json = JSON.parse(res);
                resolve(json);
            }, function (err) {
                if (err === "Error: No such volume: " + volumeName + "\n") {
                    resolve([]);
                }
                else {
                    reject(err);
                }
            });
        });
    };
    VolumeStatic.prototype.remove = function (volumeName) {
        return base_1.run("docker volume rm " + volumeName, base_1.Opts.debug);
    };
    return VolumeStatic;
}(commonMethods_1.CommonMethods));
exports.VolumeStatic = VolumeStatic;
exports.volume = new VolumeStatic();
