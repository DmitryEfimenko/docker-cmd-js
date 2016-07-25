"use strict";
var Q = require('q');
var CommonMethods = (function () {
    function CommonMethods(machineName) {
        this.machineName = machineName;
    }
    CommonMethods.prototype.debug = function (debugging) {
        this.isDebug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    };
    CommonMethods.prototype.runWithoutDebugOnce = function (promise) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var _d = _this.isDebug;
            _this.isDebug = false;
            promise.then(function (val) {
                _this.isDebug = _d;
                resolve(val);
            }, function (err) {
                _this.isDebug = _d;
                reject(err);
            });
        });
    };
    return CommonMethods;
}());
exports.CommonMethods = CommonMethods;
