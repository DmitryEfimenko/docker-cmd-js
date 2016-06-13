import * as Q from 'q';
import { Opts, run, addOpts, addOpt, Log } from './base';
import { CommonMethods } from './commonMethods';

export class MachineStatic extends CommonMethods {

    status() {
        return run('docker-machine status', Opts.debug, true);
    }

    ipAddress() {
        return run(`docker-machine ip ${Opts.machineName}`, Opts.debug, true);
    }

    start(opts?: IStartOpts) {
        return Q.Promise((resolve, reject) => {
            this.runWithoutDebugOnce(this.status()).then(
                (res) => {
                    if (res !== 'Running') {
                        this.runStartMachine(opts).then(resolve, reject);
                    } else {
                        Log.info('docker-machine status:', res);
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

            run(c, Opts.debug).then(
                (resp) => { resolve(resp); },
                (err) => { reject(err); }
            );
        });
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
