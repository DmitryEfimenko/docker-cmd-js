import colors = require('colors');
import { spawn, spawnSync, IRunResult } from './childProcessHelpers';
import { setEnvironment } from './environment';

export function run(command: string, machineName: string, _debug: boolean, noNewLines?: boolean): Promise<string> {
  _debug = _debug !== undefined ? _debug : false;
  if (_debug) {
    Log.info('Running:', command);
  }

  return new Promise<string>((resolve, reject) => {

    setEnvironment(machineName);

    spawn(command, process.env, _debug, (result) => {
      if (_debug) {
        if (result.stdErr) {
          Log.err('command finnished with errors.');
          if (result.stdErr.toLowerCase().indexOf('no space left on device') > -1) {
            this.checkForDanglingImages(() => {
              if (result.stdErr) {
                reject(result.stdErr);
              } else {
                resolve(result.stdOut);
              }
            });
          } else {
            reject(result.stdErr);
          }
        } else {
          resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
        }
      } else {
        if (result.stdErr) {
          reject(result.stdErr);
        } else {
          resolve(noNewLines ? result.stdOut.replace(/(\r\n|\n|\r)/gm, '') : result.stdOut);
        }
      }
    });
  });
}

export function runSync(command: string, machineName: string, _debug: boolean) {
  if (_debug) {
    Log.info('Running:', command);
  }

  return spawnSync(command, process.env, _debug);
}

export function runWithoutDebug(command: string, machineName: string, noNewLines?: boolean) {
  return run(command, machineName, false, noNewLines);
}

export function addOpt(command: string, optionName: string, optionVal?: string | string[] | boolean) {
  if (optionVal !== undefined) {
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
  for (const prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      const optName = getOptionName(prop);
      if (opts[prop] !== undefined) {
        command = addOpt(command, optName, opts[prop]);
      } else {
        command = addOpt(command, optName);
      }
    }
  }
  return command;
}

function getOptionName(opt: string) {
    const arr = opt.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);
    arr.forEach((v, i, a) => { a[i] = a[i].toLowerCase(); });
    return '--' + arr.join('-');
}

export function resToJSON(s: string): any[] {
  const lines = s.split('\n').filter((val) => val !== '');
  const headerLine = lines.shift();
  const arr = headerLine.split(' ');
  const cols: { name: string, length: number }[] = [];
  for (let i = 0, l = arr.length; i < l; i++) {
    if (arr[i] !== '') {
      const col = { name: arr[i], length: arr[i].length };
      if (arr[i + 1] !== undefined && arr[i + 1] !== '') {
        col.name = col.name + ' ' + arr[i + 1];
        col.length = col.length + arr[i + 1].length + 1;
        i = i + 1;
      }
      cols.push(col);
    } else {
      cols[cols.length - 1].length = cols[cols.length - 1].length + 1;
    }
  }

  const result = [];
  for (let i = 0, l = lines.length; i < l; i++) {
    const obj = {};
    for (let c = 0, cl = cols.length; c < cl; c++) {
      if (c === cols.length - 1) {
        // last col
        obj[cols[c].name] = lines[i].trim();
      } else {
        obj[cols[c].name] = lines[i].substring(0, cols[c].length + 1).trim();
        lines[i] = lines[i].substring(cols[c].length + 1, lines[i].length);
      }
    }
    result.push(obj);
  }
  return result;
}

export class Log {
  static success(...message: string[]) {
    process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.green(message.join(' ')));
    this.newLine();
  }

  static err(...message: string[]) {
    process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.red(message.join(' ')));
    this.newLine();
  }

  static info(...message: string[]) {
    process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.cyan(message.join(' ')));
    this.newLine();
  }

  static warn(...message: string[]) {
    process.stdout.write(colors.bgBlue.white('VM') + ' - ' + colors.yellow(message.join(' ')));
    this.newLine();
  }

  static debug(...message: string[]) {
    process.stdout.write(colors.bgBlue.white('VM-debug') + ' - ' + colors.yellow(message.join(' ')));
    this.newLine();
  }

  static infoProgress(debug: boolean, ...message: string[]): IProgress {
    let c = '\\';
    const m = `${colors.bgBlue.white('VM')} - ${colors.cyan(message.join(' '))}`;

    if (!debug) {
      process.stdout.write(`${m} ${c}\r`);
      const interval = setInterval(() => {
        if (c === '\\') {
          c = '/';
        } else if (c === '/') {
          c = '-';
        } else if (c === '-') {
          c = '\\';
        }
        process.stdout.write(`${m} ${c}\r`);
      }, 300);
      return { interval, message: m };
    } else {
      process.stdout.write(m);
      return { interval: undefined, message: m };
    }
  }

  static terminateProgress(progress: IProgress) {
    if (progress.interval) { clearInterval(progress.interval); }
    (process.stdout as any).clearLine();
    process.stdout.write(progress.message + ' - done');
    this.newLine();
    return this;
  }

  private static newLine() {
    process.stdout.write(`\n`);
  }
}

export interface IProgress {
  interval: NodeJS.Timer;
  message: string;
}
