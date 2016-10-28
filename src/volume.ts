import { run, runWithoutDebug, addOpts, addOpt, Log } from './base';
import { CommonMethods } from './commonMethods';
import { setEnvironment } from './environment';

export class Volume extends CommonMethods {
  constructor(machineName: string) {
    super(machineName);
  }

  create(opts?: ICreateVolumeOpts, advOpts?: ICreateVolumeAdvOpts) {
    return new Promise<string>((resolve, reject) => {
      if (advOpts && advOpts.createOnlyIfMissing) {
        if (!opts || !opts.name) {
          throw new Error('You must specify name when using "createOnlyIfMissing" option.');
        }

        this.runWithoutDebugOnce(this.inspect(opts.name)).then(
          (res) => {
            if (res.length > 0) {
              resolve(res[0].Name);
            } else {
              this.runCreate(opts).then(resolve, reject);
            }
          },
          (err) => { reject(err); }
        );
      } else {
        this.runCreate(opts).then(resolve, reject);
      }
    });
  }

  private runCreate(opts: ICreateVolumeOpts) {
    let c = 'docker volume create';
    if (!opts) { opts = {}; }
    c = addOpts(c, opts);
    return run(c, this.machineName, this.isDebug);
  }

  inspect(volumeName) {
    return new Promise<IInspectVolumeItemResult[]>((resolve, reject) => {
      run(`docker volume inspect ${volumeName}`, this.machineName, this.isDebug).then(
        (res) => {
          let json: IInspectVolumeItemResult[] = JSON.parse(res);
          resolve(json);
        },
        (err) => {
          if (err === `Error: No such volume: ${volumeName}\n`) {
            resolve([]);
          } else {
            reject(err);
          }
        }
      );
    });
  }

  remove(volumeName: string) {
    return run(`docker volume rm ${volumeName}`, this.machineName, this.isDebug);
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
