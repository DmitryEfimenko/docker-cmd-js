"use strict";
const Q = require('q');
class CommonMethods {
    constructor(machineName) {
        this.machineName = machineName;
    }
    debug(debugging) {
        this.isDebug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    }
    runWithoutDebugOnce(promise) {
        return Q.Promise((resolve, reject) => {
            let _d = this.isDebug;
            this.isDebug = false;
            promise.then((val) => {
                this.isDebug = _d;
                resolve(val);
            }, (err) => {
                this.isDebug = _d;
                reject(err);
            });
        });
    }
}
exports.CommonMethods = CommonMethods;
