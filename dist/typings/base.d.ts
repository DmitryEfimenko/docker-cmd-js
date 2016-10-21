/// <reference types="q" />
/// <reference types="node" />
import * as Q from 'q';
import { RunResult } from './childProcessHelpers';
export declare function run(command: string, machineName: string, _debug: boolean, noNewLines?: boolean): Q.Promise<string>;
export declare function runSync(command: string, machineName: string, _debug: boolean): RunResult;
export declare function runWithoutDebug(command: string, machineName: string, noNewLines?: boolean): Q.Promise<string>;
export declare function addOpt(command: string, optionName: string, optionVal?: string | string[] | boolean): string;
export declare function addOpts(command: string, opts: any): string;
export declare function resToJSON(s: string): any[];
export declare class Log {
    static success(...message: string[]): void;
    static err(...message: string[]): void;
    static info(...message: string[]): void;
    static warn(...message: string[]): void;
    static debug(...message: string[]): void;
    static infoProgress(debug: boolean, ...message: string[]): IProgress;
    static terminateProgress(progress: IProgress): typeof Log;
    private static newLine();
}
export interface IProgress {
    interval: NodeJS.Timer;
    message: string;
}
