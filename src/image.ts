import * as Q from 'q';
import inquirer = require('inquirer');
import { Opts, run, runWithoutDebug, Log, resToJSON } from './base';
import { CommonMethods } from './commonMethods';

export class ImageStatic extends CommonMethods {

    build(imageName: string, opts?: IBuildImageOpts) {
        if (opts && opts.freshBuild && opts.buildOnlyIfMissing) {
            throw new Error('can\'t use both optsions "freshBuild" and "buildOnlyIfMissing" at the same time');
        }
        return Q.Promise((resolve, reject) => {
            runWithoutDebug(`docker images --format {{.Repository}} ${imageName}`, true).then(
                (img) => {
                    if (img === imageName) {
                        // image exists
                        if (opts && opts.regularBuild) {
                            this.runBuildImage(imageName, opts).then(resolve, reject);
                        } else if (opts && opts.freshBuild) {
                            this.remove(imageName).then(
                                () => { this.runBuildImage(imageName, opts).then(resolve, reject); },
                                reject
                            );
                        } else if (opts && opts.buildOnlyIfMissing) {
                            resolve(undefined);
                        } else {
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
                            inquirer.prompt(promptOpts).then((answers: any) => {
                                if (answers.opts === promptChoices.regularBuild) {
                                    this.runBuildImage(imageName, opts).then(resolve, reject);
                                }
                                if (answers.opts === promptChoices.freshBuild) {
                                    this.remove(imageName).then(
                                        () => { this.runBuildImage(imageName, opts).then(resolve, reject); },
                                        reject
                                    );
                                }
                                if (answers.opts === promptChoices.noBuild) {
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
        return run(`docker rmi -f ${imageName}`, Opts.debug);
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
                            if (answers.remove === 'Yes') {
                                let promises = [];
                                for (var i = 0, l = images.length; i < l; i++) {
                                    let p = this.remove(images[i]['IMAGE ID']);
                                    promises.push(p);
                                }
                                Q.all(promises).then(
                                    () => {
                                        Log.success('Cleaned up dangling images.');
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
            let progress = Log.infoProgress(`Building image ${imageName}`);
            run(c, Opts.debug).then(
                () => {
                    Log.terminateProgress(progress).info(`Image ${imageName} built`);
                    resolve(true);
                },
                (err: string) => {
                    if (err.indexOf('SECURITY WARNING:') > -1) {
                        // issue when warning returns as a critical error: https://github.com/docker/docker/issues/22623
                        Log.terminateProgress(progress).info(`Image ${imageName} built`);
                        resolve(true);
                    } else {
                        Log.terminateProgress(progress);
                        reject(err);
                    }
                }
            );
        });
    }
}

export interface IBuildImageOpts {
    pathOrUrl?: string;
    regularBuild?: boolean;
    freshBuild?: boolean;
    buildOnlyIfMissing?: boolean;
}

export var image = new ImageStatic();
