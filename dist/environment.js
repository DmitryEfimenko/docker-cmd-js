"use strict";
var childProcessHelpers_1 = require('./childProcessHelpers');
function setEnvironment(machineName) {
    var envTxt = childProcessHelpers_1.spawnSync("docker-machine env " + machineName + " --shell cmd", process.env).stdOut;
    var lines = envTxt.split('\n');
    for (var i = 0; i < lines.length; i++) {
        if (!isEnvironmentVariableLine(lines[i]))
            continue;
        addEnvironmentKeyValueToObject(lines[i]);
    }
}
exports.setEnvironment = setEnvironment;
function isEnvironmentVariableLine(line) {
    return line.indexOf('SET') === 0;
}
function addEnvironmentKeyValueToObject(line) {
    line = line.substr(4);
    var kvp = line.split('=');
    process.env[kvp[0]] = kvp[1];
}
