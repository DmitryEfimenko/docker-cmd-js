import { RunResult } from './childProcessHelpers';
import { Machine } from './machine';
import { Image } from './image';
import { Container } from './container';
import { Volume } from './volume';
export declare class Cmd {
    machine: Machine;
    image: Image;
    container: Container;
    volume: Volume;
    isDebug: boolean;
    machineName: string;
    constructor(machineName?: string);
    debug(debugging?: boolean): this;
    run(command: string, noNewLines?: boolean): Promise<string>;
    runSync(command: string): RunResult;
    resToJSON(s: string): any[];
}
