import * as Q from 'q';
import { RunResult } from './childProcessHelpers';
import { Machine } from './machine';
import { Image } from './image';
import { Container } from './container';
export declare class Cmd {
    machineName: string;
    private _debug;
    machine: Machine;
    image: Image;
    container: Container;
    constructor(machineName?: string);
    debug(): this;
    run(command: string, noNewLines?: boolean): Q.Promise<string>;
    runSync(command: string): RunResult;
    resToJSON(s: string): any[];
}
