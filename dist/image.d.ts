import * as Q from 'q';
import { Debuggable } from './debuggable';
export declare class Image extends Debuggable {
    constructor(_debug: any);
    build(imageName: string, opts?: IBuildImageOpts): Q.Promise<{}>;
    remove(imageName: string): Q.Promise<string>;
    checkForDangling(): Q.Promise<{}>;
    private runBuildImage(imageName, opts?);
}
export interface IBuildImageOpts {
    pathOrUrl?: string;
    buildAndReplace?: boolean;
}
