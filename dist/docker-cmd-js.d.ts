import * as Q from 'q';
export default class Cmd {
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
    buildImage(imageName: string, opts?: IBuildImageOpts): Q.Promise<{}>;
    private runBuildImage(imageName, opts?);
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
export interface IBuildImageOpts {
    dockerFile?: string;
    buildAndReplace?: boolean;
}
