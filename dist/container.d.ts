import * as Q from 'q';
import { CommonMethods } from './commonMethods';
export declare class Container extends CommonMethods {
    static waitForPort(opts: IWaitForPortOpts): Q.Promise<{}>;
    private static runWaitForPort(opts);
    static start(imageName: any, opts?: IStartDockerOpts, command?: string): Q.Promise<{}>;
    static status(containerName: string): Q.Promise<string>;
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
