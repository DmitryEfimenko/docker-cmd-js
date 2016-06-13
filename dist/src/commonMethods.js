"use strict";
var Q = require('q');
var base_1 = require('./base');
var CommonMethods = (function () {
    function CommonMethods() {
    }
    CommonMethods.prototype.runWithoutDebugOnce = function (promise) {
        return Q.Promise(function (resolve, reject) {
            var _d = base_1.Opts.debug;
            base_1.Opts.debug = false;
            promise.then(function (val) {
                base_1.Opts.debug = _d;
                resolve(val);
            }, function (err) {
                base_1.Opts.debug = _d;
                reject(err);
            });
        });
    };
    return CommonMethods;
}());
exports.CommonMethods = CommonMethods;
