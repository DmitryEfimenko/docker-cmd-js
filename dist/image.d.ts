import * as Q from 'q';
import { CommonMethods } from './commonMethods';
export declare class Image extends CommonMethods {
    build(imageName: string, opts?: IBuildImageOpts): any;
    static build(imageName: string, opts?: IBuildImageOpts): Q.Promise<{}>;
    remove(imageName: string): any;
    static remove(imageName: string): Q.Promise<string>;
    checkForDangling(): any;
    static checkForDangling(): Q.Promise<{}>;
    private static runBuildImage(imageName, opts?);
}
export interface IBuildImageOpts {
    pathOrUrl?: string;
    buildAndReplace?: boolean;
}
