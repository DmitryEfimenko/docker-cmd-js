import child_process = require('child_process');
import colors = require('colors');
import { Log } from './base';

export function spawn(command: string, env, debug: boolean, cb: (result: RunResult) => void) {
    var items = command.match(/[^\s"']+|"[^"]*"|'[^']*/g); // in case we need to have quoted args
    items.forEach((val, i, arr) => {
        if (val[0] === '"' && val[val.length - 1] === '"') {
            arr[i] = val.substr(1, val.length - 2);
        }
    });

    let r = child_process.spawn(items[0], items.slice(1), { env: env });
    let result = { stdOut: '', stdErr: '' };

    r.stdout.on('data', (data) => {
        result.stdOut = result.stdOut + data.toString();
        if (debug) {
            process.stdout.write(data.toString());
        }
    });

    r.stderr.on('data', (data) => {
        if (data.indexOf('SECURITY WARNING:') === -1) {
            result.stdErr = result.stdErr + data.toString();
            if (debug) {
                Log.warn(`stderr: ${data.toString()}`);
            }
        }
    });

    r.on('error', (err) => {
        Log.err(`Failed to start command: ${command}`);
        process.stdout.write(err);
    });

    r.on('close', (code) => {
        if (debug) {
            Log.info(`command exited with code ${code}`);
        }
        cb(result);
    });
}

export function spawnSync(command: string, env, debug: boolean): RunResult {
    var items = command.match(/[^\s"']+|"[^"]*"|'[^']*/g); // in case we need to have quoted args
    items.forEach((val, i, arr) => {
        if (val[0] === '"' && val[val.length - 1] === '"') {
            arr[i] = val.substr(1, val.length - 2);
        }
    });

    let r = child_process.spawnSync(items[0], items.slice(1), { env: env });
    if (debug) {
        if (r.stdout) {
            Log.info('stdout:');
            process.stdout.write(r.stdout.toString());
        }
        if (r.stderr) {
            Log.info('stderr:');
            process.stdout.write(colors.red(r.stderr.toString()));
        }
    }
    return {
        stdOut: r.stdout.toString(),
        stdErr: r.stderr.toString()
    };
}

export interface RunResult {
    stdOut: string;
    stdErr: string;
}
