"use strict";
const Q = require('q');
const inquirer = require('inquirer');
const base_1 = require('./base');
const commonMethods_1 = require('./commonMethods');
class Image extends commonMethods_1.CommonMethods {
    constructor(machineName) {
        super(machineName);
    }
    build(imageName, opts) {
        if (opts && opts.freshBuild && opts.buildOnlyIfMissing) {
            throw new Error('can\'t use both optsions "freshBuild" and "buildOnlyIfMissing" at the same time');
        }
        return Q.Promise((resolve, reject) => {
            base_1.runWithoutDebug(`docker images --format {{.Repository}} ${imageName}`, this.machineName, true).then((img) => {
                if (img === imageName) {
                    if (opts && opts.regularBuild) {
                        this.runBuildImage(imageName, opts).then(resolve, reject);
                    }
                    else if (opts && opts.freshBuild) {
                        this.remove(imageName).then(() => { this.runBuildImage(imageName, opts).then(resolve, reject); }, reject);
                    }
                    else if (opts && opts.buildOnlyIfMissing) {
                        resolve(undefined);
                    }
                    else {
                        let promptChoices = {
                            regularBuild: 'Regular build (using cache)',
                            freshBuild: 'Fresh build (remove cache)',
                            noBuild: 'Don not build'
                        };
                        let promptOpts = {
                            type: 'list',
                            name: 'opts',
                            message: `Image "${imageName}" already exists. What would you like to do?`,
                            choices: [promptChoices.regularBuild, promptChoices.freshBuild, promptChoices.noBuild]
                        };
                        inquirer.prompt(promptOpts).then((answers) => {
                            if (answers.opts === promptChoices.regularBuild) {
                                this.runBuildImage(imageName, opts).then(resolve, reject);
                            }
                            if (answers.opts === promptChoices.freshBuild) {
                                this.remove(imageName).then(() => { this.runBuildImage(imageName, opts).then(resolve, reject); }, reject);
                            }
                            if (answers.opts === promptChoices.noBuild) {
                                resolve(undefined);
                            }
                        });
                    }
                }
                else {
                    this.runBuildImage(imageName, opts).then(resolve, reject);
                }
            });
        });
    }
    remove(imageName) {
        return base_1.run(`docker rmi -f ${imageName}`, this.machineName, this.isDebug);
    }
    checkForDangling() {
        return Q.Promise((resolve, reject) => {
            base_1.runWithoutDebug('docker images --filter dangling=true', this.machineName).then((result) => {
                var images = base_1.resToJSON(result);
                if (images.length > 0) {
                    let promptOpts = {
                        type: 'list',
                        name: 'remove',
                        message: 'Found dangling images. Would you like to remove them?',
                        choices: ['Yes', 'No']
                    };
                    inquirer.prompt(promptOpts).then((answers) => {
                        if (answers.remove === 'Yes') {
                            let promises = [];
                            for (var i = 0, l = images.length; i < l; i++) {
                                let p = this.remove(images[i]['IMAGE ID']);
                                promises.push(p);
                            }
                            Q.all(promises).then(() => {
                                base_1.Log.success('Cleaned up dangling images.');
                                resolve(true);
                            }, (err) => { err('could not clean up dangling images:', err); });
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
                else {
                    resolve(true);
                }
            }, (err) => { err('could not check for dangling images:', err); });
        });
    }
    runBuildImage(imageName, opts) {
        return Q.Promise((resolve, reject) => {
            let c = `docker build -t ${imageName}`;
            c += (opts && opts.pathOrUrl) ? ` ${opts.pathOrUrl}` : ' .';
            let progress = base_1.Log.infoProgress(this.isDebug, `Building image ${imageName}`);
            base_1.run(c, this.machineName, this.isDebug).then(() => {
                base_1.Log.terminateProgress(progress).info(`Image ${imageName} built`);
                resolve(true);
            }, (err) => {
                if (err.indexOf('SECURITY WARNING:') > -1) {
                    base_1.Log.terminateProgress(progress).info(`Image ${imageName} built`);
                    resolve(true);
                }
                else {
                    base_1.Log.terminateProgress(progress);
                    reject(err);
                }
            });
        });
    }
}
exports.Image = Image;
