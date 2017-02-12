"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const base_1 = require('./base');
const machine_1 = require('./machine');
const commonMethods_1 = require('./commonMethods');
var tcpPortUsed = require('tcp-port-used');
class Container extends commonMethods_1.CommonMethods {
    constructor(machineName) {
        super(machineName);
    }
    waitForPort(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!opts.retryIntervalMs) {
                    opts.retryIntervalMs = 100;
                }
                if (!opts.timeoutMs) {
                    opts.timeoutMs = 5000;
                }
                let progress = base_1.Log.infoProgress(this.isDebug, 'waiting for port', opts.port.toString());
                if (!opts.host) {
                    let machine = new machine_1.Machine(this.machineName);
                    opts.host = yield machine.ipAddress();
                }
                yield tcpPortUsed.waitUntilUsedOnHost(opts.port, opts.host, opts.retryIntervalMs, opts.timeoutMs);
                base_1.Log.terminateProgress(progress);
            }
            catch (ex) {
                throw ex;
            }
        });
    }
    start(imageName, opts, command, extraOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            let containerName = (opts && opts.name) ? opts.name : imageName;
            let progress = base_1.Log.infoProgress(this.isDebug, `Checking if container "${containerName}" needs to be started`);
            try {
                let status = yield this.runWithoutDebugOnce(this.status(containerName));
                if (status === undefined) {
                    progress = base_1.Log.terminateProgress(progress).infoProgress(this.isDebug, `Creating and starting container "${containerName}"`);
                    return yield startContainer(containerName, progress);
                }
                else if (status === 'Created') {
                    if (extraOpts && extraOpts.startFresh) {
                        progress = base_1.Log.terminateProgress(progress).infoProgress(this.isDebug, `Container needs to be re-created`);
                        return yield removeAndStart(containerName, progress);
                    }
                    else {
                        progress = base_1.Log.terminateProgress(progress)
                            .infoProgress(this.isDebug, `Container "${containerName}" exists, but not started - starting now.`);
                        return yield startContainer(containerName, progress);
                    }
                }
                else if (status.indexOf('Up') === 0) {
                    if (extraOpts && extraOpts.startFresh) {
                        progress = base_1.Log.terminateProgress(progress).infoProgress(this.isDebug, `Container needs to be re-created`);
                        return yield removeAndStart(containerName, progress);
                    }
                    else {
                        base_1.Log.terminateProgress(progress).info(`Container "${containerName}"" already started.`);
                        return true;
                    }
                }
                else if (status.indexOf('Exited') === 0) {
                    if (extraOpts && extraOpts.startFresh) {
                        base_1.Log.terminateProgress(progress).info(`Container needs to be re-created`);
                        return yield removeAndStart(containerName, progress);
                    }
                    else {
                        base_1.Log.terminateProgress(progress).info(`Container "${containerName}"" exists but is not started. Starting now.`);
                        yield base_1.runWithoutDebug(`docker start ${containerName}`, this.machineName);
                        return false;
                    }
                }
                else {
                    base_1.Log.terminateProgress(progress);
                    throw new Error(`Could not start container ${containerName}. Status was "${status}". Should never hit this.`);
                }
            }
            catch (ex) {
                base_1.Log.terminateProgress(progress);
                throw ex;
            }
            function removeAndStart(containerName, progress) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield self.remove(containerName);
                        return yield startContainer(containerName, progress);
                    }
                    catch (ex) {
                        throw ex;
                    }
                });
            }
            function startContainer(containerName, progress) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
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
                        yield base_1.run(c, self.machineName, self.isDebug);
                        base_1.Log.terminateProgress(progress).info(`Container "${containerName}" started.`);
                        return false;
                    }
                    catch (ex) {
                        base_1.Log.terminateProgress(progress);
                        throw ex;
                    }
                });
            }
        });
    }
    remove(containerName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let c = `docker rm -f ${containerName}`;
                yield base_1.run(c, this.machineName, this.isDebug);
            }
            catch (ex) {
                throw ex;
            }
        });
    }
    status(containerName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let c = `docker ps -a --filter name=${containerName} --format "table {{.Names}}\t{{.Status}}"`;
                let res = yield base_1.run(c, this.machineName, this.isDebug);
                let json = base_1.resToJSON(res);
                let status;
                for (var i = 0, l = json.length; i < l; i++) {
                    if (json[i]['NAMES'] === containerName) {
                        status = json[i]['STATUS'];
                        break;
                    }
                }
                return status;
            }
            catch (ex) {
                throw ex;
            }
        });
    }
}
exports.Container = Container;
