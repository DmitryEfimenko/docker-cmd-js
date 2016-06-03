import child_process = require('child_process');
import colors = require('colors');

var spawnSync = child_process.spawnSync;
var spawn = child_process.spawn;

export class Docker {
    private _debug: boolean;
    constructor(public machineName?: string) {
        if (!this.machineName) this.machineName = 'default';
    }

    debug() {
        this._debug = true;
        return this;
    }

    run(command: string, cb: (err: string, result: string)=> void): void {
        if (this._debug)
            console.log(colors.america('Running: ' + command));
        
        this.spawn(command, this.getEnvironmentObject(), (result) => { 
            if (this._debug) {
                if (result.stdErr) {
                    process.stdout.write(colors.red('command finnished with errors. Checking if docker machine got into error state...'));
                    
                }
                else process.stdout.write(result.stdOut);
            }
            cb(result.stdErr, result.stdOut);
        });
    }
    
    private spawn(command: string, env: any, cb: (result: RunResult)=> void) {
        let items = command.split(' ');
        //var items = command.match(/[\w-=:]+|"(?:\\"|[^"])+"/g); // in case we need to have quoted args
        //console.dir(items);

        let r = spawn(items[0], items.slice(1), { env: env });
        let result = { stdOut: '', stdErr: '' };
        
        r.stdout.on('data', (data) => {
            result.stdOut = result.stdOut + data.toString();
            process.stdout.write(data.toString());
        });

        r.stderr.on('data', (data) => {
            result.stdErr = result.stdErr + data.toString();
            process.stdout.write(colors.red(`stderr: ${data.toString()}`));
        });

        r.on('error', (err) => {
            process.stdout.write('Failed to start command');
        });

        r.on('close', (code) => {
            //console.log(`command exited with code ${code}`);
            cb(result);
        });
    }

    private spawnSync(command: string, env ?: any): RunResult {
        let items = command.split(' ');
        //var items = command.match(/[\w-=:]+|"(?:\\"|[^"])+"/g); // in case we need to have quoted args
        //console.dir(items);

        let r = spawnSync(items[0], items.slice(1), { env: env });
        return {
            stdOut: r.stdout.toString(),
            stdErr: r.stderr.toString()
        };
    }

    private static envObj : any;    
    private getEnvironmentObject() {
        if (Docker.envObj)
            return Docker.envObj;
        const env = process.env;
        const envTxt = this.spawnSync(`docker-machine env ${this.machineName} --shell cmd`, env).stdOut;
        const lines = envTxt.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (!this.isEnvironmentVariableLine(lines[i]))
                continue;
            this.addEnvironmentKeyValueToObject(lines[i], env);
        }
        Docker.envObj = env;
        return env;
    }

    private isEnvironmentVariableLine(line: string): boolean {
        return line.indexOf('SET') === 0;
    }

    private addEnvironmentKeyValueToObject(line: string, obj: any): void {
        line = line.substr(4);
        let kvp = line.split('=');
        obj[kvp[0]] = kvp[1];
    }
    
    private log(text: string): void {
        console.log(`\x1b[36m${text}\x1b[0m`);
    }
}

export interface RunResult {
    stdOut: string;
    stdErr: string;
}