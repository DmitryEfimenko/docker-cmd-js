import * as Q from 'q';
import { run, runWithoutDebug, addOpts, addOpt, info, err, success, resToJSON } from './base';

export class Container{
    constructor(private _debug) { 
    }

    start(imageName, opts?: IStartDockerOpts, command?: string) {
        return Q.Promise((resolve, reject) => {
            let containerName = (opts && opts.name) ? opts.name : imageName;
            let _d = this._debug;
            this._debug = false;
            this.status(containerName).then(
                (status) => {
                    if (!status) {
                        info(`Creating and starting container ${containerName}...`);
                        let c = `docker run -d`;
                        if (!opts) opts = {};
                        addOpts(c, opts);
                        // set sinsible defaults
                        if (!opts.name) addOpt(c, '--name', containerName);
                        c += ` ${imageName}`;
                        if (command) c += ` ${command}`;
                        this._debug = _d;
                        run(c, this._debug).then(() => { resolve(true); }, reject);
                    } else if (status.indexOf('Up') == 1) {
                        info(`Container ${containerName} already started.`);
                        resolve(false)
                    } else if (status.indexOf('Exited') == 1) {
                        info(`Container ${containerName} exists but is not started. Starting now.`);
                        runWithoutDebug(`docker start ${containerName}`).then(
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
