"use strict";
const Q = require('q');
const base_1 = require('./base');
const machine_1 = require('./machine');
const commonMethods_1 = require('./commonMethods');
var tcpPortUsed = require('tcp-port-used');
class Container extends commonMethods_1.CommonMethods {
    constructor(machineName) {
        super(machineName);
    }
    waitForPort(opts) {
        return Q.Promise((resolve, reject) => {
            if (!opts.retryIntervalMs) {
                opts.retryIntervalMs = 100;
            }
            if (!opts.timeoutMs) {
                opts.timeoutMs = 5000;
            }
            let progress = base_1.Log.infoProgress(this.isDebug, 'waiting for port', opts.port.toString());
            if (!opts.host) {
                let machine = new machine_1.Machine(this.machineName);
                machine.ipAddress().then((ipAddress) => {
                    opts.host = ipAddress;
                    this.runWaitForPort(opts, progress).then(resolve, reject);
                }, (err) => { reject(err); });
            }
            else {
                this.runWaitForPort(opts, progress).then(resolve, reject);
            }
        });
    }
    runWaitForPort(opts, progress) {
        return tcpPortUsed.waitUntilUsedOnHost(opts.port, opts.host, opts.retryIntervalMs, opts.timeoutMs).finally(() => {
            base_1.Log.terminateProgress(progress);
        });
    }
    start(imageName, opts, command) {
        return Q.Promise((resolve, reject) => {
            let containerName = (opts && opts.name) ? opts.name : imageName;
            let progress = base_1.Log.infoProgress(this.isDebug, `Checking if container "${containerName}" needs to be started`);
            this.runWithoutDebugOnce(this.status(containerName)).then((status) => {
                if (status === undefined) {
                    progress = base_1.Log.terminateProgress(progress)
                        .infoProgress(this.isDebug, `Creating and starting container "${containerName}"`);
                    let c = `docker run -d`;
                    if (!opts) {
                        opts = {};
                    }
                    c = base_1.addOpts(c, opts);
                    if (!opts.name) {
                        c = base_1.addOpt(c, '--name', containerName);
                    }
                    c += ` ${imageName}`;
                    if (command) {
                        c += ` ${command}`;
                    }
                    base_1.run(c, this.machineName, this.isDebug).then(() => {
                        base_1.Log.terminateProgress(progress).info(`Container "${containerName}" started.`);
                        resolve(false);
                    }, (err) => {
                        base_1.Log.terminateProgress(progress);
                        reject(err);
                    });
                }
                else if (status.indexOf('Up') === 0) {
                    base_1.Log.terminateProgress(progress).info(`Container "${containerName}"" already started.`);
                    resolve(true);
                }
                else if (status.indexOf('Exited') === 0) {
                    base_1.Log.terminateProgress(progress).info(`Container "${containerName}"" exists but is not started. Starting now.`);
                    base_1.runWithoutDebug(`docker start ${containerName}`, this.machineName).then(() => { resolve(false); }, reject);
                }
                else {
                    base_1.Log.terminateProgress(progress);
                    reject(`Could not start container ${containerName}. Status was ${status} Should never hit this.`);
                }
            }, (err) => {
                base_1.Log.terminateProgress(progress);
                reject(err);
            });
        });
    }
    status(containerName) {
        return Q.Promise((resolve, reject) => {
            let c = `docker ps -a --filter name=${containerName} --format "table {{.Names}}\t{{.Status}}"`;
            base_1.run(c, this.machineName, this.isDebug).then((res) => {
                let json = base_1.resToJSON(res);
                let status;
                for (var i = 0, l = json.length; i < l; i++) {
                    if (json[i]['NAMES'] === containerName) {
                        status = json[i]['STATUS'];
                        break;
                    }
                }
                resolve(status);
            }, (err) => { reject(err); });
        });
    }
}
exports.Container = Container;
