import { run, addOpts, addOpt, Log } from './base';
import { CommonMethods } from './commonMethods';
import { setEnvironment } from './environment';

export class Machine extends CommonMethods {
  _ipAddress: string;

  constructor(machineName: string) {
    super(machineName);
  }

  async status() {
    try {
      return await run(`docker-machine status ${this.machineName}`, this.machineName, this.isDebug, true);
    } catch (ex) {
      let validErr = `Host does not exist: "${this.machineName}"`;
      if (ex === `${validErr}\n`) {
        return validErr;
      } else {
        throw ex;
      }
    }
  }

  async ipAddress() {
    try {
      let ip = await run(`docker-machine ip ${this.machineName}`, this.machineName, this.isDebug, true);
      this._ipAddress = ip;
      return ip;
    } catch (ex) {
      throw ex;
    }
  }

  async start(opts?: IStartOpts) {
    try {
      let res = await this.runWithoutDebugOnce(this.status());
      if (res === 'Stopped') {
        let c = `docker-machine start ${this.machineName}`;
        let resp = await run(c, this.machineName, this.isDebug);
      } else if (res !== 'Running') {
        return await this.runStartMachine(opts);
      } else {
        Log.info(`docker-machine [${this.machineName}] status:`, res);
        return res;
      }
    } catch (ex) {
      if (ex.indexOf('machine does not exist') > -1) {
        await this.remove();
      }
      try {
        return await this.runStartMachine(opts);
      } catch (ex) {
        throw ex;
      }
    }
  }

  private async runStartMachine(opts?: IStartOpts) {
    let c = `docker-machine create`;
    if (!opts) { opts = {}; }
    c = addOpts(c, opts);
    // set sinsible defaults
    if (!opts.driver) {
      c = addOpt(c, '--driver', 'virtualbox'/*'hyperv'*/);
    //} else if (opts.driver === 'virtualbox') {
      if (!opts.virtualboxMemory) { c = addOpt(c, '--virtualbox-memory', '6144'); }
      if (!opts.virtualboxNoVtxCheck) { c = addOpt(c, '--virtualbox-no-vtx-check'); }
    }
    c += ` ${this.machineName}`;

    let progress = Log.infoProgress(this.isDebug, `Starting VM "${this.machineName}"`);

    try {
      let resp = await run(c, this.machineName, this.isDebug);
      setEnvironment(this.machineName);
      Log.terminateProgress(progress);
      return resp;
    } catch (ex) {
      Log.terminateProgress(progress);
      if (ex.indexOf('Host already exists') === 0) {
        setEnvironment(this.machineName);
        return;
      } else {
        throw ex;
      }
    }
  }

  remove() {
    return run(`docker-machine rm -f ${this.machineName}`, this.machineName, this.isDebug);
  }
}

export interface IStartOpts {
  driver?: string;
  engineInstallUrl?: string;
  engineOpt?: string | string[];
  engineInsecureRegistry?: string | string[];
  engineRegistryMirror?: string | string[];
  engineLabel?: string | string[];
  engineStorageDriver?: boolean;
  engineEnv?: string | string[];
  swarm?: boolean;
  swarmImage?: string;
  swarmMaster?: boolean;
  swarmDiscovery?: boolean;
  swarmStrategy?: string;
  swarmOpt?: string | string[];
  swarmHost?: string;
  swarmAddr?: boolean;
  swarmExperimental?: boolean;

  virtualboxBoot2dockerUrl?: string;
  virtualboxCpuCount?: number;
  virtualboxDiskSize?: number;
  virtualboxHostDnsResolver?: boolean;
  virtualboxDnsProxy?: boolean;
  virtualboxHostonlyCidr?: string;
  virtualboxHostonlyNicpromisc?: string;
  virtualboxHostonlyNictype?: string;
  virtualboxImportBoot2dockerVm?: boolean;
  virtualboxMemory?: number;
  virtualboxNoShare?: boolean;
  virtualboxNoVtxCheck?: boolean;
}
