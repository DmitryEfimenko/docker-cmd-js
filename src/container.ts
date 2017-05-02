import { run, runWithoutDebug, addOpts, addOpt, Log, IProgress, resToJSON } from './base';
import { Machine } from './machine';
import { CommonMethods } from './commonMethods';
import * as tcpPortUsed from 'tcp-port-used';

export class Container extends CommonMethods {
  constructor(machineName: string) {
    super(machineName);
  }

  async waitForPort(opts: IWaitForPortOpts) {
    try {
      if (!opts.retryIntervalMs) { opts.retryIntervalMs = 100; }
      if (!opts.timeoutMs) { opts.timeoutMs = 5000; }
      if (!opts.host) {
        const machine = new Machine(this.machineName);
        opts.host = await machine.ipAddress();
      }

      const progress = Log.infoProgress(
        this.isDebug, `waiting for port ${opts.host}:${opts.port} for ${opts.timeoutMs / 1000} s`);

      await tcpPortUsed.waitUntilUsedOnHost(opts.port, opts.host, opts.retryIntervalMs, opts.timeoutMs);
      Log.terminateProgress(progress);
    } catch (ex) {
      throw ex;
    }
  }

  async start(imageName: string, opts?: IStartDockerOpts, command?: string, extraOpts?: IStartExtraOpts) {
    const self = this;
    const containerName = (opts && opts.name) ? opts.name : imageName;
    let progress = Log.infoProgress(this.isDebug, `Checking if container "${containerName}" needs to be started`);

    try {
      const status = await this.runWithoutDebugOnce(this.status(containerName));
      if (status === undefined) {
        progress = Log.terminateProgress(progress)
          .infoProgress(this.isDebug, `Creating and starting container "${containerName}"`);

        return await startContainer(containerName, progress);
      } else if (status === 'Created') {
        if (extraOpts && extraOpts.startFresh) {
          progress = Log.terminateProgress(progress).infoProgress(this.isDebug, `Container needs to be re-created`);
          return await removeAndStart(containerName, progress);
        } else {
          progress = Log.terminateProgress(progress)
            .infoProgress(this.isDebug, `Container "${containerName}" exists, but not started - starting now.`);
          return await startContainer(containerName, progress);
        }
      } else if (status.indexOf('Up') === 0) {
        if (extraOpts && extraOpts.startFresh) {
          progress = Log.terminateProgress(progress).infoProgress(this.isDebug, `Container needs to be re-created`);
          return await removeAndStart(containerName, progress);
        } else {
          Log.terminateProgress(progress).info(`Container "${containerName}"" already started.`);
          return true;
        }
      } else if (status.indexOf('Exited') === 0) {
        if (extraOpts && extraOpts.startFresh) {
          Log.terminateProgress(progress).info(`Container needs to be re-created`);
          return await removeAndStart(containerName, progress);
        } else {
          Log.terminateProgress(progress)
            .info(`Container "${containerName}"" exists but is not started. Starting now.`);
          await runWithoutDebug(`docker start ${containerName}`, this.machineName);
          return false;
        }
      } else {
        Log.terminateProgress(progress);
        throw new Error(`Could not start container ${containerName}. Status was "${status}". Should never hit this.`);
      }
    } catch (ex) {
      Log.terminateProgress(progress);
      throw ex;
    }

    async function removeAndStart(contName: string, pr: IProgress) {
      try {
        await self.remove(contName);
        return await startContainer(contName, pr);
      } catch (ex) {
        throw ex;
      }
    }

    async function startContainer(contName: string, pr: IProgress) {
      try {
        let c = `docker run -d`;
        if (!opts) { opts = {}; }
        c = addOpts(c, opts);
        // set sinsible defaults
        if (!opts.name) { c = addOpt(c, '--name', contName); }
        c += ` ${imageName}`;
        if (command) { c += ` ${command}`; }
        await run(c, self.machineName, self.isDebug);
        Log.terminateProgress(pr).info(`Container "${contName}" started.`);
        return false;
      } catch (ex) {
        Log.terminateProgress(pr);
        throw ex;
      }
    }
  }

  async remove(containerName: string) {
    try {
      const c = `docker rm -f ${containerName}`;
      await run(c, this.machineName, this.isDebug);
    } catch (ex) {
      throw ex;
    }
  }

  async status(containerName: string) {
    try {
      const c = `docker ps -a --filter name=${containerName} --format "table {{.Names}}\t{{.Status}}"`;
      const res = await run(c, this.machineName, this.isDebug);
      const json = resToJSON(res);
      let status;
      for (let i = 0, l = json.length; i < l; i++) {
        if (json[i]['NAMES'] === containerName) {
          status = json[i]['STATUS'];
          break;
        }
      }
      return status;
    } catch (ex) {
      throw ex;
    }
  }
}

export interface IStartDockerOpts {
  name?: string;
  publish?: string | string[];
  volume?: string;
  volumesFrom?: string | string[];
  link?: string | string[];
  env?: string | string[];
  tty?: boolean;
}

export interface IStartExtraOpts {
  startFresh?: boolean;
}

export interface IWaitForPortOpts {
  port: number;
  host?: string;
  retryIntervalMs?: number;
  timeoutMs?: number;
}
