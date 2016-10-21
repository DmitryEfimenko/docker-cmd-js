/// <reference types="q" />
import * as Q from 'q';
import { CommonMethods } from './commonMethods';
export declare class Container extends CommonMethods {
    constructor(machineName: string);
    waitForPort(opts: IWaitForPortOpts): Q.Promise<{}>;
    private runWaitForPort(opts, progress);
    start(imageName: string, opts?: IStartDockerOpts, command?: string): Q.Promise<{}>;
    status(containerName: string): Q.Promise<string>;
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
