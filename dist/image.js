"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var inquirer = require('inquirer');
var docker_cmd_js_1 = require('./docker-cmd-js');
var base_1 = require('./base');
var commonMethods_1 = require('./commonMethods');
var Image = (function (_super) {
    __extends(Image, _super);
    function Image() {
        _super.apply(this, arguments);
    }
    Image.build = function (imageName, opts) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            base_1.runWithoutDebug("docker images --format {{.Repository}} " + imageName, true).then(function (img) {
                if (img == imageName) {
                    if (opts && opts.buildAndReplace) {
                        _this.remove(imageName).then(function () { _this.runBuildImage(imageName, opts).then(resolve, reject); }, reject);
                    }
                    else {
                        var promptOpts = {
                            type: 'list',
                            name: 'opts',
                            message: 'Image already exists. What would you like to do?',
                            choices: ['Build and replace old', 'Build and leave old one as dangling', 'Don not build']
                        };
                        inquirer.prompt(promptOpts).then(function (answers) {
                            if (answers.opts == 'Build and replace old') {
                                _this.remove(imageName).then(function () { _this.runBuildImage(imageName, opts).then(resolve, reject); }, reject);
                            }
                            if (answers.opts == 'Build and leave old one as dangling') {
                                _this.runBuildImage(imageName, opts).then(resolve, reject);
                            }
                            if (answers.opts == 'Don not build') {
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
    Image.remove = function (imageName) {
        return base_1.run("docker rmi -f " + imageName, docker_cmd_js_1.Opts.debug);
    };
    Image.checkForDangling = function () {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            base_1.runWithoutDebug('docker images --filter dangling=true').then(function (result) {
                var images = base_1.resToJSON(result);
                if (images.length > 0) {
                    var promptOpts = {
                        type: 'list',
                        name: 'remove',
                        message: 'Found dangling images. Would you like to remove them?',
                        choices: ['Yes', 'No']
                    };
                    inquirer.prompt(promptOpts).then(function (answers) {
                        if (answers.remove == 'Yes') {
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
    Image.runBuildImage = function (imageName, opts) {
        return Q.Promise(function (resolve, reject) {
            var c = "docker build -t " + imageName;
            c += (opts && opts.pathOrUrl) ? " " + opts.pathOrUrl : ' .';
            var progress = base_1.Log.infoProgress("Building image " + imageName);
            base_1.run(c, docker_cmd_js_1.Opts.debug).then(function () {
                base_1.Log.terminateProgress(progress).info("Image " + imageName + " built");
                resolve(true);
            }, function (err) {
                if (err.indexOf('SECURITY WARNING:') > -1) {
                    // issue when warning returns as a critical error: https://github.com/docker/docker/issues/22623
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
