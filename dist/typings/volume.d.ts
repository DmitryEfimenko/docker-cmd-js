import * as Q from 'q';
import { CommonMethods } from './commonMethods';
export declare class VolumeStatic extends CommonMethods {
    create(opts?: ICreateVolumeOpts, advOpts?: ICreateVolumeAdvOpts): Q.Promise<string>;
    private runCreate(opts);
    inspect(volumeName: any): Q.Promise<IInspectVolumeItemResult[]>;
    remove(volumeName: string): Q.Promise<string>;
}
export interface IInspectVolumeItemResult {
    Name: string;
    Driver: string;
    Mountpoint: string;
}
export interface ICreateVolumeOpts {
    d?: string;
    driver?: string;
    label?: string[];
    name?: string;
    o?: string[];
    opt?: string[];
}
export interface ICreateVolumeAdvOpts {
    createOnlyIfMissing?: boolean;
}
export declare var volume: VolumeStatic;
