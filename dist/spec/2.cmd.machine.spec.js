"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('cmd.machine', function () {
    var cmd;
    var machineName = 'docker-cmd-js-test';
    beforeAll(function () {
        cmd = new docker_cmd_js_1.Cmd(machineName);
    });
    it('status()', function (done) {
        cmd.machine.status().then(function (status) {
            expect(status).toBe('Running');
            done();
        }, function (err) {
            done.fail(err);
        });
    });
    it('ipAddress()', function (done) {
        cmd.machine.ipAddress().then(function (ipAddress) {
            expect(ipAddress).toBeDefined();
            expect(cmd.machine._ipAddress).toBe(ipAddress);
            done();
        }, function (err) {
            done.fail(err);
        });
    });
});
