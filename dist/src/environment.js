"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childProcessHelpers_1 = require("./childProcessHelpers");
function setEnvironment(machineName) {
    const envTxt = childProcessHelpers_1.spawnSync(`docker-machine env ${machineName} --shell cmd`, process.env, false).stdOut;
    const lines = envTxt.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (!isEnvironmentVariableLine(lines[i])) {
            continue;
        }
        addEnvironmentKeyValueToObject(lines[i]);
    }
}
exports.setEnvironment = setEnvironment;
function isEnvironmentVariableLine(line) {
    return line.indexOf('SET') === 0;
}
function addEnvironmentKeyValueToObject(line) {
    line = line.substr(4);
    const kvp = line.split('=');
    process.env[kvp[0]] = kvp[1];
}
