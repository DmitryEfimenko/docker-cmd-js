import { spawnSync } from './childProcessHelpers';

export function setEnvironment(machineName) {
    let envTxt = spawnSync(`docker-machine env ${machineName} --shell cmd`, process.env, false).stdOut;
    let lines = envTxt.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (!isEnvironmentVariableLine(lines[i])) {
            continue;
        }
        addEnvironmentKeyValueToObject(lines[i]);
    }
}

function isEnvironmentVariableLine(line: string): boolean {
    return line.indexOf('SET') === 0;
}

function addEnvironmentKeyValueToObject(line: string): void {
    line = line.substr(4);
    let kvp = line.split('=');
    process.env[kvp[0]] = kvp[1];
}
