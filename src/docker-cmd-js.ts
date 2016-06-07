import * as Q from 'q';
import { run, runSync, resToJSON } from './base';
import { RunResult } from './childProcessHelpers';
import { setEnvironment } from './environment';
import { Machine } from './machine';
import { Image } from './image';
import { Container } from './container';

export class Cmd {
    private _debug: boolean;
    machine: Machine;
    image: Image;
    container: Container;

    constructor(public machineName?: string) {
        if (!this.machineName) this.machineName = 'default';
        setEnvironment(this.machineName);
        this.machine = new Machine(this.machineName, this._debug);
        this.image = new Image(this._debug);
        this.container = new Container(this._debug);
    }

    debug() {
        this._debug = true;
        return this;
    }

    run(command: string, noNewLines?: boolean) {
        return run(command, this._debug, noNewLines);
    }

    runSync(command: string) {
        return runSync(command, this._debug);
    }

    resToJSON(s: string): any[] {
        return resToJSON(s);
    }
}