
import colors = require('colors');
import inquirer = require('inquirer');
import { spawn } from './childProcessHelpers';
import { setEnvironment } from './environment';
import * as Q from 'q';

export class Cmd {
    private _debug: boolean;
    private _env;

    constructor(public machineName?: string) {
        if (!this.machineName) this.machineName = 'default';
        setEnvironment(this.machineName);
    }

    debug() {
        this._debug = true;
        return this;
    }

    runWithoutDebug(command: string, noNewLines?: boolean) {
        return Q.Promise<string>((resolve, reject) => {
            let _debug = this._debug;
            this._debug = false;
            this.run(command, noNewLines)
                .then(resolve, reject)
                .finally(() => { this._debug = _debug; })
        });
    }

    run(command: string, noNewLines?: boolean): Q.Promise<string> {
        if (this._debug) {
            this.info('Running:', command);
        }

        let deferred = Q.defer<string>();
        spawn(command, process.env, (result) => {
            if (this._debug) {
                if (result.stdErr) {
                    this.err('command finnished with errors.')
                    if (result.stdErr.toLowerCase().indexOf('no space left on device') > -1) {
                        this.checkForDanglingImages(() => {
                            if (result.stdErr) deferred.reject(result.stdErr);
                            else deferred.resolve(result.stdOut);
                        });
                    } else {
                        deferred.reject(result.stdErr);
                    }
                } else
                    deferred.resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
            } else {
                if (result.stdErr) deferred.reject(result.stdErr);
                else deferred.resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
            }
        });
        return deferred.promise;
    }

