import { CommonMethods } from './commonMethods';
export declare class Image extends CommonMethods {
    constructor(machineName: any);
    build(imageName: string, opts?: IBuildImageOpts, pathOrUrl?: string, buildType?: ImageBuildType): Promise<boolean>;
    remove(imageName: string): Promise<string>;
    checkForDangling(): Promise<{}>;
    private runBuildImage(imageName, opts, pathOrUrl);
}
export interface IBuildImageOpts {
    buildArg?: string;
    cgroupParent?: string;
    cpuPeriod?: number;
    cpuQuota?: number;
    cpuShares?: number;
    cpusetCpus?: string;
    cpusetMems?: string;
    disableContentTrust?: boolean;
    file?: string;
    forceRm?: boolean;
    help?: boolean;
    isolation?: string;
    label?: string;
    memory?: string;
    memorySwap?: string;
    noCache?: string;
    pull?: boolean;
    quiet?: boolean;
    rm?: boolean;
    shmSize?: string;
    tag?: string;
    ulimit?: string;
}
export declare enum ImageBuildType {
    regularBuild = 0,
    freshBuild = 1,
    buildOnlyIfMissing = 2,
}
