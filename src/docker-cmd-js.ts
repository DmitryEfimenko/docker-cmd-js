import * as Q from 'q';
import { Opts, run, runSync, resToJSON } from './base';
import { RunResult } from './childProcessHelpers';
import { setEnvironment } from './environment';
import { machine, MachineStatic } from './machine';
import { image, ImageStatic } from './image';
import { container, ContainerStatic } from './container';
import { volume, VolumeStatic } from './volume';

export class Cmd {
    machine: MachineStatic;
    image: ImageStatic;
    container: ContainerStatic;
    volume: VolumeStatic;

    constructor(machineName?: string) {
        Opts.machineName = machineName !== undefined ? machineName : 'default';
        setEnvironment(Opts.machineName);
        this.container = container;
        this.machine = machine;
        this.image = image;
        this.volume = volume;
    }

    debug(debugging?: boolean) {
        Opts.debug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    }

    run(command: string, noNewLines?: boolean) {
        return run(command, Opts.debug, noNewLines);
    }

    runSync(command: string) {
        return runSync(command, Opts.debug);
    }

    resToJSON(s: string): any[] {
        return resToJSON(s);
    }
}
