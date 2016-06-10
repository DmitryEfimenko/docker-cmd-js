"use strict";
var Q = require('q');
var colors = require('colors');
var childProcessHelpers_1 = require('./childProcessHelpers');
function run(command, _debug, noNewLines) {
    var _this = this;
    if (_debug)
        Log.info('Running:', command);
    var deferred = Q.defer();
    childProcessHelpers_1.spawn(command, process.env, _debug, function (result) {
        if (_debug) {
            if (result.stdErr) {
                Log.err('command finnished with errors.');
                if (result.stdErr.toLowerCase().indexOf('no space left on device') > -1) {
                    _this.checkForDanglingImages(function () {
                        if (result.stdErr)
                            deferred.reject(result.stdErr);
                        else
                            deferred.resolve(result.stdOut);
                    });
                }
                else {
                    deferred.reject(result.stdErr);
                }
            }
            else
                deferred.resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
        }
        else {
            if (result.stdErr)
                deferred.reject(result.stdErr);
            else
                deferred.resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
        }
    });
    return deferred.promise;
}
exports.run = run;
function runSync(command, _debug) {
    if (_debug)
        Log.info('Running:', command);
    return childProcessHelpers_1.spawnSync(command, process.env, _debug);
}
exports.runSync = runSync;
function runWithoutDebug(command, noNewLines) {
    return Q.Promise(function (resolve, reject) {
        run(command, false, noNewLines)
            .then(resolve, reject);
    });
}
exports.runWithoutDebug = runWithoutDebug;
function addOpt(command, optionName, optionVal) {
    if (optionVal != undefined) {
        if (optionVal instanceof Array) {
            for (var i = 0, l = optionVal.length; i < l; i++) {
                command += " " + optionName + " " + optionVal[i];
            }
        }
        else if (typeof optionVal === 'boolean') {
            command += " " + optionName;
        }
        else {
            command += " " + optionName + " " + optionVal;
        }
    }
    else {
        command += " " + optionName;
    }
    return command;
}
exports.addOpt = addOpt;
function addOpts(command, opts) {
    for (var prop in opts) {
        var optName = getOptionName(prop);
        if (opts[prop] != undefined) {
            command = addOpt(command, optName, opts[prop]);
        }
        else {
            command = addOpt(command, optName);
        }
    }
    return command;
}
exports.addOpts = addOpts;
function getOptionName(opt) {
    var arr = opt.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);
    arr.forEach(function (v, i, arr) { arr[i] = arr[i].toLowerCase(); });
    return '--' + arr.join('-');
}
function resToJSON(s) {
    var lines = s.split('\n').filter(function (val) { return val != ''; });
    var headerLine = lines.shift();
    var arr = headerLine.split(' ');
    var cols = [];
    for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] !== '') {
            var col = { name: arr[i], length: arr[i].length };
            if (arr[i + 1] != undefined && arr[i + 1] != '') {
                col.name = col.name + ' ' + arr[i + 1];
                col.length = col.length + arr[i + 1].length + 1;
                i = i + 1;
            }
            cols.push(col);
        }
        else {
            cols[cols.length - 1].length = cols[cols.length - 1].length + 1;
        }
    }
    var result = [];
    for (var i = 0, l = lines.length; i < l; i++) {
        var obj = {};
        for (var c = 0, cl = cols.length; c < cl; c++) {
            obj[cols[c].name] = lines[i].substring(0, cols[c].length + 1).trim();
            lines[i] = lines[i].substring(cols[c].length + 1, lines[i].length - 1);
        }
        result.push(obj);
    }
    return result;
}
exports.resToJSON = resToJSON;
var Log = (function () {
    function Log() {
    }
    Log.success = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.green(message.join(' ')));
        this.newLine();
    };
    Log.err = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.red(message.join(' ')));
        this.newLine();
    };
    Log.info = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.cyan(message.join(' ')));
        this.newLine();
    };
    Log.infoProgress = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        var c = '\\';
        var m = colors.bgBlue.white('VM') + " - " + colors.cyan(message.join(' '));
        process.stdout.write(m + " " + c + "\r");
        var interval = setInterval(function () {
            if (c == '\\')
                c = '/';
            else if (c == '/')
                c = '-';
            else if (c == '-')
                c = '\\';
            process.stdout.write(m + " " + c + "\r");
        }, 300);
        return { interval: interval, message: m };
    };
    Log.terminateProgress = function (progress) {
        clearInterval(progress.interval);
        process.stdout.clearLine();
        process.stdout.write(progress.message);
        this.newLine();
        return this;
    };
    Log.newLine = function () {
        process.stdout.write("\n");
    };
    return Log;
}());
exports.Log = Log;
