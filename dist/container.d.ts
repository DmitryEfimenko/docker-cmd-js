import * as Q from 'q';
export declare class Container {
    private _debug;
    constructor(_debug: any);
    start(imageName: any, opts?: IStartDockerOpts, command?: string): Q.Promise<{}>;
    status(containerName: string): Q.Promise<string>;
}
export interface IStartDockerOpts {
    name?: string;
    publish?: string[];
    volume?: string;
    volumesFrom?: string[];
    link?: string[];
    env?: string[];
}
