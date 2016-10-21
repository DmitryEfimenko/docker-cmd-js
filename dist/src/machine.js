"use strict";
const Q = require('q');
const base_1 = require('./base');
const commonMethods_1 = require('./commonMethods');
const environment_1 = require('./environment');
class Machine extends commonMethods_1.CommonMethods {
    constructor(machineName) {
        super(machineName);
    }
    status() {
        return Q.Promise((resolve, reject) => {
            return base_1.run(`docker-machine status ${this.machineName}`, this.machineName, this.isDebug, true).then((status) => { resolve(status); }, (err) => {
                let validErr = `Host does not exist: "${this.machineName}"`;
                if (err === `${validErr}\n`) {
                    resolve(validErr);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    ipAddress() {
        return Q.Promise((resolve, reject) => {
            base_1.run(`docker-machine ip ${this.machineName}`, this.machineName, this.isDebug, true).then((ip) => {
                this._ipAddress = ip;
                resolve(ip);
            }, (err) => { reject(err); });
        });
    }
    start(opts) {
        return Q.Promise((resolve, reject) => {
            this.runWithoutDebugOnce(this.status()).then((res) => {
                if (res !== 'Running') {
                    this.runStartMachine(opts).then(resolve, reject);
                }
                else {
                    base_1.Log.info(`docker-machine [${this.machineName}] status:`, res);
                    resolve(res);
                }
            }, (err) => {
                this.runStartMachine(opts).then(resolve, reject);
            });
        });
    }
    runStartMachine(opts) {
        return Q.Promise((resolve, reject) => {
            let c = `docker-machine create`;
            if (!opts) {
                opts = {};
            }
            c = base_1.addOpts(c, opts);
            if (!opts.driver) {
                c = base_1.addOpt(c, '--driver', 'virtualbox');
            }
            if (!opts.virtualboxMemory) {
                c = base_1.addOpt(c, '--virtualbox-memory', '6144');
            }
            if (!opts.virtualboxNoVtxCheck) {
                c = base_1.addOpt(c, '--virtualbox-no-vtx-check');
            }
            c += ` ${this.machineName}`;
            let progress = base_1.Log.infoProgress(this.isDebug, `Starting VM "${this.machineName}"`);
            base_1.run(c, this.machineName, this.isDebug).then((resp) => {
                environment_1.setEnvironment(this.machineName);
                base_1.Log.terminateProgress(progress);
                resolve(resp);
            }, (err) => {
                base_1.Log.terminateProgress(progress);
                reject(err);
            });
        });
    }
    remove() {
        return base_1.run(`docker-machine rm -f ${this.machineName}`, this.machineName, this.isDebug);
    }
}
exports.Machine = Machine;
