"use strict";
var Q = require('q');
var Debuggable = (function () {
    function Debuggable(_debug) {
        this._debug = _debug;
    }
    Debuggable.prototype.debug = function (debugging) {
        this._debug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    };
    Debuggable.prototype.runWithoutDebugOnce = function (promise) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            var _d = _this._debug;
            _this._debug = false;
            promise.then(function (val) {
                _this._debug = _d;
                resolve(val);
            }, function (err) {
                _this._debug = _d;
                reject(err);
            });
        });
    };
    return Debuggable;
}());
exports.Debuggable = Debuggable;
