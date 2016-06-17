import * as Q from 'q';
import { Opts, run, runWithoutDebug, addOpts, addOpt, Log } from './base';
import { CommonMethods } from './commonMethods';
import { setEnvironment } from './environment';

export class VolumeStatic extends CommonMethods {
    create(opts?: ICreateVolumeOpts, advOpts?: ICreateVolumeAdvOpts) {
        return Q.Promise<string>((resolve, reject) => {
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
        return run(c, Opts.debug);
    }

    inspect(volumeName) {
        return Q.Promise<IInspectVolumeItemResult[]>((resolve, reject) => {
            run(`docker volume inspect ${volumeName}`, Opts.debug).then(
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
        return run(`docker volume rm ${volumeName}`, Opts.debug);
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

export var volume = new VolumeStatic();
