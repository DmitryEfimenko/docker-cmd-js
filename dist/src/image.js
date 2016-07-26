"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var inquirer = require('inquirer');
var base_1 = require('./base');
var commonMethods_1 = require('./commonMethods');
var Image = (function (_super) {
    __extends(Image, _super);
    function Image(machineName) {
        _super.call(this, machineName);
    }
    Image.prototype.build = function (imageName, opts) {
        var _this = this;
        if (opts && opts.freshBuild && opts.buildOnlyIfMissing) {
            throw new Error('can\'t use both optsions "freshBuild" and "buildOnlyIfMissing" at the same time');
        }
        return Q.Promise(function (resolve, reject) {
            base_1.runWithoutDebug("docker images --format {{.Repository}} " + imageName, _this.machineName, true).then(function (img) {
                if (img === imageName) {
                    if (opts && opts.regularBuild) {
                        _this.runBuildImage(imageName, opts).then(resolve, reject);
                    }
                    else if (opts && opts.freshBuild) {
                        _this.remove(imageName).then(function () { _this.runBuildImage(imageName, opts).then(resolve, reject); }, reject);
                    }
                    else if (opts && opts.buildOnlyIfMissing) {
                        resolve(undefined);
                    }
                    else {
                        var promptChoices_1 = {
                            regularBuild: 'Regular build (using cache)',
                            freshBuild: 'Fresh build (remove cache)',
                            noBuild: 'Don not build'
                        };
                        var promptOpts = {
                            type: 'list',
                            name: 'opts',
                            message: "Image \"" + imageName + "\" already exists. What would you like to do?",
                            choices: [promptChoices_1.regularBuild, promptChoices_1.freshBuild, promptChoices_1.noBuild]
                        };
                        inquirer.prompt(promptOpts).then(function (answers) {
                            if (answers.opts === promptChoices_1.regularBuild) {
                                _this.runBuildImage(imageName, opts).then(resolve, reject);
                            }
                            if (answers.opts === promptChoices_1.freshBuild) {
                                _this.remove(imageName).then(function () { _this.runBuildImage(imageName, opts).then(resolve, reject); }, reject);
                            }
                            if (answers.opts === promptChoices_1.noBuild) {
                                resolve(undefined);
                            }
                        });
                    }
                }
                else {
                    _this.runBuildImage(imageName, opts).then(resolve, reject);
                }
            });
        });
    };
    Image.prototype.remove = function (imageName) {
        return base_1.run("docker rmi -f " + imageName, this.machineName, this.isDebug);
    };
    Image.prototype.checkForDangling = function () {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            base_1.runWithoutDebug('docker images --filter dangling=true', _this.machineName).then(function (result) {
                var images = base_1.resToJSON(result);
                if (images.length > 0) {
                    var promptOpts = {
                        type: 'list',
                        name: 'remove',
                        message: 'Found dangling images. Would you like to remove them?',
                        choices: ['Yes', 'No']
                    };
                    inquirer.prompt(promptOpts).then(function (answers) {
                        if (answers.remove === 'Yes') {
                            var promises = [];
                            for (var i = 0, l = images.length; i < l; i++) {
                                var p = _this.remove(images[i]['IMAGE ID']);
                                promises.push(p);
                            }
                            Q.all(promises).then(function () {
                                base_1.Log.success('Cleaned up dangling images.');
                                resolve(true);
                            }, function (err) { err('could not clean up dangling images:', err); });
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
                else {
                    resolve(true);
                }
            }, function (err) { err('could not check for dangling images:', err); });
        });
    };
    Image.prototype.runBuildImage = function (imageName, opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var c = "docker build -t " + imageName;
            c += (opts && opts.pathOrUrl) ? " " + opts.pathOrUrl : ' .';
            var progress = base_1.Log.infoProgress(_this.isDebug, "Building image " + imageName);
            base_1.run(c, _this.machineName, _this.isDebug).then(function () {
                base_1.Log.terminateProgress(progress).info("Image " + imageName + " built");
                resolve(true);
            }, function (err) {
                if (err.indexOf('SECURITY WARNING:') > -1) {
                    base_1.Log.terminateProgress(progress).info("Image " + imageName + " built");
                    resolve(true);
                }
                else {
                    base_1.Log.terminateProgress(progress);
                    reject(err);
                }
            });
        });
    };
    return Image;
}(commonMethods_1.CommonMethods));
exports.Image = Image;
