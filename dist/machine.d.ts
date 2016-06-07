import * as Q from 'q';
export declare class Machine {
    private machineName;
    private _debug;
    constructor(machineName: string, _debug: any);
    status(): Q.Promise<string>;
    ipAddress(): Q.Promise<string>;
    start(opts: IStartOpts): Q.Promise<{}>;
    private runStartMachine(opts?);
}
export interface IStartOpts {
    driver?: string;
    engineInstallUrl?: string;
    engineOpt?: string[];
    engineInsecureRegistry?: string[];
    engineRegistryMirror?: string[];
    engineLabel?: string[];
    engineStorageDriver?: boolean;
    engineEnv?: string[];
    swarm?: boolean;
    swarmImage?: string;
    swarmMaster?: boolean;
    swarmDiscovery?: boolean;
    swarmStrategy?: string;
    swarmOpt?: string[];
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
