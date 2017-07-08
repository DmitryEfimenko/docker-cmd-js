import { CommonMethods } from './commonMethods';
export declare class Machine extends CommonMethods {
    _ipAddress: string;
    start: {
        hyperv: (opts?: ICreateOpts & ICreateOptsHyperv) => Promise<string>;
        virtualbox: (opts?: ICreateOpts & ICreateOptsVirtualbox) => Promise<string>;
    };
    constructor(machineName: string);
    status(): Promise<string>;
    ipAddress(): Promise<string>;
    startHyperv(opts?: ICreateOpts & ICreateOptsHyperv): Promise<string>;
    startVirtualbox(opts?: ICreateOpts & ICreateOptsVirtualbox): Promise<string>;
    remove(): Promise<string>;
    private _start<T>(opts?);
    private create(opts);
}
export interface ICreateOpts {
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
}
export interface ICreateOptsVirtualbox {
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
export interface ICreateOptsHyperv {
    hypervBoot2dockerUrl?: string;
    hypervVirtualSwitch?: string;
    hypervDiskSize?: string;
    hypervMemory?: string;
    hypervCpuCount?: string;
    hypervStaticMacaddress?: string;
    hypervVlanId?: string;
}
