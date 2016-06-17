"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('cmd.machine', function () {
    var cmd;
    var machineName = 'docker-cmd-js-test';
    beforeAll(function () {
        cmd = new docker_cmd_js_1.Cmd(machineName);
    });
    it('remove()', function (done) {
        cmd.machine.remove().then(function () {
            cmd.machine.status().then(function (status) {
                expect(status).toBe("Host does not exist: \"" + machineName + "\"");
                done();
            }, function (err) { done.fail(err); });
        }, function (err) { done.fail(err); });
    }, 3 * 60 * 1000);
});
