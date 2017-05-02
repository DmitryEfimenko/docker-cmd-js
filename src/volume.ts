import { run, runWithoutDebug, addOpts, addOpt, Log } from './base';
import { CommonMethods } from './commonMethods';
import { setEnvironment } from './environment';

export class Volume extends CommonMethods {
  constructor(machineName: string) {
    super(machineName);
  }

  async create(opts?: ICreateVolumeOpts, advOpts?: ICreateVolumeAdvOpts) {
    try {
      if (advOpts && advOpts.createOnlyIfMissing) {
        if (!opts || !opts.name) {
          throw new Error('You must specify name when using "createOnlyIfMissing" option.');
        }
        const res = await this.runWithoutDebugOnce(this.inspect(opts.name));
        if (res.length > 0) {
          return res[0].Name;
        } else {
          return await this.runCreate(opts);
        }
      } else {
        return await this.runCreate(opts);
      }
    } catch (ex) {
      throw ex;
    }
  }

  async inspect(volumeName) {
    try {
      const res = await run(`docker volume inspect ${volumeName}`, this.machineName, this.isDebug);
      const json: IInspectVolumeItemResult[] = JSON.parse(res);
      return json;
    } catch (ex) {
      if (ex === `Error: No such volume: ${volumeName}\n`) {
        return [];
      } else {
        throw ex;
      }
    }
  }

  remove(volumeName: string) {
    return run(`docker volume rm ${volumeName}`, this.machineName, this.isDebug);
  }

  private runCreate(opts: ICreateVolumeOpts) {
    let c = 'docker volume create';
    if (!opts) { opts = {}; }
    c = addOpts(c, opts);
    return run(c, this.machineName, this.isDebug);
  }
}

export interface IInspectVolumeItemResult {
  Name: string;
  Driver: string;
  Mountpoint: string;
}

export interface ICreateVolumeOpts {
  d?: string;
  driver?: string;
  label?: string[];
  name?: string;
  o?: string[];
  opt?: string[];
}

export interface ICreateVolumeAdvOpts {
  createOnlyIfMissing?: boolean;
}
