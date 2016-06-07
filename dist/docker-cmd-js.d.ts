import * as Q from 'q';
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
    resToJSON(s: string): any[];
}
