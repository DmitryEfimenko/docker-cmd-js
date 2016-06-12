"use strict";
var Q = require('q');
var docker_cmd_js_1 = require('./docker-cmd-js');
var CommonMethods = (function () {
    function CommonMethods() {
    }
    CommonMethods.runWithoutDebugOnce = function (promise) {
        return Q.Promise(function (resolve, reject) {
            var _d = docker_cmd_js_1.Opts.debug;
            docker_cmd_js_1.Opts.debug = false;
            promise.then(function (val) {
                docker_cmd_js_1.Opts.debug = _d;
                resolve(val);
            }, function (err) {
                docker_cmd_js_1.Opts.debug = _d;
                reject(err);
            });
        });
    };
    return CommonMethods;
}());
exports.CommonMethods = CommonMethods;
