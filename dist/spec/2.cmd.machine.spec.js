"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('cmd.machine', function () {
    var cmd;
    beforeAll(function () {
        cmd = new docker_cmd_js_1.Cmd();
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
            done();
        }, function (err) {
            done.fail(err);
        });
    });
});
