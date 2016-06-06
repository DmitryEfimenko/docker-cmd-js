import Q = require('q');
export declare class Docker {
    machineName: string;
    private _debug;
    private _env;
    constructor(machineName?: string);
    debug(): this;
    runWithoutDebug(command: string, noNewLines?: boolean): Q.Promise<string>;
    run(command: string, noNewLines?: boolean): Q.Promise<string>;
    private checkForDanglingImages(cb);
    private machineStatus(cb);
    startMachine(memory: number): Q.Promise<{}>;
    private runStartMachine(memory);
    buildImage(imageName: string, opts?: {
        dockerFile?: string;
        buildAndReplace?: boolean;
    }): Q.Promise<{}>;
    private runBuildImage(imageName, dockerFile?);
    removeImage(imageName: any): Q.Promise<string>;
    startContainer(imageName: any, opts?: IStartDockerOpts, command?: string): Q.Promise<{}>;
    resToJSON(s: string): any[];
    private info(...message);
    private err(...message);
}
export interface IStartDockerOpts {
    name: string;
    port: string;
    volume: string;
    volumesFrom: string;
    link: string;
    env: string[];
}
