import child_process = require('child_process');
import colors = require('colors');
import inquirer = require('inquirer');
import Q = require('q');
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

    run(command: string): Q.Promise<string> {
        if (this._debug)
            console.log(colors.cyan('Running: ' + command));

        let deferred = Q.defer<string>();
        this.spawn(command, this.getEnvironmentObject(), (result) => { 
            if (this._debug) {
                if (result.stdErr) {
                    console.log(colors.red('command finnished with errors.'));
                    if (result.stdErr.indexOf('no space left on device') > -1) {
                        this.checkForDanglingImages(() => {
                            if (result.stdErr) deferred.reject(result.stdErr);
                            else deferred.resolve(result.stdOut);
                        });
                    } else {
                        console.log(colors.yellow('Checking if docker machine got into error state...'))
                        this.checkDockerMachineStatus(() => {
                            if (result.stdErr) deferred.reject(result.stdErr);
                            else deferred.resolve(result.stdOut);
                        });
                    }    
                } else
                    if (result.stdErr) deferred.reject(result.stdErr);
                    else deferred.resolve(result.stdOut);
            } else {
                if (result.stdErr) deferred.reject(result.stdErr);
                else deferred.resolve(result.stdOut);
            }    
        });
        return deferred.promise;
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

    private checkForDanglingImages(cb: () => void) {
        let _debug = this._debug;
        this._debug = false;
        this.run('docker images --filter dangling=true').then(
            (result) => {
                var images = this.resToJSON(result);
                if (images.length > 0) {
                    let promptOpts = {
                        type: 'list',
                        name: 'remove',
                        message: 'Found dangling images. Would you like to remove them?',
                        choices: ['Yes', 'No']
                    };
                    inquirer.prompt(promptOpts).then((answers: any) => {
                        if (answers.remove == 'Yes') {
                            let promises = [];
                            for (var i = 0, l = images.length; i < l; i++) {
                                let p = this.run(`docker rmi ${images[i]['IMAGE ID']}`);
                                promises.push(p);
                            }
                            Q.all(promises).then(
                                () => {
                                    console.log(colors.green('Cleaned up dangling images. Try running your command again.'));
                                    this._debug = _debug;
                                    cb();
                                },
                                (err) => { console.log(colors.red('could not clean up dangling images:'), err); }
                            );
                        } else {
                            cb();
                        }
                    });
                } else {
                    cb();
                }
            },
            (err) => { console.log(colors.red('could not check for dangling images:'), err); }
        );
    }

    private checkDockerMachineStatus(cb: () => void) {
        this.run('docker-machine status').then(
            (result) => {
                console.log(result);
                if (result != 'Running') {
                    console.log('TODO');
                }
                cb();
            },
            (err) => { console.log(colors.red('could not get docket-machine status:'), err); }
        );
    }

    resToJSON(s: string): any[] {
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
}

export interface RunResult {
    stdOut: string;
    stdErr: string;
}