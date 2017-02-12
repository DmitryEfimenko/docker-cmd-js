"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class CommonMethods {
    constructor(machineName) {
        this.machineName = machineName;
    }
    debug(debugging) {
        this.isDebug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    }
    runWithoutDebugOnce(promise) {
        return __awaiter(this, void 0, void 0, function* () {
            let _d = this.isDebug;
            try {
                this.isDebug = false;
                let val = yield promise;
                this.isDebug = _d;
                return val;
            }
            catch (ex) {
                this.isDebug = _d;
                throw ex;
            }
        });
    }
}
exports.CommonMethods = CommonMethods;
