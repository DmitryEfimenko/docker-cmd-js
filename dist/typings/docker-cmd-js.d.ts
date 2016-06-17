import * as Q from 'q';
import { RunResult } from './childProcessHelpers';
import { MachineStatic } from './machine';
import { ImageStatic } from './image';
import { ContainerStatic } from './container';
import { VolumeStatic } from './volume';
export declare class Cmd {
    machine: MachineStatic;
    image: ImageStatic;
    container: ContainerStatic;
    volume: VolumeStatic;
    constructor(machineName?: string);
    debug(debugging?: boolean): this;
    run(command: string, noNewLines?: boolean): Q.Promise<string>;
    runSync(command: string): RunResult;
    resToJSON(s: string): any[];
}
