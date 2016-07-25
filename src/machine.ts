import * as Q from 'q';
import { run, addOpts, addOpt, Log } from './base';
import { CommonMethods } from './commonMethods';
import { setEnvironment } from './environment';

export class Machine extends CommonMethods {
    _ipAddress: string;

    constructor(machineName: string) {
        super(machineName);
    }

    status() {
        return Q.Promise<string>((resolve, reject) => {
            return run(`docker-machine status ${this.machineName}`, this.machineName, this.isDebug, true).then(
                (status) => { resolve(status); },
                (err) => {
                    let validErr = `Host does not exist: "${this.machineName}"`;
                    if (err === `${validErr}\n`) {
                        resolve(validErr);
                    } else {
                        reject(err);
                    }
                }
            );
        });
    }

    ipAddress() {
        return Q.Promise<string>((resolve, reject) => {
            run(`docker-machine ip ${this.machineName}`, this.machineName, this.isDebug, true).then(
                (ip) => {
                    this._ipAddress = ip;
                    resolve(ip);
                },
                (err) => { reject(err); }
            );
        });
    }

    start(opts?: IStartOpts) {
        return Q.Promise((resolve, reject) => {
            this.runWithoutDebugOnce(this.status()).then(
                (res) => {
                    if (res !== 'Running') {
                        this.runStartMachine(opts).then(resolve, reject);
                    } else {
                        Log.info(`docker-machine [${this.machineName}] status:`, res);
                        resolve(res);
                    }
                },
                (err) => {
                    this.runStartMachine(opts).then(resolve, reject);
                }
            );
        });
    }

    private runStartMachine(opts?: IStartOpts) {
        return Q.Promise((resolve, reject) => {
            let c = `docker-machine create`;
            if (!opts) { opts = {}; }
            c = addOpts(c, opts);
            // set sinsible defaults
            if (!opts.driver) { c = addOpt(c, '--driver', 'virtualbox'); }
            if (!opts.virtualboxMemory) { c = addOpt(c, '--virtualbox-memory', '6144'); }
            if (!opts.virtualboxNoVtxCheck) { c = addOpt(c, '--virtualbox-no-vtx-check'); }
            c += ` ${this.machineName}`;

            let progress = Log.infoProgress(this.isDebug, `Starting VM "${this.machineName}"`);
            run(c, this.machineName, this.isDebug).then(
                (resp) => {
                    setEnvironment(this.machineName);
                    Log.terminateProgress(progress);
                    resolve(resp);
                },
                (err) => {
                    Log.terminateProgress(progress);
                    reject(err);
                }
            );
        });
    }

    remove() {
        return run(`docker-machine rm -f ${this.machineName}`, this.machineName, this.isDebug);
    }
}

export interface IStartOpts {
    driver?: string;
    engineInstallUrl?: string;
    engineOpt?: string|string[];
    engineInsecureRegistry?: string|string[];
    engineRegistryMirror?: string|string[];
    engineLabel?: string|string[];
    engineStorageDriver?: boolean;
    engineEnv?: string|string[];
    swarm?: boolean;
    swarmImage?: string;
    swarmMaster?: boolean;
    swarmDiscovery?: boolean;
    swarmStrategy?: string;
    swarmOpt?: string|string[];
    swarmHost?: string;
    swarmAddr?: boolean;
    swarmExperimental?: boolean;

    virtualboxBoot2dockerUrl?: string;
    virtualboxCpuCount?: number;
    virtualboxDiskSize?: number;
    virtualboxHostDnsResolver?: boolean;
    virtualboxDnsProxy?: boolean;
    virtualboxHostonlyCidr?: string;
    virtualboxHostonlyNicpromisc?: string;
    virtualboxHostonlyNictype?: string;
    virtualboxImportBoot2dockerVm?: boolean;
    virtualboxMemory?: number;
    virtualboxNoShare?: boolean;
    virtualboxNoVtxCheck?: boolean;
}
