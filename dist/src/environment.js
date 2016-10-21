"use strict";
const childProcessHelpers_1 = require('./childProcessHelpers');
function setEnvironment(machineName) {
    let envTxt = childProcessHelpers_1.spawnSync(`docker-machine env ${machineName} --shell cmd`, process.env, false).stdOut;
    let lines = envTxt.split('\n');
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
    let kvp = line.split('=');
    process.env[kvp[0]] = kvp[1];
}
