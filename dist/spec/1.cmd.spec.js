"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('Cmd()', function () {
    var cmd;
    it('should set up Env', function () {
        cmd = new docker_cmd_js_1.Cmd();
        expect(process.env['DOCKER_TLS_VERIFY']).toBeDefined();
        expect(process.env['DOCKER_HOST']).toBeDefined();
        expect(process.env['DOCKER_CERT_PATH']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBe('default');
    });
    it('run()', function (done) {
        cmd.run('docker-machine status').then(function (status) {
            expect(status).toBe('Running\n');
            done();
        }, function (err) { done.fail(err); });
    });
    it('run() without new lines', function (done) {
        cmd.run('docker-machine status', true).then(function (status) {
            expect(status).toBe('Running');
            done();
        }, function (err) { done.fail(err); });
    });
    it('runSync()', function () {
        var status = cmd.runSync('docker-machine status');
        expect(status.stdOut).toBe('Running\n');
        expect(status.stdErr).toBe('');
    });
    it('resToJSON()', function (done) {
        cmd.run('docker images').then(function (res) {
            var images = cmd.resToJSON(res);
            expect(images.length).toBeGreaterThan(0);
            expect(images[0]['REPOSITORY']).toBeDefined();
            expect(images[0]['TAG']).toBeDefined();
            expect(images[0]['IMAGE ID']).toBeDefined();
            expect(images[0]['CREATED']).toBeDefined();
            expect(images[0]['SIZE']).toBeDefined();
            done();
        }, function (err) { done.fail(err); });
    });
});
