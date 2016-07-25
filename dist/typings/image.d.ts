import * as Q from 'q';
import { CommonMethods } from './commonMethods';
export declare class Image extends CommonMethods {
    constructor(machineName: any);
    build(imageName: string, opts?: IBuildImageOpts): Q.Promise<{}>;
    remove(imageName: string): Q.Promise<string>;
    checkForDangling(): Q.Promise<{}>;
    private runBuildImage(imageName, opts?);
}
export interface IBuildImageOpts {
    pathOrUrl?: string;
    regularBuild?: boolean;
    freshBuild?: boolean;
    buildOnlyIfMissing?: boolean;
}
