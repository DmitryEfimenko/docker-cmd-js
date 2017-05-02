"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("colors");
const childProcessHelpers_1 = require("./childProcessHelpers");
const environment_1 = require("./environment");
function run(command, machineName, _debug, noNewLines) {
    _debug = _debug !== undefined ? _debug : false;
    if (_debug) {
        Log.info('Running:', command);
    }
    return new Promise((resolve, reject) => {
        environment_1.setEnvironment(machineName);
        childProcessHelpers_1.spawn(command, process.env, _debug, (result) => {
            if (_debug) {
                if (result.stdErr) {
                    Log.err('command finnished with errors.');
                    if (result.stdErr.toLowerCase().indexOf('no space left on device') > -1) {
                        this.checkForDanglingImages(() => {
                            if (result.stdErr) {
                                reject(result.stdErr);
                            }
                            else {
                                resolve(result.stdOut);
                            }
                        });
                    }
                    else {
                        reject(result.stdErr);
                    }
                }
                else {
                    resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
                }
            }
            else {
                if (result.stdErr) {
                    reject(result.stdErr);
                }
                else {
                    resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
                }
            }
        });
    });
}
exports.run = run;
function runSync(command, machineName, _debug) {
    if (_debug) {
        Log.info('Running:', command);
    }
    return childProcessHelpers_1.spawnSync(command, process.env, _debug);
}
exports.runSync = runSync;
function runWithoutDebug(command, machineName, noNewLines) {
    return run(command, machineName, false, noNewLines);
}
exports.runWithoutDebug = runWithoutDebug;
function addOpt(command, optionName, optionVal) {
    if (optionVal !== undefined) {
        if (optionVal instanceof Array) {
            for (let i = 0, l = optionVal.length; i < l; i++) {
                command += ` ${optionName} ${optionVal[i]}`;
            }
        }
        else if (typeof optionVal === 'boolean') {
            command += ` ${optionName}`;
        }
        else {
            command += ` ${optionName} ${optionVal}`;
        }
    }
    else {
        command += ` ${optionName}`;
    }
    return command;
}
exports.addOpt = addOpt;
function addOpts(command, opts) {
    for (const prop in opts) {
        if (opts.hasOwnProperty(prop)) {
            const optName = getOptionName(prop);
            if (opts[prop] !== undefined) {
                command = addOpt(command, optName, opts[prop]);
            }
            else {
                command = addOpt(command, optName);
            }
        }
    }
    return command;
}
exports.addOpts = addOpts;
function getOptionName(opt) {
    const arr = opt.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);
    arr.forEach((v, i, a) => { a[i] = a[i].toLowerCase(); });
    return '--' + arr.join('-');
}
function resToJSON(s) {
    const lines = s.split('\n').filter((val) => val !== '');
    const headerLine = lines.shift();
    const arr = headerLine.split(' ');
    const cols = [];
    for (let i = 0, l = arr.length; i < l; i++) {
        if (arr[i] !== '') {
            const col = { name: arr[i], length: arr[i].length };
            if (arr[i + 1] !== undefined && arr[i + 1] !== '') {
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
    const result = [];
    for (let i = 0, l = lines.length; i < l; i++) {
        const obj = {};
        for (let c = 0, cl = cols.length; c < cl; c++) {
            if (c === cols.length - 1) {
                obj[cols[c].name] = lines[i].trim();
            }
            else {
                obj[cols[c].name] = lines[i].substring(0, cols[c].length + 1).trim();
                lines[i] = lines[i].substring(cols[c].length + 1, lines[i].length);
            }
        }
        result.push(obj);
    }
    return result;
}
exports.resToJSON = resToJSON;
class Log {
    static success(...message) {
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.green(message.join(' ')));
        this.newLine();
    }
    static err(...message) {
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.red(message.join(' ')));
        this.newLine();
    }
    static info(...message) {
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.cyan(message.join(' ')));
        this.newLine();
    }
    static warn(...message) {
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.yellow(message.join(' ')));
        this.newLine();
    }
    static debug(...message) {
        process.stdout.write(colors.bgBlue.white('VM-debug') + ' - ' + colors.yellow(message.join(' ')));
        this.newLine();
    }
    static infoProgress(debug, ...message) {
        let c = '\\';
        const m = `${colors.bgBlue.white('VM')} - ${colors.cyan(message.join(' '))}`;
        if (!debug) {
            process.stdout.write(`${m} ${c}\r`);
            const interval = setInterval(() => {
                if (c === '\\') {
                    c = '/';
                }
                else if (c === '/') {
                    c = '-';
                }
                else if (c === '-') {
                    c = '\\';
                }
                process.stdout.write(`${m} ${c}\r`);
            }, 300);
            return { interval, message: m };
        }
        else {
            process.stdout.write(m);
            return { interval: undefined, message: m };
        }
    }
    static terminateProgress(progress) {
        if (progress.interval) {
            clearInterval(progress.interval);
        }
        process.stdout.clearLine();
        process.stdout.write(progress.message + ' - done');
        this.newLine();
        return this;
    }
    static newLine() {
        process.stdout.write(`\n`);
    }
}
exports.Log = Log;