    private checkForDanglingImages(cb: () => void) {
        this.runWithoutDebug('docker images --filter dangling=true').then(
            (result) => {
                var images = this.resToJSON(result);
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
                                let p = this.removeImage(images[i]['IMAGE ID']);
                                promises.push(p);
                            }
                            Q.all(promises).then(
                                () => {
                                    console.log(colors.green('Cleaned up dangling images. Try running your command again.'));
                                    cb();
                                },
                                (err) => { this.err('could not clean up dangling images:', err); }
                            );
                        } else {
                            cb();
                        }
                    });
                } else {
                    cb();
                }
            },
            (err) => { this.err('could not check for dangling images:', err); }
        );
    }

    private machineStatus(cb: () => void) {
        this.run('docker-machine status').then(
            (result) => {
                console.log(result);
                if (result != 'Running') {
                    console.log('TODO');
                }
                cb();
            },
            (err) => { console.log(colors.red('could not get docket-machine status:'), err); }
        );
    }

    startMachine(memory: number) {
        return Q.Promise((resolve, reject) => {
            this.runWithoutDebug(`docker-machine status ${this.machineName}`, true).then(
                (res) => {
                    if (res != 'Running') {
                        this.runStartMachine(memory).then(resolve, reject);
                    } else {
                        this.info('docker-machine status:', res);
                        resolve(res);
                    }
                },
                (err) => {
                    this.runStartMachine(memory).then(resolve, reject);
                }
            );
        });
    }

    private runStartMachine(memory) {
        return Q.Promise((resolve, reject) => {
            this.info(`Starting virtual machine ${this.machineName} (memory: ${memory})`);
            this.runWithoutDebug(`docker-machine create --driver virtualbox --virtualbox-no-vtx-check ${memory ? '--virtualbox-memory ' + memory : ''} ${this.machineName}`).then(
                (resp) => { resolve(resp); },
                (err) => { reject(err); }
            );
        });
    }

    machineIpAddress() {
        return this.runWithoutDebug(`docker-machine ip ${this.machineName}`, true);
    }

    buildImage(imageName: string, opts?: IBuildImageOpts) {
        return Q.Promise((resolve, reject) => {
            this.runWithoutDebug(`docker images --format {{.Repository}} ${imageName}`, true).then(
                (img) => {
                    if (img == imageName) {
                        if (opts && opts.buildAndReplace) {
                            this.removeImage(imageName).then(
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
                                    this.removeImage(imageName).then(
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

    private runBuildImage(imageName: string, opts?: IBuildImageOpts) {
        return Q.Promise((resolve, reject) => { 
            this.info(`Building image ${imageName} via dockerFile: ${opts && opts.dockerFile ? opts.dockerFile : 'Dockerfile'}...`);
            let c = `docker build -t ${imageName}`;
            c += (opts && opts.dockerFile) ? ` ${opts.dockerFile}` : ' .';
            this.runWithoutDebug(c).then(
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

    removeImage(imageName) {
        return this.runWithoutDebug(`docker rmi -f ${imageName}`);
    }

    startContainer(imageName, opts?: IStartDockerOpts, command?: string) {
        return Q.Promise((resolve, reject) => {
            let containerName = (opts && opts.name) ? opts.name : imageName;
            this.runWithoutDebug(`docker ps -a --filter name=${containerName} --format "{{.Status}}"`).then(
                (status) => {
                    if (!status) {
                        this.info(`Creating and starting container ${containerName}...`);
                        let c = `docker run -d --name ${containerName}`;
                        if (opts) {
                            if (opts.port) c += ` -p ${opts.port}`;
                            if (opts.volume) c += ` --volume ${opts.volume}`;
                            if (opts.volumesFrom) c += ` --volumes-from ${opts.volumesFrom}`;
                            if (opts.link) c += ` --link ${opts.link}`;
                            if (opts.env) {
                                for (var i = 0, l = opts.env.length; i < l; i++) {
                                    c += ` -e ${opts.env[i]}`;
                                }
                            }
                        }
                        c += ` ${imageName}`;
                        if (command) c += ` ${command}`;
                        this.runWithoutDebug(c).then(() => { resolve(true); }, reject);
                    } else if (status.indexOf('Up') == 1) {
                        this.info(`Container ${containerName} already started.`);
                        resolve(false)
                    } else if (status.indexOf('Exited') == 1) {
                        this.info(`Container ${containerName} exists but is not started. Starting now.`);
                        this.runWithoutDebug(`docker start ${containerName}`).then(
                            () => { resolve(true) },
                            reject
                        );
                    } else {
                        reject(`Could not start container ${containerName()}. Status was ${status} Should never hit this.`);
                    }
                },
                reject
            );
        });
    }

    resToJSON(s: string): any[] {
        let lines = s.split('\n').filter((val) => val != '');
        let headerLine = lines.shift();
        let arr = headerLine.split(' ');
        let cols: { name: string, length: number }[] = [];
        for (let i = 0, l = arr.length; i < l; i++) {
            if (arr[i] !== '') {
                let col = { name: arr[i], length: arr[i].length };
                if (arr[i + 1] != undefined && arr[i + 1] != '') {
                    col.name = col.name + ' ' + arr[i + 1];
                    col.length = col.length + arr[i + 1].length + 1;
                    i = i + 1;
                }
                cols.push(col);
            } else {
                cols[cols.length - 1].length = cols[cols.length - 1].length + 1;
            }
        }

        let result = [];
        for (let i = 0, l = lines.length; i < l; i++) {
            let obj = {};
            for (let c = 0, cl = cols.length; c < cl; c++) {
                obj[cols[c].name] = lines[i].substring(0, cols[c].length + 1).trim();
                lines[i] = lines[i].substring(cols[c].length + 1, lines[i].length - 1);
            }
            result.push(obj);
        }
        return result;
    }

    private info(...message: string[]) {
        console.log(colors.cyan(message.join(' ')));
    }

    private err(...message: string[]) {
        console.log(colors.red(message.join(' ')));
    }
}

export interface IStartDockerOpts {
    name?: string;
    port?: string;
    volume?: string;
    volumesFrom?: string;
    link?: string;
    env?: string[];
}

export interface IBuildImageOpts {
    dockerFile?: string;
    buildAndReplace?: boolean;
}