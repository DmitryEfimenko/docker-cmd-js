import * as Q from 'q';
import { Debuggable } from './debuggable';
export declare class Container extends Debuggable {
    constructor(_debug: any);
    start(imageName: any, opts?: IStartDockerOpts, command?: string): Q.Promise<{}>;
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
