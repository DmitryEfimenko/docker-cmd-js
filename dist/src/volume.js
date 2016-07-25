"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var base_1 = require('./base');
var commonMethods_1 = require('./commonMethods');
var Volume = (function (_super) {
    __extends(Volume, _super);
    function Volume(machineName) {
        _super.call(this, machineName);
    }
    Volume.prototype.create = function (opts, advOpts) {
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
    Volume.prototype.runCreate = function (opts) {
        var c = 'docker volume create';
        if (!opts) {
            opts = {};
        }
        c = base_1.addOpts(c, opts);
        return base_1.run(c, this.machineName, this.isDebug);
    };
    Volume.prototype.inspect = function (volumeName) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            base_1.run("docker volume inspect " + volumeName, _this.machineName, _this.isDebug).then(function (res) {
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
    Volume.prototype.remove = function (volumeName) {
        return base_1.run("docker volume rm " + volumeName, this.machineName, this.isDebug);
    };
    return Volume;
}(commonMethods_1.CommonMethods));
exports.Volume = Volume;
