export declare function spawn(command: string, env: any, debug: boolean, cb: (result: IRunResult) => void): void;
export declare function spawnSync(command: string, env: any, debug: boolean): IRunResult;
export interface IRunResult {
    stdOut: string;
    stdErr: string;
}
