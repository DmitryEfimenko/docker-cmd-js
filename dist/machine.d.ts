import * as Q from 'q';
import { CommonMethods } from './commonMethods';
export declare class Machine extends CommonMethods {
    static status(): Q.Promise<string>;
    static ipAddress(): Q.Promise<string>;
    static start(opts?: IStartOpts): Q.Promise<{}>;
    private static runStartMachine(opts?);
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
