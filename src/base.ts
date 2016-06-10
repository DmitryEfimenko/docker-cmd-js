import * as Q from 'q';
import colors = require('colors');
import { spawn, spawnSync, RunResult } from './childProcessHelpers';

export function run(command: string, _debug: boolean, noNewLines?: boolean): Q.Promise<string> {
    if (_debug) Log.info('Running:', command);

    let deferred = Q.defer<string>();
    spawn(command, process.env, _debug, (result) => {
        if (_debug) {
            if (result.stdErr) {
                Log.err('command finnished with errors.')
                if (result.stdErr.toLowerCase().indexOf('no space left on device') > -1) {
                    this.checkForDanglingImages(() => {
                        if (result.stdErr) deferred.reject(result.stdErr);
                        else deferred.resolve(result.stdOut);
                    });
                } else {
                    deferred.reject(result.stdErr);
                }
            } else
                deferred.resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
        } else {
            if (result.stdErr) deferred.reject(result.stdErr);
            else deferred.resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
        }
    });
    return deferred.promise;
}

export function runSync(command: string, _debug: boolean) { 
    if (_debug) Log.info('Running:', command);
    
    return spawnSync(command, process.env, _debug);
}

export function runWithoutDebug(command: string, noNewLines?: boolean) {
    return Q.Promise<string>((resolve, reject) => {
        run(command, false, noNewLines)
            .then(resolve, reject);
    });
}

export function addOpt(command: string, optionName: string, optionVal?: string|string[]|boolean) {
    if (optionVal != undefined) {
        if (optionVal instanceof Array) {
            for (let i = 0, l = optionVal.length; i < l; i++) {
                command += ` ${optionName} ${optionVal[i]}`;
            }
        } else if (typeof optionVal === 'boolean') {
            command += ` ${optionName}`;
        } else {
            command += ` ${optionName} ${optionVal}`;
        }
    } else {
        command += ` ${optionName}`;
    }
    return command;
}

export function addOpts(command: string, opts: any) {
    for (let prop in opts) {
        let optName = getOptionName(prop);
        if (opts[prop] != undefined) {
            command = addOpt(command, optName, opts[prop]);
        } else {
            command = addOpt(command, optName);
        }
    }
    return command;
}

function getOptionName(opt: string) {
    let arr = opt.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);
    arr.forEach((v, i, arr) => { arr[i] = arr[i].toLowerCase() });
    return '--' + arr.join('-');
}

export function resToJSON(s: string): any[] {
    let lines = s.split('\n').filter((val) => val != '');
    let headerLine = lines.shift();
    let arr = headerLine.split(' ');
    let cols: { name: string, length: number }[] = [];
    for (let i = 0, l = arr.length; i < l; i++) {
        if (arr[i] !== '') {
            let col = { name: arr[i], length: arr[i].length };
            if (arr[i + 1] != undefined && arr[i + 1] != '') {
                col.name = col.name + ' ' + arr[i + 1];
                col.length = col.length + arr[i + 1].length + 1;
                i = i + 1;
            }
            cols.push(col);
        } else {
            cols[cols.length - 1].length = cols[cols.length - 1].length + 1;
        }
    }

    let result = [];
    for (let i = 0, l = lines.length; i < l; i++) {
        let obj = {};
        for (let c = 0, cl = cols.length; c < cl; c++) {
            obj[cols[c].name] = lines[i].substring(0, cols[c].length + 1).trim();
            lines[i] = lines[i].substring(cols[c].length + 1, lines[i].length - 1);
        }
        result.push(obj);
    }
    return result;
}

export class Log {
    static success(...message: string[]) {
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.green(message.join(' ')));
    }

    static err(...message: string[]) {
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.red(message.join(' ')));
    }

    static info(...message: string[]) { 
        process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.cyan(message.join(' ')));
    }

    static infoProgress(...message: string[]) {
        let c = '\\';
        let interval = setInterval(() => {
            if (c == '\\') c = '/';
            else if (c == '/') c = '-';
            else if (c == '-') c = '\\';
            process.stdout.write(`${colors.bgBlue.white('VM')} - ${colors.cyan(message.join(' '))} ${c}\r`);
        }, 1000)
        return interval;
    }

    static terminateInterval(interval: NodeJS.Timer) {
        process.stdout.write(`\n`);
        clearInterval(interval);
        return this;
    }
}