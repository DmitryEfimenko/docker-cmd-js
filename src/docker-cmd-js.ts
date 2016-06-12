import * as Q from 'q';
import { Opts, run, runSync, resToJSON } from './base';
import { RunResult } from './childProcessHelpers';
import { setEnvironment } from './environment';
import { Machine } from './machine';
import { Image } from './image';
import { Container } from './container';

export class Cmd {
    machine: Machine;
    image: Image;
    container: Container;

    constructor(public machineName?: string) {
        if (!this.machineName) this.machineName = 'default';
        setEnvironment(this.machineName);
        this.container = new Container();
        this.machine = new Machine();
        this.image = new Image();
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