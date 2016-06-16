import * as Q from 'q';
import { Opts, run, addOpts, addOpt, Log } from './base';
import { CommonMethods } from './commonMethods';
import { setEnvironment } from './environment';

export class MachineStatic extends CommonMethods {
    _ipAddress: string;

    status() {
        return Q.Promise<string>((resolve, reject) => {
            return run(`docker-machine status ${Opts.machineName}`, Opts.debug, true).then(
                (status) => { resolve(status); },
                (err) => {
                    let validErr = `Host does not exist: "${Opts.machineName}"`;
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
            run(`docker-machine ip ${Opts.machineName}`, Opts.debug, true).then(
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
                        Log.info(`docker-machine [${Opts.machineName}] status:`, res);
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
            c += ` ${Opts.machineName}`;

            let progress = Log.infoProgress(`Starting VM "${Opts.machineName}"`);
            run(c, Opts.debug).then(
                (resp) => {
                    setEnvironment(Opts.machineName);
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
        return run(`docker-machine rm -f ${Opts.machineName}`, Opts.debug);
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

export var machine = new MachineStatic();
