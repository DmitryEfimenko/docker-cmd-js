import * as Q from 'q';
import inquirer = require('inquirer');
import { run, runWithoutDebug, success, resToJSON } from './base';
import { Debuggable } from './debuggable';

export class Image extends Debuggable {
    constructor(_debug) {
        super(_debug);
    }

    build(imageName: string, opts?: IBuildImageOpts) {
        return Q.Promise((resolve, reject) => {
            runWithoutDebug(`docker images --format {{.Repository}} ${imageName}`, true).then(
                (img) => {
                    if (img == imageName) {
                        if (opts && opts.buildAndReplace) {
                            this.remove(imageName).then(
                                () => { this.runBuildImage(imageName, opts).then(resolve, reject); },
                                reject
                            );
                        } else {
                            let promptOpts = {
                                type: 'list',
                                name: 'opts',
                                message: 'Image already exists. What would you like to do?',
                                choices: ['Build and replace old', 'Build and leave old one as dangling', 'Don not build']
                            };
                            inquirer.prompt(promptOpts).then((answers: any) => {
                                if (answers.opts == 'Build and replace old') {
                                    this.remove(imageName).then(
                                        () => { this.runBuildImage(imageName, opts).then(resolve, reject); },
                                        reject
                                    );
                                }
                                if (answers.opts == 'Build and leave old one as dangling') {
                                    this.runBuildImage(imageName, opts).then(resolve, reject);
                                }
                                if (answers.opts == 'Don not build') {
                                    resolve(undefined);
                                }
                            });
                        }
                    } else {
                        this.runBuildImage(imageName, opts).then(resolve, reject);
                    }
                }
            );
        });
    }

    remove(imageName: string) { 
        return run(`docker rmi -f ${imageName}`, this._debug);
    }

    checkForDangling() {
        return Q.Promise((resolve, reject) => {
            runWithoutDebug('docker images --filter dangling=true').then(
                (result) => {
                    var images = resToJSON(result);
                    if (images.length > 0) {
                        let promptOpts = {
                            type: 'list',
                            name: 'remove',
                            message: 'Found dangling images. Would you like to remove them?',
                            choices: ['Yes', 'No']
                        };
                        inquirer.prompt(promptOpts).then((answers: any) => {
                            if (answers.remove == 'Yes') {
                                let promises = [];
                                for (var i = 0, l = images.length; i < l; i++) {
                                    let p = this.remove(images[i]['IMAGE ID']);
                                    promises.push(p);
                                }
                                Q.all(promises).then(
                                    () => {
                                        success('Cleaned up dangling images.');
                                        resolve(true);
                                    },
                                    (err) => { err('could not clean up dangling images:', err); }
                                );
                            } else {
                                resolve(true);
                            }
                        });
                    } else {
                        resolve(true);
                    }
                },
                (err) => { err('could not check for dangling images:', err); }
            );
        });
    }

    private runBuildImage(imageName: string, opts?: IBuildImageOpts) {
        return Q.Promise((resolve, reject) => { 
            let c = `docker build -t ${imageName}`;
            c += (opts && opts.pathOrUrl) ? ` ${opts.pathOrUrl}` : ' .';
            run(c, this._debug).then(
                resolve,
                (err: string) => { 
                    if (err.indexOf('SECURITY WARNING:') > -1) {
                        // issue when warning returns as a critical error: https://github.com/docker/docker/issues/22623
                        resolve(true);
                    }
                    else
                        reject(err);
                }
            );
        });
    }
}

export interface IBuildImageOpts {
    pathOrUrl?: string;
    buildAndReplace?: boolean;
}