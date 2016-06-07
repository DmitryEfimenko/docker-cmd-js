import * as Q from 'q';
export declare class Image {
    private _debug;
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
