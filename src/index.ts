var spawnSync = require('child_process').spawnSync;

export class Docker {
    private _debug: boolean;
    constructor(public machineName?: string) {
        if (!this.machineName) this.machineName = 'default';
    }

    debug() {
        this._debug = true;
        return this;
    }

    run(command: string): RunResult {
        if (this._debug)
            this.log('Running: ' + command);
        let result = this.spawn(command, this.getEnvironmentObject());
        if (this._debug)
            console.dir(result);
        return result;
    }
    
    private spawn(command: string, env ?: any): RunResult {
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
        const envTxt = this.spawn(`docker-machine env --shell cmd ${this.machineName}`, env).stdOut;
        const lines = envTxt.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (!this.isEnvironmentVariableLine(lines[i]))
                continue;
            this.addEnvironmentKeyValueToObject(lines[i],env);
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