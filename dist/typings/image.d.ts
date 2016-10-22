import { CommonMethods } from './commonMethods';
export declare class Image extends CommonMethods {
    constructor(machineName: any);
    build(imageName: string, opts?: IBuildImageOpts): Promise<boolean>;
    remove(imageName: string): Promise<string>;
    checkForDangling(): Promise<{}>;
    private runBuildImage(imageName, opts?);
}
export interface IBuildImageOpts {
    pathOrUrl?: string;
    regularBuild?: boolean;
    freshBuild?: boolean;
    buildOnlyIfMissing?: boolean;
}
