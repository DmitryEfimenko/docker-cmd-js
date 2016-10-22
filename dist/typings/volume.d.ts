import { CommonMethods } from './commonMethods';
export declare class Volume extends CommonMethods {
    constructor(machineName: string);
    create(opts?: ICreateVolumeOpts, advOpts?: ICreateVolumeAdvOpts): Promise<string>;
    private runCreate(opts);
    inspect(volumeName: any): Promise<IInspectVolumeItemResult[]>;
    remove(volumeName: string): Promise<string>;
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
