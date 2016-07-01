import * as Q from 'q';
import { CommonMethods } from './commonMethods';
export declare class ImageStatic extends CommonMethods {
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
export declare var image: ImageStatic;
