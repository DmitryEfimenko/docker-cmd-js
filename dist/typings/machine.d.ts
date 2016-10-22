import { CommonMethods } from './commonMethods';
export declare class Machine extends CommonMethods {
    _ipAddress: string;
    constructor(machineName: string);
    status(): Promise<string>;
    ipAddress(): Promise<string>;
    start(opts?: IStartOpts): Promise<{}>;
    private runStartMachine(opts?);
    remove(): Promise<string>;
}
export interface IStartOpts {
    driver?: string;
    engineInstallUrl?: string;
    engineOpt?: string | string[];
    engineInsecureRegistry?: string | string[];
    engineRegistryMirror?: string | string[];
    engineLabel?: string | string[];
    engineStorageDriver?: boolean;
    engineEnv?: string | string[];
    swarm?: boolean;
    swarmImage?: string;
    swarmMaster?: boolean;
    swarmDiscovery?: boolean;
    swarmStrategy?: string;
    swarmOpt?: string | string[];
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
