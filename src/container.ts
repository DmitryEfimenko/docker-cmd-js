import { run, runWithoutDebug, addOpts, addOpt, Log, IProgress, resToJSON } from './base';
import { Machine } from './machine';
import { CommonMethods } from './commonMethods';
var tcpPortUsed = require('tcp-port-used');

export class Container extends CommonMethods {
  constructor(machineName: string) {
    super(machineName);
  }

  async waitForPort(opts: IWaitForPortOpts) {
    try {
      if (!opts.retryIntervalMs) { opts.retryIntervalMs = 100; }
      if (!opts.timeoutMs) { opts.timeoutMs = 5000; }
      let progress = Log.infoProgress(this.isDebug, 'waiting for port', opts.port.toString());
      if (!opts.host) {
        let machine = new Machine(this.machineName);
        opts.host = await machine.ipAddress();
      }
      await tcpPortUsed.waitUntilUsedOnHost(opts.port, opts.host, opts.retryIntervalMs, opts.timeoutMs);
      Log.terminateProgress(progress);
    } catch (ex) {
      throw ex;
    }
  }

  async start(imageName: string, opts?: IStartDockerOpts, command?: string, extraOpts?: IStartExtraOpts) {
    let self = this;
    let containerName = (opts && opts.name) ? opts.name : imageName;
    let progress = Log.infoProgress(this.isDebug, `Checking if container "${containerName}" needs to be started`);

    try {
      let status = await this.runWithoutDebugOnce(this.status(containerName));
      if (status === undefined) {
        progress = Log.terminateProgress(progress).infoProgress(this.isDebug, `Creating and starting container "${containerName}"`);
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
          Log.terminateProgress(progress).info(`Container "${containerName}"" exists but is not started. Starting now.`);
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

    async function removeAndStart(containerName: string, progress: IProgress) {
      try {
        await self.remove(containerName);
        return await startContainer(containerName, progress);
      } catch (ex) {
        throw ex;
      }
    }

    async function startContainer(containerName: string, progress: IProgress) {
      try {
        let c = `docker run -d`;
        if (!opts) { opts = {}; }
        c = addOpts(c, opts);
        // set sinsible defaults
        if (!opts.name) { c = addOpt(c, '--name', containerName); }
        c += ` ${imageName}`;
        if (command) { c += ` ${command}`; }
        await run(c, self.machineName, self.isDebug);
        Log.terminateProgress(progress).info(`Container "${containerName}" started.`);
        return false;
      } catch (ex) {
        Log.terminateProgress(progress);
        throw ex;
      }
    }
  }

  async remove(containerName: string) {
    try {
      let c = `docker rm -f ${containerName}`;
      await run(c, this.machineName, this.isDebug);
    } catch (ex) {
      throw ex;
    }
  }

  async status(containerName: string) {
    try {
      let c = `docker ps -a --filter name=${containerName} --format "table {{.Names}}\t{{.Status}}"`;
      let res = await run(c, this.machineName, this.isDebug);
      let json = resToJSON(res);
      let status;
      for (var i = 0, l = json.length; i < l; i++) {
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
