export declare class Docker {
    machineName: string;
    private _debug;
    constructor(machineName?: string);
    debug(): this;
    run(command: string): RunResult;
    private spawn(command, env?);
    private static envObj;
    private getEnvironmentObject();
    private isEnvironmentVariableLine(line);
    private addEnvironmentKeyValueToObject(line, obj);
    private log(text);
}
export interface RunResult {
    stdOut: string;
    stdErr: string;
}
