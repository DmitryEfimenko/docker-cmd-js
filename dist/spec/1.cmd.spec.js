"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('Cmd()', function () {
    var cmd;
    var machineName = 'docker-cmd-js-test';
    beforeAll(function (done) {
        cmd = new docker_cmd_js_1.Cmd(machineName);
        cmd.machine.start().then(function () { done(); }, function (err) { done.fail(err); });
    }, 5 * 60 * 1000);
    it('should set up Env', function () {
        expect(process.env['DOCKER_TLS_VERIFY']).toBeDefined();
        expect(process.env['DOCKER_HOST']).toBeDefined();
        expect(process.env['DOCKER_CERT_PATH']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBe(machineName);
    });
    it('run()', function (done) {
        cmd.run("docker-machine status " + machineName).then(function (status) {
            expect(status).toBe("Running\n");
            done();
        }, function (err) { done.fail(err); });
    });
    it('run() without new lines', function (done) {
        cmd.run("docker-machine status " + machineName, true).then(function (status) {
            expect(status).toBe('Running');
            done();
        }, function (err) { done.fail(err); });
    });
    it('runSync()', function () {
        var status = cmd.runSync("docker-machine status " + machineName);
        expect(status.stdOut).toBe('Running\n');
        expect(status.stdErr).toBe('');
    });
    it('run() command with quotes', function (done) {
        cmd.run('docker ps -a -f name=docker --format "table {{.Names}}\t{{.Status}}"').then(function (res) { done(); }, function (err) { done.fail(err); });
    });
});
