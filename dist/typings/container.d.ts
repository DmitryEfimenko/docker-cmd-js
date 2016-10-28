import { CommonMethods } from './commonMethods';
export declare class Container extends CommonMethods {
    constructor(machineName: string);
    waitForPort(opts: IWaitForPortOpts): Promise<{}>;
    private runWaitForPort(opts, progress);
    start(imageName: string, opts?: IStartDockerOpts, command?: string): Promise<boolean>;
    status(containerName: string): Promise<string>;
}
export interface IStartDockerOpts {
    name?: string;
    publish?: string | string[];
    volume?: string;
    volumesFrom?: string | string[];
    link?: string | string[];
    env?: string | string[];
}
export interface IWaitForPortOpts {
    port: number;
    host?: string;
    retryIntervalMs?: number;
    timeoutMs?: number;
}
