"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
delete require.cache[require.resolve('../docker-cmd-js')];
var docker_cmd_js_1 = require("../docker-cmd-js");
var const_1 = require("./helpers/const");
describe('cmd.machine', function () {
    var cmd;
    beforeAll(function () {
        cmd = new docker_cmd_js_1.Cmd(const_1.machineName);
    });
    it('remove()', function (done) {
        cmd.machine.remove().then(function () {
            cmd.machine.status().then(function (status) {
                expect(status).toBe("Host does not exist: \"" + const_1.machineName + "\"");
                done();
            }, function (err) { done.fail(err); });
        }, function (err) { done.fail(err); });
    }, 3 * 60 * 1000);
});
