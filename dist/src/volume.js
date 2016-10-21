"use strict";
const Q = require('q');
const base_1 = require('./base');
const commonMethods_1 = require('./commonMethods');
class Volume extends commonMethods_1.CommonMethods {
    constructor(machineName) {
        super(machineName);
    }
    create(opts, advOpts) {
        return Q.Promise((resolve, reject) => {
            if (advOpts && advOpts.createOnlyIfMissing) {
                if (!opts || !opts.name) {
                    throw new Error('You must specify name when using "createOnlyIfMissing" option.');
                }
                this.runWithoutDebugOnce(this.inspect(opts.name)).then((res) => {
                    if (res.length > 0) {
                        resolve(res[0].Name);
                    }
                    else {
                        this.runCreate(opts).then(resolve, reject);
                    }
                }, (err) => { reject(err); });
            }
            else {
                this.runCreate(opts).then(resolve, reject);
            }
        });
    }
    runCreate(opts) {
        let c = 'docker volume create';
        if (!opts) {
            opts = {};
        }
        c = base_1.addOpts(c, opts);
        return base_1.run(c, this.machineName, this.isDebug);
    }
    inspect(volumeName) {
        return Q.Promise((resolve, reject) => {
            base_1.run(`docker volume inspect ${volumeName}`, this.machineName, this.isDebug).then((res) => {
                let json = JSON.parse(res);
                resolve(json);
            }, (err) => {
                if (err === `Error: No such volume: ${volumeName}\n`) {
                    resolve([]);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    remove(volumeName) {
        return base_1.run(`docker volume rm ${volumeName}`, this.machineName, this.isDebug);
    }
}
exports.Volume = Volume;
