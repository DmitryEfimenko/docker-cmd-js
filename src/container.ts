import * as Q from 'q';
import { run, runWithoutDebug, addOpts, addOpt, Log, resToJSON } from './base';
import { Debuggable } from './debuggable';

export class Container extends Debuggable {
    constructor(_debug) {
        super(_debug);
    }

    start(imageName, opts?: IStartDockerOpts, command?: string) {
        return Q.Promise((resolve, reject) => {
            let interval = Log.infoProgress('Checking if container needs to be started');
            let containerName = (opts && opts.name) ? opts.name : imageName;
            this.runWithoutDebugOnce(this.status(containerName)).then(
                (status) => {
                    if (!status) {
                        interval = Log.terminateInterval(interval).infoProgress(`Creating and starting container ${containerName}...`);
                        let c = `docker run -d`;
                        if (!opts) opts = {};
                        c = addOpts(c, opts);
                        // set sinsible defaults
                        if (!opts.name) c = addOpt(c, '--name', containerName);
                        c += ` ${imageName}`;
                        if (command) c += ` ${command}`;
                        run(c, this._debug).then(
                            () => {
                                Log.terminateInterval(interval).info(`Container ${containerName} started.`);
                                resolve(true);
                            },
                            (err) => {
                                Log.terminateInterval(interval)
                                reject(err);
                            }
                        );
                    } else if (status.indexOf('Up') == 1) {
                        Log.terminateInterval(interval).info(`Container ${containerName} already started.`);
                        resolve(false)
                    } else if (status.indexOf('Exited') == 1) {
                        Log.terminateInterval(interval).info(`Container ${containerName} exists but is not started. Starting now.`);
                        runWithoutDebug(`docker start ${containerName}`).then(
                            () => { resolve(true) },
                            reject
                        );
                    } else {
                        Log.terminateInterval(interval);
                        reject(`Could not start container ${containerName()}. Status was ${status} Should never hit this.`);
                    }
                },
                (err) => { 
                    Log.terminateInterval(interval);
                    reject(err);
                }
            );
        });
    }

    status(containerName: string) { 
        return run(`docker ps -a --filter name=${containerName} --format "{{.Status}}"`, this._debug);
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
