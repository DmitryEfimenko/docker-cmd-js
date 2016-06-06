export declare function spawn(command: string, env: any, cb: (result: RunResult) => void): void;
export declare function spawnSync(command: string, env: any): RunResult;
export interface RunResult {
    stdOut: string;
    stdErr: string;
}
