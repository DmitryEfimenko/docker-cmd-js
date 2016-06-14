import * as Q from 'q';
import { RunResult } from './childProcessHelpers';
export declare class Opts {
    static debug: boolean;
    static machineName: string;
}
export declare function run(command: string, _debug: boolean, noNewLines?: boolean): Q.Promise<string>;
export declare function runSync(command: string, _debug: boolean): RunResult;
export declare function runWithoutDebug(command: string, noNewLines?: boolean): Q.Promise<string>;
export declare function addOpt(command: string, optionName: string, optionVal?: string | string[] | boolean): string;
export declare function addOpts(command: string, opts: any): string;
export declare function resToJSON(s: string): any[];
export declare class Log {
    static success(...message: string[]): void;
    static err(...message: string[]): void;
    static info(...message: string[]): void;
    static debug(...message: string[]): void;
    static infoProgress(...message: string[]): IProgress;
    static terminateProgress(progress: IProgress): typeof Log;
    private static newLine();
}
export interface IProgress {
    interval: NodeJS.Timer;
    message: string;
}
