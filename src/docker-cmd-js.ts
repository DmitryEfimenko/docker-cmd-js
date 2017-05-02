import { run, runSync, resToJSON } from './base';
import { IRunResult } from './childProcessHelpers';
import { setEnvironment } from './environment';
import { Machine } from './machine';
import { Image } from './image';
import { Container } from './container';
import { Volume } from './volume';

export class Cmd {
  machine: Machine;
  image: Image;
  container: Container;
  volume: Volume;
  isDebug: boolean;
  machineName: string;

  constructor(machineName?: string) {
    this.machineName = machineName !== undefined ? machineName : 'default';
    this.container = new Container(this.machineName);
    this.machine = new Machine(this.machineName);
    this.image = new Image(this.machineName);
    this.volume = new Volume(this.machineName);
  }

  debug(debugging?: boolean) {
    this.isDebug = (debugging === undefined || debugging === true) ? true : false;
    this.container.debug(this.isDebug);
    return this;
  }

  run(command: string, noNewLines?: boolean) {
    return run(command, this.machineName, this.isDebug, noNewLines);
  }

  runSync(command: string) {
    return runSync(command, this.machineName, this.isDebug);
  }

  resToJSON(s: string): any[] {
    return resToJSON(s);
  }
}
