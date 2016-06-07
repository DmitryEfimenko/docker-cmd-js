import * as Q from 'q';
import { run, addOpts, addOpt, info, err } from './base';
import { Debuggable } from './debuggable';

export class Machine extends Debuggable {
    constructor(private machineName: string, _debug) {
        super(_debug);
    }

    status() {
        return run('docker-machine status', this._debug, true);
    }

    ipAddress() { 
        return run(`docker-machine ip ${this.machineName}`, this._debug, true);
    }

    start(opts?: IStartOpts) {
        return Q.Promise((resolve, reject) => {
            this.runWithoutDebugOnce(this.status()).then(
                (res) => {
                    if (res != 'Running') {
                        this.runStartMachine(opts).then(resolve, reject);
                    } else {
                        info('docker-machine status:', res);
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
            if (!opts) opts = {};
            addOpts(c, opts);
            // set sinsible defaults
            if (!opts.driver) addOpt(c, '--driver', 'virtualbox');
            if (!opts.virtualboxMemory) addOpt(c, '--virtualbox-memory', '6144');
            if (!opts.virtualboxNoVtxCheck) addOpt(c, '--virtualbox-no-vtx-check');
            c += ` ${this.machineName}`;

            run(c, this._debug).then(
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