import * as Q from 'q';
import { Opts, run, runWithoutDebug, addOpts, addOpt, Log, resToJSON } from './base';
import { machine } from './machine';
import { CommonMethods } from './commonMethods';
var tcpPortUsed = require('tcp-port-used');

export class ContainerStatic extends CommonMethods {

    waitForPort(opts: IWaitForPortOpts) {
        return Q.Promise((resolve, reject) => {
            if (!opts.retryIntervalMs) { opts.retryIntervalMs = 100; }
            if (!opts.timeoutMs) { opts.timeoutMs = 5000; }
            if (!opts.host) {
                machine.ipAddress().then(
                    (ipAddress) => {
                        opts.host = ipAddress;
                        this.runWaitForPort(opts).then(resolve, reject);
                    },
                    (err) => { reject(err); }
                );
            } else {
                this.runWaitForPort(opts).then(resolve, reject);
            }
        });
    }

    private runWaitForPort(opts: IWaitForPortOpts) {
        return tcpPortUsed.waitUntilFreeOnHost(opts.port, opts.host, opts.retryIntervalMs, opts.timeoutMs);
    }

    start(imageName, opts?: IStartDockerOpts, command?: string) {
        return Q.Promise((resolve, reject) => {
            let progress = Log.infoProgress('Checking if container needs to be started');
            let containerName = (opts && opts.name) ? opts.name : imageName;
            this.runWithoutDebugOnce(this.status(containerName)).then(
                (status) => {
                    if (!status) {
                        progress = Log.terminateProgress(progress).infoProgress(`Creating and starting container ${containerName}...`);
                        let c = `docker run -d`;
                        if (!opts) { opts = {}; }
                        c = addOpts(c, opts);
                        // set sinsible defaults
                        if (!opts.name) { c = addOpt(c, '--name', containerName); }
                        c += ` ${imageName}`;
                        if (command) { c += ` ${command}`; }
                        run(c, Opts.debug).then(
                            () => {
                                Log.terminateProgress(progress).info(`Container ${containerName} started.`);
                                resolve(true);
                            },
                            (err) => {
                                Log.terminateProgress(progress);
                                reject(err);
                            }
                        );
                    } else if (status.indexOf('Up') === 1) {
                        Log.terminateProgress(progress).info(`Container ${containerName} already started.`);
                        resolve(false);
                    } else if (status.indexOf('Exited') === 1) {
                        Log.terminateProgress(progress).info(`Container ${containerName} exists but is not started. Starting now.`);
                        runWithoutDebug(`docker start ${containerName}`).then(
                            () => { resolve(true); },
                            reject
                        );
                    } else {
                        Log.terminateProgress(progress);
                        reject(`Could not start container ${containerName()}. Status was ${status} Should never hit this.`);
                    }
                },
                (err) => {
                    Log.terminateProgress(progress);
                    reject(err);
                }
            );
        });
    }

    status(containerName: string) {
        return run(`docker ps -a --filter name=${containerName} --format "{{.Status}}"`, Opts.debug);
    }
}

export interface IStartDockerOpts {
    name?: string;
    publish?: string|string[];
    volume?: string;
    volumesFrom?: string|string[];
    link?: string|string[];
    env?: string|string[];
}

export interface IWaitForPortOpts {
    port: number;
    host?: string;
    retryIntervalMs?: number;
    timeoutMs?: number;
}

export var container = new ContainerStatic();
