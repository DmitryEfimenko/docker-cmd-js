"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const commonMethods_1 = require("./commonMethods");
const environment_1 = require("./environment");
class Machine extends commonMethods_1.CommonMethods {
    constructor(machineName) {
        super(machineName);
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield base_1.run(`docker-machine status ${this.machineName}`, this.machineName, this.isDebug, true);
            }
            catch (ex) {
                const validErr = `Host does not exist: "${this.machineName}"`;
                if (ex === `${validErr}\n`) {
                    return validErr;
                }
                else {
                    throw ex;
                }
            }
        });
    }
    ipAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ip = yield base_1.run(`docker-machine ip ${this.machineName}`, this.machineName, this.isDebug, true);
                this._ipAddress = ip;
                return ip;
            }
            catch (ex) {
                throw ex;
            }
        });
    }
    start(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.runWithoutDebugOnce(this.status());
                if (res === 'Stopped') {
                    const c = `docker-machine start ${this.machineName}`;
                    const resp = yield base_1.run(c, this.machineName, this.isDebug);
                }
                else if (res !== 'Running') {
                    return yield this.runStartMachine(opts);
                }
                else {
                    base_1.Log.info(`docker-machine [${this.machineName}] status:`, res);
                    return res;
                }
            }
            catch (ex) {
                if (ex.indexOf('machine does not exist') > -1) {
                    yield this.remove();
                }
                try {
                    return yield this.runStartMachine(opts);
                }
                catch (ex) {
                    throw ex;
                }
            }
        });
    }
    remove() {
        return base_1.run(`docker-machine rm -f ${this.machineName}`, this.machineName, this.isDebug);
    }
    runStartMachine(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let c = `docker-machine create`;
            if (!opts) {
                opts = {};
            }
            if (!opts.driver) {
                opts.driver = 'hyperv';
            }
            c = base_1.addOpts(c, opts);
            if (opts.driver === 'virtualbox') {
                if (!opts.virtualboxMemory) {
                    c = base_1.addOpt(c, '--virtualbox-memory', '6144');
                }
                if (!opts.virtualboxNoVtxCheck) {
                    c = base_1.addOpt(c, '--virtualbox-no-vtx-check');
                }
            }
            c += ` ${this.machineName}`;
            const progress = base_1.Log.infoProgress(this.isDebug, `Starting VM "${this.machineName}"`);
            try {
                const resp = yield base_1.run(c, this.machineName, this.isDebug);
                environment_1.setEnvironment(this.machineName);
                base_1.Log.terminateProgress(progress);
                return resp;
            }
            catch (ex) {
                base_1.Log.terminateProgress(progress);
                if (ex.indexOf('Host already exists') === 0) {
                    environment_1.setEnvironment(this.machineName);
                    return;
                }
                else {
                    throw ex;
                }
            }
        });
    }
}
exports.Machine = Machine;
