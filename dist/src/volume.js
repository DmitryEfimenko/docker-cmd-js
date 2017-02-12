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
const commonMethods_1 = require('./commonMethods');
class Volume extends commonMethods_1.CommonMethods {
    constructor(machineName) {
        super(machineName);
    }
    create(opts, advOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (advOpts && advOpts.createOnlyIfMissing) {
                    if (!opts || !opts.name) {
                        throw new Error('You must specify name when using "createOnlyIfMissing" option.');
                    }
                    let res = yield this.runWithoutDebugOnce(this.inspect(opts.name));
                    if (res.length > 0) {
                        return res[0].Name;
                    }
                    else {
                        return yield this.runCreate(opts);
                    }
                }
                else {
                    return yield this.runCreate(opts);
                }
            }
            catch (ex) {
                throw ex;
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
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let res = yield base_1.run(`docker volume inspect ${volumeName}`, this.machineName, this.isDebug);
                let json = JSON.parse(res);
                return json;
            }
            catch (ex) {
                if (ex === `Error: No such volume: ${volumeName}\n`) {
                    return [];
                }
                else {
                    throw ex;
                }
            }
        });
    }
    remove(volumeName) {
        return base_1.run(`docker volume rm ${volumeName}`, this.machineName, this.isDebug);
    }
}
exports.Volume = Volume;
