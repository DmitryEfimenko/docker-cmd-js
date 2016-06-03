import Q = require('q');
export declare class Docker {
    machineName: string;
    private _debug;
    constructor(machineName?: string);
    debug(): this;
    run(command: string): Q.Promise<string>;
    private spawn(command, env, cb);
    private spawnSync(command, env?);
    private static envObj;
    private getEnvironmentObject();
    private isEnvironmentVariableLine(line);
    private addEnvironmentKeyValueToObject(line, obj);
    private checkForDanglingImages(cb);
    private checkDockerMachineStatus(cb);
    resToJSON(s: string): any[];
}
export interface RunResult {
    stdOut: string;
    stdErr: string;
}
