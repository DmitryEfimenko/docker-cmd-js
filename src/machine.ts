import { run, addOpts, addOpt, Log } from './base';
import { CommonMethods } from './commonMethods';
import { setEnvironment } from './environment';

export class Machine extends CommonMethods {
  _ipAddress: string;

  start: {
    hyperv: (opts?: ICreateOpts & ICreateOptsHyperv) => Promise<string>
    virtualbox: (opts?: ICreateOpts & ICreateOptsVirtualbox) => Promise<string>
  } = {
    hyperv: this.startHyperv.bind(this),
    virtualbox: this.startVirtualbox.bind(this)
  };

  constructor(machineName: string) {
    super(machineName);
  }

  async status() {
    try {
      return await run(`docker-machine status ${this.machineName}`, this.machineName, this.isDebug, true);
    } catch (ex) {
      const validErr = `Host does not exist: "${this.machineName}"`;
      if (ex === `${validErr}\n`) {
        return validErr;
      } else {
        throw ex;
      }
    }
  }

  async ipAddress() {
    try {
      const ip = await run(`docker-machine ip ${this.machineName}`, this.machineName, this.isDebug, true);
      this._ipAddress = ip;
      return ip;
    } catch (ex) {
      throw ex;
    }
  }

  startHyperv(opts?: ICreateOpts & ICreateOptsHyperv) {
    if (!opts) { opts = {}; }
    opts.driver = 'hyperv';
    return this._start(opts);
  }

  startVirtualbox(opts?: ICreateOpts & ICreateOptsVirtualbox) {
    if (!opts) { opts = {}; }
    opts.driver = 'virtualbox';
    return this._start(opts);
  }

  remove() {
    return run(`docker-machine rm -f ${this.machineName}`, this.machineName, this.isDebug);
  }

  private async _start<T extends (ICreateOptsVirtualbox | ICreateOptsHyperv)>(opts?: ICreateOpts) {
    try {
      const res = await this.runWithoutDebugOnce(this.status());
      if (res === 'Stopped') {
        const c = `docker-machine start ${this.machineName}`;
        const resp = await run(c, this.machineName, this.isDebug);
      } else if (res !== 'Running') {
        return await this.create(opts);
      } else {
        Log.info(`docker-machine [${this.machineName}] status:`, res);
        return res;
      }
    } catch (ex) {
      if (ex.indexOf('machine does not exist') > -1) {
        await this.remove();
      }
      try {
        return await this.create(opts);
      } catch (ex) {
        throw ex;
      }
    }
  }

  private async create(opts: ICreateOpts & (ICreateOptsVirtualbox | ICreateOptsHyperv)) {
    let c = `docker-machine create`;

    c = addOpts(c, opts);

    if (isVirtualBox(opts)) {
      // set sinsible defaults
      if (!opts.virtualboxMemory) { c = addOpt(c, '--virtualbox-memory', '6144'); }
      if (!opts.virtualboxNoVtxCheck) { c = addOpt(c, '--virtualbox-no-vtx-check'); }
    }

    c += ` ${this.machineName}`;

    const progress = Log.infoProgress(this.isDebug, `Starting VM "${this.machineName}"`);

    try {
      const resp = await run(c, this.machineName, this.isDebug);
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
}

function isHyperV(opts: (ICreateOptsVirtualbox | ICreateOptsHyperv)): opts is ICreateOptsHyperv {
  return (opts as any).driver === 'hyperv';
}

function isVirtualBox(opts: ICreateOptsVirtualbox | ICreateOptsHyperv): opts is ICreateOptsVirtualbox {
  return (opts as any).driver === 'virtualbox';
}

export interface ICreateOpts {
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
}

export interface ICreateOptsVirtualbox {
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

export interface ICreateOptsHyperv {
  hypervBoot2dockerUrl?: string;
  hypervVirtualSwitch?: string;
  hypervDiskSize?: string;
  hypervMemory?: string;
  hypervCpuCount?: string;
  hypervStaticMacaddress?: string;
  hypervVlanId?: string;
}
