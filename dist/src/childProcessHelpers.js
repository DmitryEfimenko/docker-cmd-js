"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const colors = require("colors");
const base_1 = require("./base");
function spawn(command, env, debug, cb) {
    const items = command.match(/[^\s"']+|"[^"]*"|'[^']*/g);
    items.forEach((val, i, arr) => {
        if (val[0] === '"' && val[val.length - 1] === '"') {
            arr[i] = val.substr(1, val.length - 2);
        }
    });
    const r = child_process.spawn(items[0], items.slice(1), { env });
    const result = { stdOut: '', stdErr: '' };
    r.stdout.on('data', (data) => {
        result.stdOut = result.stdOut + data.toString();
        if (debug) {
            process.stdout.write(data.toString());
        }
    });
    r.stderr.on('data', (data) => {
        const errorsToSkip = [
            'SECURITY WARNING:',
            'Unable to use system certificate pool: crypto/x509: system root pool is not available on Windows'
        ];
        if (errorsToSkip.every(e => data.toString().indexOf(e) === -1)) {
            result.stdErr = result.stdErr + data.toString();
            if (debug) {
                base_1.Log.warn(`stderr: ${data.toString()}`);
            }
        }
    });
    r.on('error', (err) => {
        base_1.Log.err(`Failed to start command: ${command}. Error:`);
        if (err && err.message) {
            console.log(err);
        }
        else {
            process.stdout.write(err);
        }
    });
    r.on('close', (code) => {
        if (debug) {
            base_1.Log.info(`command exited with code ${code}`);
        }
        cb(result);
    });
}
exports.spawn = spawn;
function spawnSync(command, env, debug) {
    const items = command.match(/[^\s"']+|"[^"]*"|'[^']*/g);
    items.forEach((val, i, arr) => {
        if (val[0] === '"' && val[val.length - 1] === '"') {
            arr[i] = val.substr(1, val.length - 2);
        }
    });
    const r = child_process.spawnSync(items[0], items.slice(1), { env });
    if (debug) {
        if (r.stdout) {
            base_1.Log.info('stdout:');
            process.stdout.write(r.stdout.toString());
        }
        if (r.stderr) {
            base_1.Log.info('stderr:');
            process.stdout.write(colors.red(r.stderr.toString()));
        }
    }
    return {
        stdErr: r.stderr ? r.stderr.toString() : '',
        stdOut: r.stdout ? r.stdout.toString() : ''
    };
}
exports.spawnSync = spawnSync;
