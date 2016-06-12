import * as Q from 'q';
import { CommonMethods } from './commonMethods';
export declare class Image extends CommonMethods {
    static build(imageName: string, opts?: IBuildImageOpts): Q.Promise<{}>;
    static remove(imageName: string): Q.Promise<string>;
    static checkForDangling(): Q.Promise<{}>;
    private static runBuildImage(imageName, opts?);
}
export interface IBuildImageOpts {
    pathOrUrl?: string;
    buildAndReplace?: boolean;
}
