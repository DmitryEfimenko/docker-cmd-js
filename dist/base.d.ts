import * as Q from 'q';
export declare function run(command: string, _debug: boolean, noNewLines?: boolean): Q.Promise<string>;
export declare function runWithoutDebug(command: string, noNewLines?: boolean): Q.Promise<string>;
export declare function addOpt(command: string, optionName: string, optionVal?: string | string[] | boolean): void;
export declare function addOpts(command: string, opts: any): void;
export declare function resToJSON(s: string): any[];
export declare function success(...message: string[]): void;
export declare function info(...message: string[]): void;
export declare function err(...message: string[]): void;
